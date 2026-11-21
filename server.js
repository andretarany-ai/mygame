const path = require('path');
const os = require('os');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const { rounds, finals } = require('./questions');

const PORT = process.env.PORT || 3000;
const PLAYER_NAMES = ['Марина', 'Даша', 'Андрей', 'Сережа'];

// Времена (мс)
const T = {
  roundIntro: 4000,
  catChoose: 20000,
  buzz: 10000,
  answer: 25000,
  reveal: 5000,
  finalStake: 30000,
  finalAnswer: 45000,
};
const SCALE = Number(process.env.TIME_SCALE) || 1; // для тестов
for (const k in T) T[k] *= SCALE;
const readTime = (text) => Math.min(8000, 2000 + text.length * 45) * SCALE;

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'docs', 'img')));
const server = http.createServer(app);
const io = new Server(server);

const { checkAnswer, normalizeAnswer: normalize } = require('./answer-check');

// ---------- Состояние ----------
let players; // name -> { score, clientId, socketId, connected }
let state;
let timer = null;

function freshPlayers() {
  const p = {};
  for (const n of PLAYER_NAMES) p[n] = { score: 0, clientId: null, socketId: null, connected: false, joined: false };
  return p;
}

function buildBoard(roundIdx) {
  const r = rounds[roundIdx];
  const board = r.themes.map((t) => ({
    name: t.name,
    cells: t.questions.map((q, i) => ({ value: r.values[i], q, used: false, cat: false })),
  }));
  // Один «Кот в мешке» на раунд в случайной ячейке (не самая дешёвая)
  const ti = Math.floor(Math.random() * board.length);
  const qi = 1 + Math.floor(Math.random() * (r.values.length - 1));
  board[ti].cells[qi].cat = true;
  return board;
}

function resetGame(keepPlayers) {
  clearTimer();
  if (!keepPlayers) players = freshPlayers();
  else for (const n of PLAYER_NAMES) players[n].score = 0;
  state = {
    phase: 'lobby',
    roundIdx: -1,
    board: null,
    chooser: null,
    cur: null, // текущий вопрос
    final: null,
    deadline: null,
    message: '',
  };
}

function clearTimer() {
  if (timer) clearTimeout(timer);
  timer = null;
}

function setPhase(phase, ms, onEnd) {
  clearTimer();
  state.phase = phase;
  state.deadline = ms ? Date.now() + ms : null;
  if (ms && onEnd) timer = setTimeout(onEnd, ms);
  broadcast();
}

const connectedNames = () => PLAYER_NAMES.filter((n) => players[n].joined && players[n].connected);
const joinedNames = () => PLAYER_NAMES.filter((n) => players[n].joined);

// ---------- Ход игры ----------
function startRound(idx) {
  state.roundIdx = idx;
  state.board = buildBoard(idx);
  state.cur = null;
  const js = joinedNames();
  if (idx === 0 || !state.chooser) {
    state.chooser = js[Math.floor(Math.random() * js.length)] || null;
  } else {
    // Со второго раунда первым выбирает игрок с наименьшим счётом
    const min = Math.min(...js.map((n) => players[n].score));
    const lows = js.filter((n) => players[n].score === min);
    state.chooser = lows[Math.floor(Math.random() * lows.length)];
  }
  state.message = '';
  setPhase('roundIntro', T.roundIntro, () => setPhase('board'));
}

function pick(name, ti, qi) {
  if (state.phase !== 'board') return;
  const chooserOnline = state.chooser && players[state.chooser].connected;
  if (chooserOnline && name !== state.chooser) return;
  const cell = state.board?.[ti]?.cells?.[qi];
  if (!cell || cell.used) return;
  cell.used = true;
  state.cur = {
    ti, qi,
    theme: state.board[ti].name,
    value: cell.value,
    q: cell.q,
    cat: cell.cat,
    catTarget: null,
    answerer: null,
    tried: [],
    attempts: [], // { name, text, ok, reason }
    result: null, // 'correct' | 'nobody'
  };
  if (cell.cat) {
    if (!chooserOnline) state.chooser = name;
    setPhase('cat', T.catChoose, () => {
      const others = connectedNames().filter((n) => n !== state.chooser);
      catGive(state.chooser, others[Math.floor(Math.random() * others.length)] || state.chooser, true);
    });
  } else {
    setPhase('reading', readTime(cell.q.q), openBuzz);
  }
}

function catGive(from, to, auto) {
  if (state.phase !== 'cat' || (!auto && from !== state.chooser)) return;
  const others = connectedNames().filter((n) => n !== state.chooser);
  if (to === state.chooser && others.length > 0) return; // отдавать нужно сопернику
  if (!players[to] || !players[to].joined) return;
  state.cur.catTarget = to;
  state.cur.answerer = to;
  setPhase('reading', readTime(state.cur.q.q), () => setPhase('answering', T.answer, () => submitAnswer(to, '', true)));
}

function openBuzz() {
  setPhase('buzzing', T.buzz, () => {
    state.cur.result = 'nobody';
    reveal();
  });
}

function buzz(name) {
  if (state.phase !== 'buzzing') return;
  if (!players[name]?.joined || state.cur.tried.includes(name)) return;
  state.cur.answerer = name;
  io.emit('buzzed', name);
  setPhase('answering', T.answer, () => submitAnswer(name, '', true));
}

function submitAnswer(name, text, timeout) {
  if (state.phase !== 'answering' || state.cur.answerer !== name) return;
  const cur = state.cur;
  const res = timeout && !text ? { ok: false, reason: 'Время вышло' } : checkAnswer(text, cur.q);
  cur.attempts.push({ name, text: String(text || '').slice(0, 100), ok: res.ok, reason: res.reason });
  cur.tried.push(name);
  if (res.ok) {
    players[name].score += cur.value;
    state.chooser = name;
    cur.result = 'correct';
    return reveal();
  }
  players[name].score -= cur.value;
  if (cur.cat) {
    cur.result = 'nobody';
    return reveal();
  }
  const left = connectedNames().filter((n) => !cur.tried.includes(n));
  cur.answerer = null;
  if (left.length === 0) {
    cur.result = 'nobody';
    return reveal();
  }
  openBuzz();
}

function reveal() {
  setPhase('reveal', T.reveal, afterQuestion);
}

function afterQuestion() {
  state.cur = null;
  const left = state.board.some((t) => t.cells.some((c) => !c.used));
  if (left) return setPhase('board');
  if (state.roundIdx + 1 < rounds.length) return startRound(state.roundIdx + 1);
  startFinal();
}

function skipRound() {
  if (!['board'].includes(state.phase)) return;
  if (state.roundIdx + 1 < rounds.length) startRound(state.roundIdx + 1);
  else startFinal();
}

// ---------- Финал ----------
function startFinal() {
  const eligible = joinedNames().filter((n) => players[n].score > 0);
  const fq = finals[Math.floor(Math.random() * finals.length)];
  state.final = { q: fq, eligible, stakes: {}, answers: {}, results: null };
  state.cur = null;
  if (eligible.length === 0) {
    state.message = 'Ни у кого нет положительного счёта — финал не играется.';
    return setPhase('gameover');
  }
  setPhase('finalStake', T.finalStake, finalAsk);
}

function finalStake(name, amount) {
  const f = state.final;
  if (state.phase !== 'finalStake' || !f.eligible.includes(name)) return;
  let a = Math.floor(Number(amount));
  if (!Number.isFinite(a)) return;
  a = Math.max(1, Math.min(players[name].score, a));
  f.stakes[name] = a;
  if (f.eligible.every((n) => f.stakes[n] != null || !players[n].connected)) finalAsk();
  else broadcast();
}

function finalAsk() {
  const f = state.final;
  for (const n of f.eligible) if (f.stakes[n] == null) f.stakes[n] = 1;
  setPhase('finalAnswer', T.finalAnswer + readTime(f.q.q), finalReveal);
}

function finalAnswer(name, text) {
  const f = state.final;
  if (state.phase !== 'finalAnswer' || !f.eligible.includes(name) || f.answers[name] != null) return;
  f.answers[name] = String(text || '').slice(0, 100);
  if (f.eligible.every((n) => f.answers[n] != null || !players[n].connected)) finalReveal();
  else broadcast();
}

function finalReveal() {
  if (state.phase !== 'finalAnswer') return;
  const f = state.final;
  f.results = f.eligible.map((n) => {
    const text = f.answers[n] ?? '';
    const res = text ? checkAnswer(text, f.q) : { ok: false, reason: 'Нет ответа' };
    const delta = res.ok ? f.stakes[n] : -f.stakes[n];
    players[n].score += delta;
    return { name: n, text, ok: res.ok, reason: res.reason, stake: f.stakes[n], delta };
  });
  setPhase('gameover');
}

// ---------- Публичное состояние ----------
function publicState() {
  const s = state;
  const out = {
    phase: s.phase,
    names: PLAYER_NAMES,
    players: PLAYER_NAMES.map((n) => ({ name: n, score: players[n].score, connected: players[n].connected, joined: players[n].joined })),
    round: s.roundIdx >= 0 && s.roundIdx < rounds.length ? rounds[s.roundIdx].name : null,
    roundIdx: s.roundIdx,
    totalRounds: rounds.length,
    board: s.board ? s.board.map((t) => ({ name: t.name, cells: t.cells.map((c) => ({ value: c.value, used: c.used })) })) : null,
    chooser: s.chooser,
    deadline: s.deadline,
    serverNow: Date.now(),
    message: s.message,
    cur: null,
    final: null,
  };
  if (s.cur) {
    const c = s.cur;
    const showQ = s.phase !== 'cat';
    out.cur = {
      theme: c.theme, value: c.value, cat: c.cat, catTarget: c.catTarget,
      text: showQ ? c.q.q : null,
      pic: showQ ? c.q.pic || null : null,
      img: showQ ? c.q.img || null : null,
      answerer: c.answerer, tried: c.tried, attempts: c.attempts, result: c.result,
      answer: s.phase === 'reveal' ? c.q.a : null,
    };
  }
  if (s.final) {
    const f = s.final;
    out.final = {
      theme: f.q.theme,
      text: s.phase === 'finalStake' ? null : f.q.q,
      eligible: f.eligible,
      staked: f.eligible.filter((n) => f.stakes[n] != null),
      answered: f.eligible.filter((n) => f.answers[n] != null),
      results: f.results,
      answer: f.results ? f.q.a : null,
    };
  }
  return out;
}

function broadcast() {
  io.emit('state', publicState());
}

// ---------- Сокеты ----------
io.on('connection', (socket) => {
  let me = null;
  socket.emit('state', publicState());

  socket.on('join', ({ name, clientId }, cb) => {
    const p = players[name];
    if (!p) return cb?.({ error: 'Нет такого игрока' });
    if (p.connected && p.clientId !== clientId) return cb?.({ error: `${name} уже в игре на другом устройстве` });
    if (me && me !== name) leave();
    me = name;
    p.clientId = clientId;
    p.socketId = socket.id;
    p.connected = true;
    p.joined = true;
    cb?.({ ok: true, name });
    broadcast();
  });

  function leave() {
    if (!me) return;
    const p = players[me];
    if (p.socketId === socket.id) {
      p.connected = false;
      p.socketId = null;
    }
    me = null;
    broadcast();
  }

  socket.on('leave', leave);
  socket.on('disconnect', leave);

  socket.on('start', () => {
    if (!me || state.phase !== 'lobby') return;
    for (const n of PLAYER_NAMES) players[n].score = 0;
    startRound(0);
  });
  socket.on('pick', ({ ti, qi }) => me && pick(me, ti, qi));
  socket.on('catGive', (to) => me && catGive(me, to));
  socket.on('buzz', () => me && buzz(me));
  socket.on('answer', (text) => me && submitAnswer(me, String(text || '').slice(0, 100)));
  socket.on('finalStake', (a) => me && finalStake(me, a));
  socket.on('finalAnswer', (t) => me && finalAnswer(me, t));
  socket.on('skipRound', () => me && skipRound());
  socket.on('newGame', () => {
    if (!me) return;
    if (state.phase !== 'gameover' && state.phase !== 'lobby') return;
    resetGame(true);
    broadcast();
  });
  socket.on('abort', () => {
    if (!me) return;
    resetGame(true);
    broadcast();
  });
});

resetGame(false);

server.listen(PORT, () => {
  console.log(`\n  «Моя игра» запущена на порту ${PORT}\n`);
  console.log(`  На этом компьютере:  http://localhost:${PORT}`);
  for (const list of Object.values(os.networkInterfaces())) {
    for (const i of list || []) {
      if (i.family === 'IPv4' && !i.internal) console.log(`  С телефонов (Wi‑Fi): http://${i.address}:${PORT}`);
    }
  }
  console.log('');
});

module.exports = { checkAnswer, normalize };
