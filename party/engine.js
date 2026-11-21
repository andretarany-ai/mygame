// Движок трёх игр для вечеринки (работает у хоста): «Кто из нас?», «Смешной ответ», «Испорченный рисунок».
const PLAYERS = ['Марина', 'Даша', 'Андрей', 'Сережа'];
const PCOLORS = { 'Марина': '#ff4d6d', 'Даша': '#a66bff', 'Андрей': '#2f8cff', 'Сережа': '#22c55e' };

// ---------- Библиотеки ----------
const WHO_Q = [
  'Кто первым напьётся на свадьбе?', 'Кто тайно смотрит ромкомы и плачет?', 'Кто дольше всех собирается?',
  'Кто скорее всего станет миллионером?', 'Кто первым уснёт на вечеринке?', 'Кто больше всех тратит на шопинг?',
  'Кто опоздает на собственную свадьбу?', 'Кто выиграет в казино… и тут же всё проиграет?', 'Кто лучше всех готовит?',
  'Кто чаще всего говорит «я на диете»?', 'Кто пишет бывшим в 3 часа ночи?', 'Кто громче всех поёт в караоке?',
  'Кого скорее заберёт полиция на Кирмесе?', 'Кто побежит за Bratwurst в 2 часа ночи?', 'Кто выживет в зомби-апокалипсисе?',
  'Кто самый ревнивый?', 'Кто тайный романтик?', 'Кто не выпускает телефон из рук за столом?', 'Кто лучше всех врёт?',
  'Кто станет звездой TikTok?', 'Кто скорее заведёт десять котов?', 'Кто первым сбежит с работы в пятницу?',
  'Кто опаздывает сильнее, чем ДБ?', 'Кто больше всех спорит?', 'Кто танцует как дядя на свадьбе?',
  'Кто забудет годовщину?', 'Кто знает все сплетни Иббенбюрена?', 'Кто первым сделает ботокс?',
  'Кто купит электрические стельки и будет ими хвастаться?', 'Кто громче всех храпит?', 'Кто самый щедрый?',
  'Кто скажет «я больше не пью» и тут же нальёт ещё?', 'Кто лучший водитель?', 'Кто худший водитель?',
  'Кто пошёл бы на шоу знакомств по телевизору?', 'Кто чаще всех смотрит в зеркало?', 'Кто переедет жить на Ибицу?',
  'Кто уснёт в такси после Экстраблатта?', 'Кто выпьет больше всех глинтвейна на ярмарке?', 'Кто дольше всех выбирает еду в меню?',
  'Кто первым заплачет на свадьбе?', 'Кто лучше всех флиртует?', 'Кто хуже всех флиртует?', 'Кто прыгнет с парашютом?',
  'Кто тайно ест ночью из холодильника?', 'Кто первым напишет в общий чат утром после тусовки?', 'Кто главный подкаблучник?',
  'Кто победит в армрестлинге?', 'Кто пишет «ахах», даже не улыбнувшись?', 'Кто стал бы лучшим тамадой?',
  'Кто забудет, где припарковал машину?', 'Кто уснёт в кино?', 'Кто самый суеверный?', 'Кто подработал бы стриптизёром?',
  'Кто самый горячий в компании?', 'Кто первым скажет «я тебя люблю» на втором свидании?', 'Кто прячет заначку от партнёра?',
  'Кто первым сдастся на диете?', 'Кто проиграет всё в «Иббенбюрене»?', 'Кто попросит скидку даже в аптеке?',
  'Кто устроит скандал в ресторане?', 'Кто первым разденется в бане?', 'Кто сделает татуировку с именем партнёра?',
];
const FUNNY_Q = [
  'Худший подарок на годовщину — это ___', 'Сережа забыл годовщину. Чтобы Марина простила, он ___',
  'Новая услуга в салоне маникюра: ___', 'Электрические стельки теперь умеют ___', 'На Кирмесе открыли новый аттракцион: ___',
  'Тайный ингредиент Bratwurst из фургона: ___', 'Что Андрей на самом деле делает в ДБ, когда опаздывает: ___',
  'Название нового коктейля в Экстраблатте: ___', 'Самая странная причина опоздания на работу: ___',
  'Что говорит Джавид, когда подстриг криво: ___', 'Слоган зассанного катка: ___', 'Лучшая фраза для знакомства в Rewe: ___',
  'Худшее, что можно сказать на первом свидании: ___', 'Новый налог в Германии: ___', 'Даша и Андрей открыли бизнес: ___',
  'Секрет крепких отношений по версии Марины и Сережи: ___', 'Что на самом деле хранится на складе Fiege: ___',
  'Amazon привёз вместо заказа: ___', 'Новый вкус пиццы в Торино: ___', 'Тост на свадьбе, после которого все замолчали: ___',
  'Что лучше не гуглить при тёще: ___', 'Название для общего чата этой компании: ___', 'Если бы Иббенбюрен был фильмом, он назывался бы: ___',
  'Худшее имя для ребёнка: ___', 'Что написать бывшему в 3 часа ночи: ___', 'Девиз этой компании: ___',
  'Лучший способ потратить миллион в Иббенбюрене: ___', 'Новая олимпийская дисциплина: ___', 'Что крикнуть, сорвав джекпот в казино: ___',
  'Почему автобус Р15 опять опоздал: ___', 'Что на самом деле лежит в сумочке у девушки: ___', 'Мужчины думают о ___ каждые 7 секунд',
  'Если бы шахта снова открылась, там добывали бы ___', 'Секретное меню Макдональдса в Оснабрюке: ___',
  'Название для секс-шопа в Иббенбюрене: ___', 'Самая неловкая находка в телефоне партнёра: ___', 'Утро после вечеринки начинается с ___',
  'Худшая начинка для вареников: ___', 'Новый праздник в календаре: ___', 'Лучшее оправдание, почему не пришёл на вечеринку: ___',
  'Кот ушёл из дома, потому что ___', 'Что на самом деле значит «я уже в пути»: ___', 'Главное правило девичника: ___',
  'Главное правило мальчишника: ___', 'Как назвать собаку этой компании: ___', '«Дорогая, это не то, что ты подумала, я просто ___»',
  'Название мемуаров Андрея: ___', 'Название духов от Даши: ___', 'Что Марина купит на последние 10 €: ___',
  'Чем заняться в Иббенбюрене в воскресенье: ___', 'Новая функция в приложении знакомств: ___', 'Худшее место для первого поцелуя: ___',
  'Если бы деньги росли на деревьях, я бы ___', 'Слоган для угольной шахты: ___', 'Самая подозрительная покупка в 2 часа ночи: ___',
  'Вместо «Горько!» на нашей свадьбе кричали бы: ___', 'Что сказал бы кот, если бы умел говорить: ___',
  'Сережа в 60 лет будет ___', 'Главный страх Андрея: ___', 'Если бы Даша была президентом, первым законом стало бы ___',
  'Марина объявила бойкот, потому что ___', 'Что нельзя говорить таксисту в 4 утра: ___', 'Идеальное свидание по-немецки: ___',
];
const DRAW_W = [
  'Зассанный каток', 'Bratwurst фургон', 'Кирмес', 'Барбершоп у Джавида', 'Электрические стельки', 'Угольная шахта',
  'Автобус Р15 опаздывает', 'Сережа забыл годовщину', 'Андрей уснул в ДБ', 'Даша на шопинге', 'Марина в Трендшопе',
  'Склад Fiege', 'Пиццерия Торино', 'Суши бар', 'Маникюр', 'Галерея в Райне', 'Ярмарка в пятницу', 'Пляж на Аасее',
  'Казино', 'Тюрьма', 'Полицейская машина', 'Пьяный единорог', 'Тёща на самокате', 'Кот-бодибилдер', 'Рыба в отпуске',
  'Динозавр на свидании', 'Похмельное утро', 'Танцующая шаурма', 'Ниндзя в Rewe', 'Бабушка-рокер', 'Призрак в бане',
  'Пингвин на пляже', 'Холодильник-обжора', 'Свидание вслепую', 'Медведь на велосипеде', 'Летающая пицца', 'Злой будильник',
  'Пицца с ананасами', 'Гусь-охранник', 'Невеста убегает', 'Мальчишник в Вегасе', 'Подкаблучник', 'Красный флаг',
  'Помидор в солярии', 'Морковь в спортзале', 'Огурец-шпион', 'Снеговик в сауне', 'Робот-официант', 'Корова на коньках',
  'Бегемот в балетной пачке', 'Космонавт в Netto', 'Пират на самокате', 'Акула-стоматолог', 'Утка-бизнесмен',
  'Ленивец-курьер', 'Жираф в лифте', 'Муха в супе', 'Вампир у стоматолога', 'Зомби на диете', 'Улитка-гонщик',
  'Сосиска в смокинге', 'Курица на пенсии', 'Кактус обнимается', 'Банан в пижаме', 'Лама в очереди', 'Хомяк-миллионер',
  'Тамада на свадьбе', 'Стриптизёр-пожарный', 'Глинтвейн', 'Деньги на ветер', 'Бабочки в животе', 'Разбитое сердце',
  'Двойное свидание', 'Медовый месяц', 'Ревнивый муж', 'Любовник в шкафу', 'Папик с золотой картой', 'Королева драмы',
  'Wi-Fi пропал', 'Батарейка 1%', 'Селфи с акулой', 'Танцы на столе', 'Звезда караоке', 'Будильник в 6 утра',
  'Сосед с дрелью', 'Немецкая пунктуальность', 'Октоберфест', 'Велосипед в канале', 'Тюлень в ванной', 'Йога для котов',
  'Диета с понедельника', 'Пельмени-путешественники', 'Батон-рыцарь', 'Ведьма на пылесосе', 'Шахтёр в казино', 'Лось за рулём',
  'Свинья в луже', 'Крокодил-стилист', 'Сова-полуночник', 'Бигуди у мужчины', 'Ботокс пошёл не так', 'Губы уточкой',
  'Мужской маникюр', 'Подруга-сплетница', 'Кот на гироскутере', 'Слон в посудной лавке', 'Ёж-парикмахер', 'Русалка в бассейне',
  'Курьер с пиццей заблудился', 'Скандал в ресторане', 'Бабушкины пирожки', 'Пьяный Дед Мороз', 'Кролик-фокусник',
  'Гамбургер-великан', 'Утро понедельника', 'Пятница вечер', 'Отпуск мечты', 'Сломанный зонт', 'Кот в сапогах на Кирмесе',
  'Петух-будильник', 'Носок-потеряшка', 'Танк-эвакуатор', 'Морж на сёрфе', 'Дракон в бане', 'Хот-дог на свадьбе',
  'Карусель ужаса', 'Свадебный торт упал', 'Глухой телефон', 'Вечеринка в пижамах', 'Пингвин-официант', 'Обезьяна с селфи-палкой',
];

const IDEA_T = [
  'Если бы Марина была суперзлодейкой', 'Андрей в роли супергероя', 'Даша — королева Иббенбюрена', 'Сережа на необитаемом острове',
  'Наша компания через 20 лет', 'Иббенбюрен в 3000 году', 'Новый аттракцион на Кирмесе', 'Что на самом деле происходит на складе Fiege',
  'Идеальное свидание Даши и Андрея', 'Худшее свидание Марины и Сережи', 'Обложка альбома нашей рок-группы', 'Самый безумный бизнес Андрея',
  'Самый странный сон после вечеринки', 'Животное, которым был бы каждый из нас', 'Свадьба мечты в стиле фильма ужасов',
  'Отпуск, который пошёл не так', 'Bratwurst фургон из будущего', 'Барбершоп у Джавида на Марсе', 'Если бы зассанный каток стал курортом',
  'Тайная жизнь кота ночью', 'Реклама электрических стелек', 'Мальчишник, о котором никто не должен узнать', 'Девичник в стиле Средневековья',
  'Мем про нашу компанию', 'Утро после Экстраблатта', 'Казино, где ставят не деньги', 'Наш общий дом через 10 лет',
  'Новая олимпийская дисциплина', 'Самый неловкий момент на работе', 'Если бы ДБ ходил вовремя', 'Битва Rewe против Netto',
];

// ---------- Случай ----------
function rnd(n) {
  const c = (typeof crypto !== 'undefined' && crypto.getRandomValues) ? crypto : require('crypto').webcrypto;
  const lim = Math.floor(0x100000000 / n) * n, a = new Uint32Array(1);
  do c.getRandomValues(a); while (a[0] >= lim);
  return a[0] % n;
}
function shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const pick = (arr, n) => shuffle(arr).slice(0, n);

const T = { whoVote: 25000, funnyWrite: 60000, funnyVote: 30000, drawTime: 180000, descTime: 60000, ideaWrite: 75000, ideaGen: 90000, ideaGuess: 60000, grace: 2500 };
const cleanText = (t, max = 120) => String(t ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

// Рисунок: [{c: 'цвет', w: толщина, p: [x,y,x,y…]}], координаты 0…1000. Проверяем и ограничиваем размер.
function cleanDrawing(d) {
  if (!Array.isArray(d)) return [];
  const out = [];
  let pts = 0;
  for (const s of d.slice(0, 400)) {
    if (!s || !Array.isArray(s.p)) continue;
    const p = s.p.slice(0, 2000).map((v) => Math.max(0, Math.min(1000, Math.round(Number(v) || 0))));
    if (p.length < 2) continue;
    pts += p.length;
    if (pts > 24000) break;
    out.push({ c: /^#[0-9a-f]{6}$/i.test(s.c) ? s.c : '#111111', w: Math.max(2, Math.min(60, Math.round(Number(s.w) || 8))), p });
  }
  return out;
}

class Party {
  constructor(mode, onChange, saved) {
    this.mode = mode;
    this.onChange = onChange;
    this.timer = null;
    this.drafts = {};
    if (saved) this.restore(saved); else this.reset(true);
  }
  reset(full) {
    clearTimeout(this.timer);
    const old = this.pl;
    this.pl = {};
    for (const n of PLAYERS) this.pl[n] = { joined: !full && !!old?.[n]?.joined, on: !full && !!old?.[n]?.on, peer: full ? null : old?.[n]?.peer ?? null };
    this.g = { ph: 'lobby', players: [], step: null, dl: null, scores: {}, ev: [], evId: 0, opt: this.g?.opt || {} };
    this.rq = this.rq || [];
    this.ok = this.ok || {};
  }
  changed() { this.onChange && this.onChange(); }
  ev(k, d) { const g = this.g; g.ev.push({ id: ++g.evId, k, ...d }); if (g.ev.length > 20) g.ev.shift(); }
  setTimer(ms, fn) { clearTimeout(this.timer); this.g.dl = ms ? Date.now() + ms : null; if (ms) this.timer = setTimeout(fn, ms + T.grace); }
  inGame(n) { return this.g.players.includes(n); }

  // --- вход по ссылке ---
  join(name, peer, trusted) {
    const p = this.pl[name];
    if (!p) return 'Нет такого игрока';
    if (p.on && p.peer && p.peer !== peer) return name + ' уже играет на другом телефоне';
    if (!trusted && !this.ok[peer]) { this.rq = this.rq.filter((r) => r[1] !== peer).concat([[name, peer]]).slice(-8); this.changed(); return null; }
    for (const n of PLAYERS) if (n !== name && this.pl[n].peer === peer) { this.pl[n].on = false; this.pl[n].peer = null; }
    Object.assign(p, { joined: true, on: true, peer });
    this.changed();
    return null;
  }
  approve(peer, yes) {
    const r = this.rq.find((x) => x[1] === peer);
    this.rq = this.rq.filter((x) => x[1] !== peer);
    if (r && yes) { this.ok[peer] = 1; this.join(r[0], peer, true); } else this.changed();
  }
  dropPeer(peer) {
    let ch = false;
    for (const n of PLAYERS) if (this.pl[n].peer === peer && this.pl[n].on) { this.pl[n].on = false; ch = true; }
    if (this.rq.some((r) => r[1] === peer)) { this.rq = this.rq.filter((r) => r[1] !== peer); ch = true; }
    if (ch) { this.changed(); this.checkAllDone(); }
  }
  markPeer(peer) {
    let ch = false;
    for (const n of PLAYERS) if (this.pl[n].peer === peer && this.pl[n].joined && !this.pl[n].on) { this.pl[n].on = true; ch = true; }
    if (ch) this.changed();
  }
  online() { return this.g.players.filter((n) => this.pl[n].on); }
  // Черновик игрока (текст или рисунок), присланный заранее — забираем, если время вышло
  setDraft(n, key, v) { if (n) this.drafts[n] = { key, v }; }
  draftOf(n, key) { const d = this.drafts[n]; return d && d.key === key ? d.v : null; }

  // --- старт ---
  start(opt = {}) {
    const js = PLAYERS.filter((n) => this.pl[n].joined && this.pl[n].on);
    if (this.g.ph !== 'lobby' && this.g.ph !== 'end') return;
    if (js.length < 2) return;
    const g = this.g;
    Object.assign(g, { ph: 'game', players: shuffle(js), scores: Object.fromEntries(js.map((n) => [n, 0])), opt: { ...g.opt, ...opt } });
    this.drafts = {};
    if (this.mode === 'who') this.whoStart();
    if (this.mode === 'funny') this.funnyStart();
    if (this.mode === 'draw') this.drawStart();
    if (this.mode === 'idea') this.ideaStart();
  }
  toLobby() { clearTimeout(this.timer); Object.assign(this.g, { ph: 'lobby', step: null, dl: null, w: null, f: null, d: null }); this.changed(); }
  // Все, кто на связи, уже сделали ход — не ждём таймер
  checkAllDone() {
    if (this.g.ph !== 'game') return;
    if (this.mode === 'who' && this.g.step === 'vote' && this.online().every((n) => this.g.w.votes[n])) this.whoReveal();
    if (this.mode === 'funny') {
      const f = this.g.f;
      if (this.g.step === 'write' && this.online().every((n) => f.answers[n] != null)) this.funnyToVote();
      else if (this.g.step === 'vote' && this.online().every((n) => f.votes[n] || !this.funnyCanVote(n))) this.funnyReveal();
    }
    if (this.mode === 'idea') {
      const i = this.g.i;
      if (this.g.step === 'write' && this.online().every((n) => i.ideas[n] != null)) this.ideaToGen();
      else if (this.g.step === 'gen' && i.order.every((a) => i.imgs[a])) this.ideaToGuess();
      else if (this.g.step === 'guess' && this.online().every((n) => i.sent[n] || !i.order.some((a) => a !== n))) this.ideaReveal();
    }
    if (this.mode === 'draw' && ['s1', 's2', 's3', 's4'].includes(this.g.step)) {
      const d = this.g.d, s = Number(this.g.step[1]);
      if (this.online().every((n) => d.done[n])) this.drawEndStep(s);
    }
  }

  // ================= «Кто из нас?» =================
  whoStart() {
    const count = Math.min(WHO_Q.length, Number(this.g.opt.rounds) || 10);
    this.g.w = { qs: pick(WHO_Q.map((_, i) => i), count), qi: 0, votes: {}, res: null, titles: {} };
    this.whoAsk();
  }
  whoAsk() { const g = this.g; g.step = 'vote'; g.w.votes = {}; g.w.res = null; this.setTimer(T.whoVote, () => this.whoReveal()); this.changed(); }
  whoVote(n, t) {
    const g = this.g;
    if (g.step !== 'vote' || !this.inGame(n) || !this.inGame(t) || g.w.votes[n]) return;
    g.w.votes[n] = t;
    this.changed();
    this.checkAllDone();
  }
  whoReveal() {
    const g = this.g, w = g.w;
    if (g.step !== 'vote') return;
    clearTimeout(this.timer); g.dl = null;
    const counts = Object.fromEntries(g.players.map((n) => [n, 0]));
    for (const v of Object.values(w.votes)) counts[v]++;
    const max = Math.max(0, ...Object.values(counts));
    const top = max ? g.players.filter((n) => counts[n] === max) : [];
    const right = Object.keys(w.votes).filter((v) => top.includes(w.votes[v]));
    for (const n of right) g.scores[n] += 1;
    for (const n of top) (w.titles[n] = w.titles[n] || []).push(w.qs[w.qi]);
    w.res = { counts, top, right, votes: { ...w.votes } };
    g.step = 'reveal';
    this.ev('reveal', {});
    this.changed();
  }
  whoNext() {
    const g = this.g, w = g.w;
    if (g.step !== 'reveal') return;
    if (w.qi + 1 >= w.qs.length) return this.finish();
    w.qi++;
    this.whoAsk();
  }

  // ================= «Смешной ответ» =================
  funnyStart() {
    const count = Number(this.g.opt.rounds) || 5;
    this.g.f = { qs: pick(FUNNY_Q.map((_, i) => i), count), r: 0, answers: {}, order: [], votes: {}, res: null };
    this.funnyAsk();
  }
  funnyKey() { return 'f' + this.g.f.r; }
  funnyAsk() { const g = this.g; g.step = 'write'; Object.assign(g.f, { answers: {}, order: [], votes: {}, res: null }); this.setTimer(T.funnyWrite, () => this.funnyToVote()); this.changed(); }
  funnyAnswer(n, text) {
    const g = this.g;
    if (g.step !== 'write' || !this.inGame(n) || g.f.answers[n] != null) return;
    const t = cleanText(text);
    if (!t) return;
    g.f.answers[n] = t;
    this.changed();
    this.checkAllDone();
  }
  funnyToVote() {
    const g = this.g, f = g.f;
    if (g.step !== 'write') return;
    for (const n of g.players) if (f.answers[n] == null) { const d = cleanText(this.draftOf(n, this.funnyKey())); if (d) f.answers[n] = d; }
    f.order = shuffle(Object.keys(f.answers));
    if (f.order.length < 2) { f.res = { pts: {}, smash: null, empty: true }; g.step = 'reveal'; clearTimeout(this.timer); g.dl = null; return this.changed(); }
    g.step = 'vote';
    this.setTimer(T.funnyVote, () => this.funnyReveal());
    this.changed();
  }
  funnyCanVote(n) { return this.g.f.order.some((a) => a !== n); }
  funnyVote(n, author) {
    const g = this.g, f = g.f;
    if (g.step !== 'vote' || !this.inGame(n) || f.votes[n] || author === n || !f.order.includes(author)) return;
    f.votes[n] = author;
    this.changed();
    this.checkAllDone();
  }
  funnyReveal() {
    const g = this.g, f = g.f;
    if (g.step !== 'vote') return;
    clearTimeout(this.timer); g.dl = null;
    const cnt = Object.fromEntries(f.order.map((a) => [a, 0]));
    for (const a of Object.values(f.votes)) cnt[a]++;
    const voters = Object.keys(f.votes).length;
    const pts = {};
    let smash = null;
    for (const a of f.order) {
      pts[a] = cnt[a] * 100;
      const possible = g.players.filter((n) => n !== a && f.votes[n] !== undefined).length;
      if (voters >= 2 && cnt[a] === possible && possible >= 2) { pts[a] += 200; smash = a; }
      g.scores[a] = (g.scores[a] || 0) + pts[a];
    }
    f.res = { cnt, pts, smash, votes: { ...f.votes } };
    g.step = 'reveal';
    this.ev('reveal', { smash });
    this.changed();
  }
  funnyNext() {
    const g = this.g, f = g.f;
    if (g.step !== 'reveal') return;
    if (f.r + 1 >= f.qs.length) return this.finish();
    f.r++;
    this.funnyAsk();
  }

  // ================= «Испорченный рисунок» =================
  // Цепочка: слово → рисунок → описание → рисунок → описание. Шаг s в цепочке k делает игрок players[(k+s) mod N].
  drawStart() {
    const g = this.g, N = g.players.length;
    const words = pick(DRAW_W, N);
    g.d = { chains: g.players.map((n, k) => [{ t: 'word', v: words[k], by: n }]), done: {}, rv: null, likes: {} };
    this.drawStep(1);
  }
  drawWho(k, s) { const N = this.g.players.length; return this.g.players[(k + s) % N]; }
  drawTask(n) {
    // какую цепочку игрок n делает на текущем шаге
    const g = this.g, s = Number(g.step?.[1]), N = g.players.length, i = g.players.indexOf(n);
    if (!s || i < 0) return null;
    const k = ((i - s) % N + N) % N;
    return { k, s, type: s % 2 ? 'draw' : 'text', prev: g.d.chains[k][s - 1] };
  }
  drawStep(s) {
    const g = this.g;
    g.step = 's' + s;
    g.d.done = {};
    const ms = s % 2 ? (Number(g.opt.drawSec) || T.drawTime / 1000) * 1000 : T.descTime;
    this.setTimer(ms, () => this.drawEndStep(s));
    this.ev('step', { s });
    this.changed();
  }
  drawSubmit(n, v) {
    const g = this.g;
    const task = this.drawTask(n);
    if (!task || g.d.done[n]) return;
    const val = task.type === 'draw' ? cleanDrawing(v) : cleanText(v, 100);
    g.d.chains[task.k][task.s] = { t: task.type, v: val, by: n };
    g.d.done[n] = 1;
    this.changed();
    this.checkAllDone();
  }
  drawEndStep(s) {
    const g = this.g;
    if (g.step !== 's' + s) return;
    clearTimeout(this.timer);
    for (const n of g.players) {
      const task = this.drawTask(n);
      if (!task || g.d.chains[task.k][s]) continue;
      const d = this.draftOf(n, 'd' + s);
      g.d.chains[task.k][s] = task.type === 'draw' ? { t: 'draw', v: cleanDrawing(d), by: n } : { t: 'text', v: cleanText(d, 100) || '(не успел описать)', by: n };
    }
    if (s < 4) return this.drawStep(s + 1);
    g.step = 'reveal';
    g.dl = null;
    g.d.rv = { k: 0, s: 0 };
    this.ev('reveal', {});
    this.changed();
  }
  drawNext() {
    const g = this.g, d = g.d;
    if (g.step !== 'reveal') return;
    if (d.rv.s < 4) d.rv.s++;
    else if (d.rv.k + 1 < d.chains.length) d.rv = { k: d.rv.k + 1, s: 0 };
    else return this.finish();
    this.changed();
  }
  drawLike(n, k, s) {
    const g = this.g, d = g.d;
    k = Number(k); s = Number(s);
    if (g.step !== 'reveal' || !this.inGame(n) || !d.chains[k]?.[s] || s === 0) return;
    const key = k + ':' + s;
    const set = d.likes[key] || (d.likes[key] = []);
    if (set.includes(n) || d.chains[k][s].by === n) return;
    set.push(n);
    g.scores[d.chains[k][s].by] = (g.scores[d.chains[k][s].by] || 0) + 1;
    this.changed();
  }

  // ================= «Угадай, кто загадал» =================
  // Каждый пишет описание картинки → хост заказывает картинки → все угадывают авторов → показ.
  ideaStart() {
    const count = Number(this.g.opt.rounds) || 3;
    this.g.i = { ts: pick(IDEA_T.map((_, k) => k), count), r: 0 };
    this.ideaAsk();
  }
  ideaKey() { return 'i' + this.g.i.r; }
  ideaAsk() {
    const g = this.g;
    Object.assign(g.i, { ideas: {}, imgs: {}, order: [], guesses: {}, sent: {}, likes: {}, res: null });
    g.step = 'write';
    this.setTimer(T.ideaWrite, () => this.ideaToGen());
    this.changed();
  }
  ideaWrite(n, text) {
    const g = this.g, i = g.i;
    if (g.step !== 'write' || !this.inGame(n) || i.ideas[n] != null) return;
    const t = cleanText(text, 200);
    if (!t) return;
    i.ideas[n] = t;
    this.changed();
    this.checkAllDone();
  }
  ideaToGen() {
    const g = this.g, i = g.i;
    if (g.step !== 'write') return;
    for (const n of g.players) if (i.ideas[n] == null) { const d = cleanText(this.draftOf(n, this.ideaKey()), 200); if (d) i.ideas[n] = d; }
    i.order = shuffle(Object.keys(i.ideas));
    if (!i.order.length) { i.res = { empty: true }; g.step = 'reveal'; clearTimeout(this.timer); g.dl = null; return this.changed(); }
    g.step = 'gen';
    // картинки заказывает страница хоста и сообщает результат через ideaImage()
    this.setTimer(T.ideaGen, () => this.ideaToGuess());
    this.changed();
  }
  // url — ссылка на картинку, 'no' — генератор отказал, 'skip' — нет ключа
  ideaImage(author, url) {
    const g = this.g, i = g.i;
    if (g.step !== 'gen' || !i.order.includes(author)) return;
    i.imgs[author] = String(url).slice(0, 500);
    this.changed();
    this.checkAllDone();
  }
  ideaToGuess() {
    const g = this.g, i = g.i;
    if (g.step !== 'gen') return;
    for (const a of i.order) if (!i.imgs[a]) i.imgs[a] = 'no';
    g.step = 'guess';
    this.setTimer(T.ideaGuess, () => this.ideaReveal());
    this.changed();
  }
  // guesses: { автор-слот (индекс в order): имя }
  ideaClean(n, map) {
    const i = this.g.i, clean = {};
    for (const [k, v] of Object.entries(map && typeof map === 'object' ? map : {})) {
      const slot = Number(k);
      if (i.order[slot] && i.order[slot] !== n && this.inGame(v) && v !== n) clean[slot] = v;
    }
    return clean;
  }
  ideaGuess(n, map, final) {
    const g = this.g, i = g.i;
    if (g.step !== 'guess' || !this.inGame(n) || i.sent[n]) return;
    i.guesses[n] = this.ideaClean(n, map);
    if (final) i.sent[n] = 1;
    this.changed();
    this.checkAllDone();
  }
  ideaReveal() {
    const g = this.g, i = g.i;
    if (g.step !== 'guess') return;
    clearTimeout(this.timer); g.dl = null;
    for (const n of g.players) if (!i.sent[n]) { const d = this.draftOf(n, 'g' + i.r); if (d) i.guesses[n] = this.ideaClean(n, d); }
    const right = {};
    i.order.forEach((a, slot) => {
      right[slot] = [];
      for (const [n, gs] of Object.entries(i.guesses)) if (gs[slot] === a) { right[slot].push(n); g.scores[n] = (g.scores[n] || 0) + 100; }
    });
    i.res = { right };
    g.step = 'reveal';
    this.ev('reveal', {});
    this.changed();
  }
  ideaLike(n, slot) {
    const g = this.g, i = g.i;
    slot = Number(slot);
    const a = i.order[slot];
    if (g.step !== 'reveal' || !a || a === n || !this.inGame(n)) return;
    const set = i.likes[slot] || (i.likes[slot] = []);
    if (set.includes(n)) return;
    set.push(n);
    g.scores[a] = (g.scores[a] || 0) + 50;
    this.changed();
  }
  ideaNext() {
    const g = this.g, i = g.i;
    if (g.step !== 'reveal') return;
    if (i.r + 1 >= i.ts.length) return this.finish();
    i.r++;
    this.ideaAsk();
  }

  // --- конец ---
  finish() {
    clearTimeout(this.timer);
    const g = this.g;
    g.ph = 'end'; g.step = 'end'; g.dl = null;
    g.rank = Object.entries(g.scores).sort((a, b) => b[1] - a[1]);
    this.ev('end', {});
    this.changed();
  }

  snapshot() { return { pl: this.pl, g: this.g, ok: this.ok }; }
  restore(s) {
    this.pl = s.pl; this.g = s.g; this.ok = s.ok || {}; this.rq = [];
    for (const n of PLAYERS) this.pl[n].on = false;
    // незаконченный шаг с таймером — перезапускаем таймер
    const g = this.g;
    if (g.ph === 'game' && g.dl) {
      const left = Math.max(5000, g.dl - Date.now());
      const fin = { who: () => this.whoReveal(), funny: () => (g.step === 'write' ? this.funnyToVote() : this.funnyReveal()), draw: () => this.drawEndStep(Number(g.step[1])),
        idea: () => (g.step === 'write' ? this.ideaToGen() : g.step === 'gen' ? this.ideaToGuess() : this.ideaReveal()) }[this.mode];
      this.setTimer(left, fin);
    }
  }
  pub() {
    const pl = {};
    for (const n of PLAYERS) { const p = this.pl[n]; pl[n] = [p.joined ? 1 : 0, p.on ? 1 : 0, p.peer]; }
    return { now: Date.now(), mode: this.mode, rq: this.rq, pl, ...this.g };
  }
}

if (typeof module !== 'undefined') module.exports = { Party, PLAYERS, PCOLORS, WHO_Q, FUNNY_Q, DRAW_W, IDEA_T, cleanDrawing, T };
