/* global io */
const socket = io();
const $ = (s) => document.querySelector(s);
const main = $('#main');

let clientId = localStorage.getItem('mg_client');
if (!clientId) {
  clientId = Math.random().toString(36).slice(2) + Date.now().toString(36);
  localStorage.setItem('mg_client', clientId);
}
let me = localStorage.getItem('mg_name') || null;
let spectator = false;
let S = null;
let offset = 0;
let viewKey = '';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------- Звук ----------
let actx;
function beep(freq = 600, dur = 0.12, type = 'sine', vol = 0.15) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = vol;
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
    o.connect(g).connect(actx.destination);
    o.start(); o.stop(actx.currentTime + dur);
  } catch (e) { /* без звука */ }
}
const sfx = {
  open: () => beep(880, 0.15, 'square', 0.08),
  buzz: () => { beep(520, 0.1, 'sawtooth'); setTimeout(() => beep(780, 0.15, 'sawtooth'), 90); },
  good: () => { beep(660, 0.12); setTimeout(() => beep(990, 0.2), 120); },
  bad: () => beep(180, 0.35, 'sawtooth', 0.12),
};
const vibrate = (p) => navigator.vibrate && navigator.vibrate(p);

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.add('hidden'), 2500);
}

// ---------- Подключение ----------
function join(name) {
  socket.emit('join', { name, clientId }, (res) => {
    if (res?.error) {
      toast(res.error);
      me = null;
      localStorage.removeItem('mg_name');
    } else {
      me = name;
      spectator = false;
      localStorage.setItem('mg_name', name);
    }
    viewKey = '';
    render();
  });
}

socket.on('connect', () => { if (me) join(me); });

let prevPhase = null;
socket.on('state', (s) => {
  offset = s.serverNow - Date.now();
  const old = S;
  S = s;
  if (prevPhase !== s.phase) {
    if (s.phase === 'buzzing') sfx.open();
    if (s.phase === 'reveal' && s.cur) {
      if (s.cur.result === 'correct') sfx.good(); else sfx.bad();
    }
    if (s.phase === 'buzzing' && old?.phase === 'answering') sfx.bad();
  }
  prevPhase = s.phase;
  render();
});

socket.on('buzzed', (name) => {
  sfx.buzz();
  if (name === me) vibrate([60, 40, 120]);
});

// ---------- Таймер ----------
let phaseStart = { key: null, total: 1 };
function tick() {
  const fill = $('#timerFill');
  if (S && S.deadline) {
    const now = Date.now() + offset;
    const key = S.phase + S.deadline;
    if (phaseStart.key !== key) phaseStart = { key, total: Math.max(1000, S.deadline - now) };
    const left = Math.max(0, S.deadline - now);
    fill.style.width = (100 * left / phaseStart.total) + '%';
    fill.classList.toggle('warn', left < 4000 && ['buzzing', 'answering', 'finalAnswer', 'finalStake', 'cat'].includes(S.phase));
    document.querySelectorAll('[data-secs]').forEach((el) => { el.textContent = Math.ceil(left / 1000); });
  } else {
    fill.style.width = '0';
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// ---------- Рендер ----------
function renderScores() {
  const box = $('#scores');
  if (!S) return;
  const answering = ['answering'].includes(S.phase) && S.cur ? S.cur.answerer : null;
  box.innerHTML = S.players.map((p) => {
    const cls = ['score'];
    if (p.name === me) cls.push('me');
    if (S.chooser === p.name && ['board', 'cat', 'roundIntro'].includes(S.phase)) cls.push('chooser');
    if (answering === p.name) cls.push('answering');
    if (!p.joined) cls.push('absent'); else if (!p.connected) cls.push('off');
    return `<div class="${cls.join(' ')}"><div class="n">${esc(p.name)}</div><div class="s ${p.score < 0 ? 'neg' : ''}">${p.score}</div></div>`;
  }).join('');
}

function render() {
  renderScores();
  if (!S) { main.innerHTML = '<p class="sub">Подключение…</p>'; return; }

  if (!me && !spectator) return show('choose:' + S.players.map((p) => p.connected).join(), viewChoose);

  const s = S;
  const c = s.cur;
  const f = s.final;
  let key = s.phase;
  switch (s.phase) {
    case 'lobby': key += s.players.map((p) => p.joined + '' + p.connected).join(); break;
    case 'roundIntro': key += s.roundIdx; break;
    case 'board': key += JSON.stringify(s.board) + s.chooser + s.players.map((p) => p.connected).join(); break;
    case 'cat': key += s.chooser + s.players.map((p) => p.connected).join(); break;
    case 'reading': case 'buzzing': case 'answering': case 'reveal':
      key += c.text + c.answerer + c.attempts.length; break;
    case 'finalStake': key += f.staked.join(); break;
    case 'finalAnswer': key += f.answered.join(); break;
    case 'gameover': key += JSON.stringify(f?.results) + s.message; break;
  }
  const views = {
    lobby: viewLobby, roundIntro: viewRoundIntro, board: viewBoard, cat: viewCat,
    reading: viewQuestion, buzzing: viewQuestion, answering: viewQuestion, reveal: viewQuestion,
    finalStake: viewFinalStake, finalAnswer: viewFinalAnswer, gameover: viewGameOver,
  };
  show(key, views[s.phase]);
}

function show(key, fn) {
  if (key === viewKey) return;
  viewKey = key;
  const focused = document.activeElement?.id;
  const keepVal = focused && document.getElementById(focused)?.value;
  main.innerHTML = fn();
  bind();
  if (focused && document.getElementById(focused)) {
    const el = document.getElementById(focused);
    if (keepVal != null && 'value' in el && !el.value) el.value = keepVal;
    el.focus();
  }
}

// ---------- Экраны ----------
function viewChoose() {
  return `
    <h1>МОЯ ИГРА</h1>
    <p class="sub">Викторина для взрослых. Кто ты?</p>
    <div class="pick-grid">
      ${S.players.map((p) => `<button data-join="${esc(p.name)}" class="${p.connected ? 'taken' : ''}">${esc(p.name)}${p.connected ? '<br><small>в игре</small>' : ''}</button>`).join('')}
    </div>
    <button class="btn ghost" data-act="spectate">📺 Только смотреть (табло на ТВ)</button>`;
}

function viewLobby() {
  const joined = S.players.filter((p) => p.joined && p.connected);
  return `
    <h1>МОЯ ИГРА</h1>
    <p class="sub">Викторина для взрослых · ${S.totalRounds} раунда + финал</p>
    <div class="lobby-list">
      ${S.players.map((p) => `<div><span>${esc(p.name)}</span><span>${p.connected ? '✅ на месте' : '⏳ ждём'}</span></div>`).join('')}
    </div>
    ${me ? `<button class="btn" data-act="start" ${joined.length ? '' : 'disabled'}>Начать игру (${joined.length} из 4)</button>` : '<p class="sub">Ждём начала игры…</p>'}
    <details class="sub">
      <summary>Правила</summary>
      <p style="text-align:left">
        Выбирающий открывает вопрос на табло. Когда вопрос прочитан, загорается красная кнопка —
        кто нажал первым, тот и отвечает. Ответ вписывается: регистр не важен, мелкие опечатки прощаются, можно часть ответа.
        Верно — плюс стоимость вопроса и право выбора; неверно — минус стоимость, а остальные могут попробовать.
        В каждом раунде спрятан «Кот в мешке» 🐱 — его отдают сопернику, и тот обязан ответить.
        Со 2‑го раунда первым выбирает игрок с наименьшим счётом.
        В финал выходят игроки с положительным счётом: делают ставку и пишут ответ.
      </p>
    </details>`;
}

function viewRoundIntro() {
  return `<div style="margin:auto" class="center">
    <h1>${esc(S.round)}</h1>
    <p class="sub">Темы раунда:</p>
    <h2>${S.board.map((t) => esc(t.name)).join(' · ')}</h2>
    <p class="sub">Первым выбирает <b>${esc(S.chooser)}</b></p>
  </div>`;
}

function canPick() {
  if (!me || S.phase !== 'board') return false;
  const ch = S.players.find((p) => p.name === S.chooser);
  return S.chooser === me || !ch || !ch.connected;
}

function viewBoard() {
  const mine = canPick();
  return `
    <div class="status">${mine ? '👉 Твой выбор! Нажми на вопрос' : `Выбирает <b>${esc(S.chooser)}</b>…`}</div>
    <div class="board ${mine ? 'mine' : ''}">
      ${S.board.map((t, ti) => `
        <div class="row">
          <div class="theme">${esc(t.name)}</div>
          ${t.cells.map((c, qi) => `<button class="cellb ${c.used ? 'used' : ''}" ${c.used || !mine ? 'disabled' : ''} data-pick="${ti},${qi}">${c.value}</button>`).join('')}
        </div>`).join('')}
    </div>
    <p class="sub">${esc(S.round)}</p>`;
}

function viewCat() {
  const c = S.cur;
  const others = S.players.filter((p) => p.joined && p.connected && p.name !== S.chooser);
  const mine = me === S.chooser;
  return `
    <div class="cat">🐱</div>
    <h1>Кот в мешке!</h1>
    <p class="sub">Тема «${esc(c.theme)}», ${c.value} очков</p>
    ${mine ? `
      <p class="status">Кому отдаёшь вопрос? (<span data-secs></span> с)</p>
      <div class="choose-list">
        ${others.length ? others.map((p) => `<button class="btn secondary" data-cat="${esc(p.name)}">${esc(p.name)}</button>`).join('')
          : `<button class="btn secondary" data-cat="${esc(me)}">Соперников нет — отвечу сам(а)</button>`}
      </div>`
    : `<p class="status">${esc(S.chooser)} решает, кому отдать кота…</p>`}`;
}

function attemptsHtml(c) {
  if (!c.attempts.length) return '';
  return `<div class="attempts">${c.attempts.map((a) => `
    <div class="att ${a.ok ? 'ok' : 'bad'}">
      <span><b>${esc(a.name)}:</b> «${esc(a.text || '—')}»</span>
      <span class="why">${a.ok ? '✅ верно' : '❌ ' + esc(a.reason)}</span>
    </div>`).join('')}</div>`;
}

function viewQuestion() {
  const c = S.cur;
  const ph = S.phase;
  const tried = me && c.tried.includes(me);
  let action = '';
  if (ph === 'reading') {
    action = c.cat
      ? `<p class="status">🐱 Отвечает <b>${esc(c.catTarget)}</b>. Читаем вопрос…</p>`
      : `<button id="buzzer" disabled>Читаем…</button>`;
  } else if (ph === 'buzzing') {
    if (!me) action = `<p class="status">Жмите на кнопку! (<span data-secs></span>)</p>`;
    else if (tried) action = `<p class="status red">Ты уже отвечал(а) на этот вопрос</p>`;
    else action = `<button id="buzzer" data-act="buzz">ЖМИ!<br><small data-secs></small></button>`;
  } else if (ph === 'answering') {
    if (c.answerer === me) {
      action = `
        <div class="answer-box">
          <div class="status">✍️ Твой ответ! (<span data-secs></span> с)</div>
          <input id="ans" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Твой ответ…" maxlength="100">
          <button class="btn" data-act="send">Ответить</button>
          <div class="hint">Регистр не важен, мелкие опечатки прощаются</div>
        </div>`;
    } else {
      action = `<p class="status">✍️ Отвечает <b>${esc(c.answerer)}</b>… (<span data-secs></span>)</p>`;
    }
  } else if (ph === 'reveal') {
    const win = c.attempts.find((a) => a.ok);
    action = `
      <div class="status">${win ? `🎉 ${esc(win.name)} +${c.value}` : 'Никто не ответил верно'}</div>
      <div class="correct">Правильный ответ: ${esc(c.answer)}</div>`;
  }
  return `
    <div class="qcard">
      <div class="qhead"><span>${c.cat ? '🐱 ' : ''}${esc(c.theme)}</span><span>${c.value}</span></div>
      ${c.pic ? `<div class="pic">${esc(c.pic)}</div>` : ''}
      <div class="qtext">${esc(c.text)}</div>
    </div>
    ${action}
    ${attemptsHtml(c)}`;
}

function myScore() { return S.players.find((p) => p.name === me)?.score ?? 0; }

function viewFinalStake() {
  const f = S.final;
  const inFinal = me && f.eligible.includes(me);
  const done = f.staked.includes(me);
  return `
    <h1>ФИНАЛ</h1>
    <p class="sub">Тема финала:</p>
    <h2>${esc(f.theme)}</h2>
    <p class="sub">Играют: ${f.eligible.map(esc).join(', ')}</p>
    ${inFinal && !done ? `
      <div class="answer-box">
        <div class="status">Твоя ставка (1 – ${myScore()}) · <span data-secs></span> с</div>
        <input id="stake" type="number" inputmode="numeric" min="1" max="${myScore()}" value="${myScore()}">
        <button class="btn" data-act="stake">Поставить</button>
      </div>` : ''}
    ${done ? '<p class="status">Ставка принята 👍</p>' : ''}
    ${!inFinal ? '<p class="status">Ты не в финале — смотри и болей 🙂</p>' : ''}
    <p class="sub">Ставки сделали: ${f.staked.map(esc).join(', ') || '—'}</p>`;
}

function viewFinalAnswer() {
  const f = S.final;
  const inFinal = me && f.eligible.includes(me);
  const done = f.answered.includes(me);
  return `
    <div class="qcard">
      <div class="qhead"><span>ФИНАЛ · ${esc(f.theme)}</span><span data-secs></span></div>
      <div class="qtext">${esc(f.text)}</div>
    </div>
    ${inFinal && !done ? `
      <div class="answer-box">
        <input id="fans" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Твой ответ…" maxlength="100">
        <button class="btn" data-act="fans">Отправить ответ</button>
        <div class="hint">Ответ можно отправить только один раз</div>
      </div>` : ''}
    ${done ? '<p class="status">Ответ принят. Ждём остальных…</p>' : ''}
    <p class="sub">Ответили: ${f.answered.map(esc).join(', ') || '—'}</p>`;
}

function viewGameOver() {
  const f = S.final;
  const ranking = S.players.filter((p) => p.joined).sort((a, b) => b.score - a.score);
  const top = ranking[0]?.score;
  return `
    <h1>ИТОГИ</h1>
    ${S.message ? `<p class="sub">${esc(S.message)}</p>` : ''}
    ${f && f.results ? `
      <div class="qcard">
        <div class="qhead"><span>ФИНАЛ · ${esc(f.theme)}</span></div>
        <div class="qtext">${esc(f.text)}</div>
      </div>
      <div class="correct">Правильный ответ: ${esc(f.answer)}</div>
      <div class="attempts">${f.results.map((r) => `
        <div class="att ${r.ok ? 'ok' : 'bad'}">
          <span><b>${esc(r.name)}:</b> «${esc(r.text || '—')}»</span>
          <span class="delta ${r.delta > 0 ? 'p' : 'm'}">${r.delta > 0 ? '+' : ''}${r.delta}</span>
        </div>`).join('')}</div>` : ''}
    <div class="results">
      ${ranking.map((p, i) => `<div class="res ${p.score === top ? 'win' : ''}"><span>${p.score === top ? '🏆' : i + 1 + '.'} ${esc(p.name)}</span><b>${p.score}</b></div>`).join('')}
    </div>
    ${me ? '<button class="btn" data-act="newGame">Новая игра</button>' : ''}`;
}

// ---------- События ----------
function bind() {
  main.querySelectorAll('[data-join]').forEach((b) => b.onclick = () => join(b.dataset.join));
  main.querySelectorAll('[data-pick]').forEach((b) => b.onclick = () => {
    const [ti, qi] = b.dataset.pick.split(',').map(Number);
    socket.emit('pick', { ti, qi });
  });
  main.querySelectorAll('[data-cat]').forEach((b) => b.onclick = () => socket.emit('catGive', b.dataset.cat));
  main.querySelectorAll('[data-act]').forEach((b) => {
    const act = b.dataset.act;
    const handler = {
      spectate: () => { spectator = true; viewKey = ''; render(); },
      start: () => socket.emit('start'),
      buzz: () => { socket.emit('buzz'); b.disabled = true; },
      send: sendAnswer,
      stake: () => socket.emit('finalStake', Number($('#stake').value)),
      fans: sendFinal,
      newGame: () => socket.emit('newGame'),
    }[act];
    if (!handler) return;
    if (act === 'buzz') {
      // pointerdown — быстрее, чем click
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); handler(); });
    } else {
      b.onclick = handler;
    }
  });
  const ans = $('#ans');
  if (ans) { ans.focus(); ans.onkeydown = (e) => { if (e.key === 'Enter') sendAnswer(); }; }
  const fans = $('#fans');
  if (fans) fans.onkeydown = (e) => { if (e.key === 'Enter') sendFinal(); };
}

function sendAnswer() {
  const v = $('#ans')?.value.trim();
  if (!v) return toast('Впиши ответ');
  socket.emit('answer', v);
}
function sendFinal() {
  const v = $('#fans')?.value.trim();
  if (!v) return toast('Впиши ответ');
  socket.emit('finalAnswer', v);
}

// Пробел на компьютере = кнопка
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && S?.phase === 'buzzing' && document.activeElement?.tagName !== 'INPUT') {
    e.preventDefault();
    socket.emit('buzz');
  }
});

// ---------- Меню ----------
$('#menuBtn').onclick = () => {
  $('#menuWho').textContent = me ? `Ты играешь за: ${me}` : 'Режим просмотра';
  $('#menu').classList.remove('hidden');
};
$('#menu').onclick = (e) => {
  const act = e.target.dataset?.act;
  if (e.target.id === 'menu' || act === 'close') return $('#menu').classList.add('hidden');
  if (!act) return;
  if (act === 'switch') {
    socket.emit('leave');
    me = null; spectator = false;
    localStorage.removeItem('mg_name');
  } else if (act === 'skipRound') {
    if (S?.phase !== 'board') return toast('Можно только когда открыто табло');
    if (confirm('Закончить этот раунд и перейти к следующему?')) socket.emit('skipRound');
  } else if (act === 'abort') {
    if (confirm('Прервать игру для всех и вернуться в лобби?')) socket.emit('abort');
  }
  $('#menu').classList.add('hidden');
  viewKey = '';
  render();
};
