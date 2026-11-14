// «Иббенбюрен: наша команда» — данные поля, правила и движок игры.
// Движок работает только у хоста; телефоны игроков получают его публичное состояние.

const PLAYERS = ['Марина', 'Даша', 'Андрей', 'Сережа'];
const PCOLORS = { 'Марина': '#ff4d6d', 'Даша': '#a66bff', 'Андрей': '#2f8cff', 'Сережа': '#22c55e' };
const START_MONEY = 1500;
const SALARY = 200;
const JAIL_FINE = 50;
const JAIL = 10;

// Цветные группы: цвет полосы и цена дома
const GROUPS = [
  { name: 'Окраины', c: '#8d5a3b', house: 50 },
  { name: 'Продукты', c: '#79cdf2', house: 50 },
  { name: 'Выходные', c: '#e04da5', house: 100 },
  { name: 'Красота', c: '#f7941d', house: 100 },
  { name: 'Еда и тусовки', c: '#e53935', house: 150 },
  { name: 'Оснабрюк и Кирмес', c: '#f2c400', house: 150 },
  { name: 'Большой бизнес', c: '#2e9e4f', house: 200 },
  { name: 'Олигархи', c: '#2350c4', house: 200 },
];

const P = (g, n, s, e, p, d) => ({ t: 'prop', g, n, s, e, p, d });
const CELLS = [
  { t: 'start', n: 'Старт', s: 'СТАРТ', e: '🏁', d: 'Проходишь через Старт — получаешь 200 €.' },
  P(0, 'Зассанный каток', 'Каток', '⛸️', 60, 'Лёд жёлтый, но атмосфера бесценна.'),
  { t: 'bank', n: 'Банк', s: 'Банк', e: '🏦' },
  P(0, 'Bratwurst фургон', 'Bratwurst', '🌭', 60, 'Колбаска с горчицей — топливо Иббенбюрена.'),
  { t: 'tax', n: 'GEZ-сбор', s: 'GEZ', e: '📺', amt: 200, d: 'Платишь за телевизор, который не смотришь: 200 €.' },
  { t: 'rail', n: 'ДБ', s: 'ДБ', e: '🚆', p: 200, d: 'Deutsche Bahn: опоздание включено в стоимость.' },
  P(1, 'Netto', 'Netto', '🛒', 100, 'Жёлто-красная скидочная классика.'),
  { t: 'luck', n: 'Удача', s: 'Удача', e: '🍀' },
  P(1, 'Rewe', 'Rewe', '🧺', 100, 'Тут всегда очередь на одну кассу.'),
  P(1, 'Булочная возле ДБ', 'Булочная', '🥐', 120, 'Бретцель на бегу перед поездом.'),
  { t: 'jail', n: 'Тюрьма', s: 'Тюрьма', e: '🚔', d: 'Просто в гостях, если тебя сюда не отправили.' },
  P(2, 'Ярмарка в пятницу', 'Ярмарка', '🎪', 140, 'Пятничный рынок: сыр, мёд и сплетни.'),
  { t: 'util', n: 'Stadtwerke', s: 'Stadtwerke', e: '💡', p: 150, d: 'Свет и газ всего города.' },
  P(2, 'Трендшоп', 'Трендшоп', '🛍️', 140, 'Всё, что модно этим летом.'),
  P(2, 'Пляж на Аасее', 'Аасее', '🏖️', 160, 'Озеро, пледы и гриль по выходным.'),
  { t: 'rail', n: 'Автобус Р15', s: 'Р15', e: '🚌', p: 200, d: 'Едет, когда захочет.' },
  P(3, 'Барбершоп у Джавида', 'Барбершоп', '💈', 180, 'Джавид знает всё про всех.'),
  { t: 'bank', n: 'Банк', s: 'Банк', e: '🏦' },
  P(3, 'Салон маникюра азиатов', 'Маникюр', '💅', 180, 'Быстро, ровно и без записи.'),
  P(3, 'Суши бар', 'Суши', '🍣', 200, 'Безлимитные роллы до потери пульса.'),
  { t: 'casino', n: 'Казино', s: 'Казино', e: '🎰', d: 'Рулетка: ставь от 10 до 500 € на красное или чёрное (выигрыш ×2) либо на зеро (×36). Можно просто пройти мимо.' },
  P(4, 'Пиццерия Торино', 'Торино', '🍕', 220, 'Лучшая пицца в округе.'),
  { t: 'luck', n: 'Удача', s: 'Удача', e: '🍀' },
  P(4, 'Басбанхоф', 'Басбанхоф', '🚏', 220, 'Здесь все встречаются, ждут и опаздывают.'),
  P(4, 'Экстраблатт', 'Экстраблатт', '🍹', 240, 'Коктейли, завтраки и долгие разговоры.'),
  { t: 'rail', n: 'Такси', s: 'Такси', e: '🚕', p: 200, d: 'Ночной тариф после Экстраблатта.' },
  P(5, 'Макдональдс в Оснабрюке', 'McD Оснабрюк', '🍔', 260, 'Ради него стоит ехать в Оснабрюк.'),
  P(5, 'Кирмес', 'Кирмес', '🎡', 260, 'Карусели, сладкая вата и громкая музыка.'),
  { t: 'util', n: 'Vodafone Wi-Fi', s: 'Vodafone', e: '📶', p: 150, d: 'Интернет, который работает через раз.' },
  P(5, 'Neumarkt в Оснабрюке', 'Neumarkt', '🏙️', 280, 'Центр Оснабрюка: шопинг и трамваи.'),
  { t: 'gojail', n: 'В тюрьму!', s: 'В тюрьму', e: '👮', d: 'Отправляйся прямо в тюрьму, через Старт не проходишь.' },
  P(6, 'Галерея в Райне', 'Галерея Райне', '🏬', 300, 'Торговый центр, где теряют деньги и время.'),
  P(6, 'Склад Fiege', 'Fiege', '📦', 300, 'Логистика на весь регион.'),
  { t: 'bank', n: 'Банк', s: 'Банк', e: '🏦' },
  P(6, 'Amazon', 'Amazon', '🚚', 320, 'Доставка завтра, но приходит послезавтра.'),
  { t: 'rail', n: 'Самолёт', s: 'Самолёт', e: '✈️', p: 200, d: 'Рейс из Мюнстер-Оснабрюка.' },
  { t: 'luck', n: 'Удача', s: 'Удача', e: '🍀' },
  P(7, 'Завод по производству электрических стелек', 'Завод стелек', '🔌', 350, 'Тёплые ноги — богатые люди.'),
  { t: 'tax', n: 'Штраф за парковку', s: 'Штраф', e: '🚫', amt: 100, d: 'Парковался у Rewe дольше 90 минут: 100 €.' },
  P(7, 'Угольная шахта', 'Шахта', '⛏️', 400, 'Легенда Иббенбюрена. Глубже некуда.'),
];
const RAILS = [5, 15, 25, 35];
// Рулетка (европейская, 37 ячеек)
const WHEEL = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const rouletteColor = (r) => (r === 0 ? 'zero' : REDS.includes(r) ? 'red' : 'black');
const CASINO_MIN = 10, CASINO_MAX = 500;
const OWNABLE = (c) => ['prop', 'rail', 'util'].includes(CELLS[c].t);
const groupCells = (g) => CELLS.map((x, i) => (x.t === 'prop' && x.g === g ? i : -1)).filter((i) => i >= 0);

// Аренда: без домов, затем 1–4 дома и отель
function rentTable(price) {
  const r0 = Math.max(2, Math.round((price * 0.065) / 2) * 2);
  const r1 = r0 * 5;
  const r2 = r1 * 3;
  const r3 = Math.round((r2 * 2.6) / 10) * 10;
  const r4 = Math.round((r3 * 1.25) / 10) * 10;
  const r5 = Math.round((r4 * 1.2) / 10) * 10;
  return [r0, r1, r2, r3, r4, r5];
}
const RAIL_RENT = [0, 25, 50, 100, 200];
const mortgageValue = (c) => CELLS[c].p / 2;
const unmortgageCost = (c) => Math.ceil(CELLS[c].p / 2 * 1.1);

// ---------- Карточки (шуточные, про две пары) ----------
const LUCK = [
  { x: 'Сережа забыл годовщину с Мариной. Срочно покупаешь цветы на заправке: −50 €.', k: 'money', v: -50 },
  { x: 'Андрей и Даша выиграли на Кирмесе огромного медведя и продали его на Kleinanzeigen: +100 €.', k: 'money', v: 100 },
  { x: 'Марина увидела скидки в Трендшопе. Иди на «Трендшоп».', k: 'goto', c: 13 },
  { x: 'Таксист узнал Сережу: «Опять ты?» Езжай до ближайшего транспорта. Если он чей-то, плати владельцу двойную цену.', k: 'rail' },
  { x: 'Даша решила, что пора на шопинг. Иди в «Галерею в Райне».', k: 'goto', c: 31 },
  { x: 'Андрей перепутал автобус Р15 и уехал не туда. Отойди на 3 клетки назад.', k: 'back', v: 3 },
  { x: 'Полиция застала вас ночью на зассанном катке. Отправляйся в тюрьму.', k: 'jail' },
  { x: 'Сережа знает Джавида, а Джавид знает всех. Бесплатный выход из тюрьмы — оставь карту себе.', k: 'jcard' },
  { x: 'Двойное свидание в суши-баре, и счёт достался тебе. Заплати каждому игроку по 50 €.', k: 'payEach', v: 50 },
  { x: 'Иди на Старт и получи 200 €.', k: 'goto', c: 0 },
  { x: 'Марина затеяла ремонт и Сережа не смог отказать. За каждый дом заплати 25 €, за каждый отель 100 €.', k: 'repairs', h: 25, H: 100 },
  { x: 'Ты выиграл(а) спор, какая пара первой поженится: +150 €.', k: 'money', v: 150 },
  { x: 'Андрей уснул в ДБ и проснулся в Мюнстере. Иди на «ДБ».', k: 'goto', c: 5 },
  { x: 'Даше приснилось, что шахту снова открыли. Иди на «Угольную шахту».', k: 'goto', c: 39 },
  { x: 'Штраф за езду на велосипеде без света: −15 €.', k: 'money', v: -15 },
  { x: 'Электрические стельки Сережи задымились прямо в Rewe. Ремонт: −100 €.', k: 'money', v: -100 },
];
const BANK = [
  { x: 'Ошибка банка в твою пользу: +200 €.', k: 'money', v: 200 },
  { x: 'Андрей наконец вернул Даше деньги за маникюр. Но платишь почему-то ты: −100 €.', k: 'money', v: -100 },
  { x: 'Марина нашла 50 € в зимней куртке Сережи и честно поделилась: +50 €.', k: 'money', v: 50 },
  { x: 'У тебя день рождения! Каждый игрок дарит тебе по 10 €.', k: 'collectEach', v: 10 },
  { x: 'Сережа продал на Kleinanzeigen старый фен Марины: +100 €.', k: 'money', v: 100 },
  { x: 'Страховка AOK прислала доплату: −50 €.', k: 'money', v: -50 },
  { x: 'Finanzamt вернул налог: +20 €.', k: 'money', v: 20 },
  { x: 'Даша — лучший адвокат. Бесплатный выход из тюрьмы — оставь карту себе.', k: 'jcard' },
  { x: 'Иди на Старт и получи 200 €.', k: 'goto', c: 0 },
  { x: 'Андрей поспорил с контролёром в ДБ, а забрали тебя. Отправляйся в тюрьму.', k: 'jail' },
  { x: 'Пары скинулись на совместный отпуск. Твоя доля: −100 €.', k: 'money', v: -100 },
  { x: 'Ремонт улиц Иббенбюрена. За каждый дом заплати 40 €, за каждый отель 115 €.', k: 'repairs', h: 40, H: 115 },
  { x: 'Ты занял(а) второе место на конкурсе ногтей в салоне маникюра: +10 €.', k: 'money', v: 10 },
  { x: 'Наследство от тётушки из Оснабрюка: +100 €.', k: 'money', v: 100 },
  { x: 'Вторая пара подарила вам подарок на годовщину: +100 €.', k: 'money', v: 100 },
  { x: 'Курс бачаты для двоих. Ваша половина: −50 €.', k: 'money', v: -50 },
];

// ---------- Честный случай ----------
function rnd(n) {
  // Без перекоса: отбрасываем значения из «хвоста»
  const c = (typeof crypto !== 'undefined' && crypto.getRandomValues) ? crypto : require('crypto').webcrypto;
  const lim = Math.floor(0x100000000 / n) * n;
  const a = new Uint32Array(1);
  do c.getRandomValues(a); while (a[0] >= lim);
  return a[0] % n;
}
const d6 = () => 1 + rnd(6);
function shuffled(n) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// ---------- Правила (общие для хоста и телефонов) ----------
const R = {
  owner: (s, c) => s.own[c]?.o || null,
  ownsGroup(s, n, g) { return groupCells(g).every((c) => s.own[c]?.o === n); },
  railsOwned(s, n) { return RAILS.filter((c) => s.own[c]?.o === n).length; },
  utilsOwned(s, n) { return [12, 28].filter((c) => s.own[c]?.o === n).length; },
  rent(s, c, diceSum, mult = 1) {
    const o = s.own[c];
    if (!o || o.m) return 0;
    const cell = CELLS[c];
    if (cell.t === 'rail') return RAIL_RENT[R.railsOwned(s, o.o)] * mult;
    if (cell.t === 'util') return diceSum * (R.utilsOwned(s, o.o) === 2 ? 10 : 4) * mult;
    const t = rentTable(cell.p);
    if (o.h > 0) return t[o.h];
    return t[0] * (R.ownsGroup(s, o.o, cell.g) ? 2 : 1);
  },
  groupHasBuildings(s, g) { return groupCells(g).some((c) => (s.own[c]?.h || 0) > 0); },
  canBuild(s, n, c) {
    const o = s.own[c], cell = CELLS[c];
    if (!o || o.o !== n || cell.t !== 'prop' || o.h >= 5) return 'Нельзя';
    if (!R.ownsGroup(s, n, cell.g)) return 'Нужна вся цветная группа';
    const gc = groupCells(cell.g);
    if (gc.some((x) => s.own[x].m)) return 'В группе есть заложенные улицы';
    if (o.h > Math.min(...gc.map((x) => s.own[x].h))) return 'Строй равномерно: сначала на других улицах группы';
    if (o.h === 4 ? s.hotels <= 0 : s.houses <= 0) return 'В банке кончились дома';
    if (s.pl[n].money < GROUPS[cell.g].house) return 'Не хватает денег';
    return null;
  },
  canSell(s, n, c) {
    const o = s.own[c], cell = CELLS[c];
    if (!o || o.o !== n || cell.t !== 'prop' || o.h <= 0) return 'Нечего продавать';
    if (o.h < Math.max(...groupCells(cell.g).map((x) => s.own[x].h))) return 'Продавай равномерно: сначала с других улиц группы';
    if (o.h === 5 && s.houses < 4) return 'В банке не хватает домов, чтобы разменять отель';
    return null;
  },
  canMortgage(s, n, c) {
    const o = s.own[c];
    if (!o || o.o !== n || o.m) return 'Нельзя';
    if (CELLS[c].t === 'prop' && R.groupHasBuildings(s, CELLS[c].g)) return 'Сначала продай дома в этой группе';
    return null;
  },
  canUnmortgage(s, n, c) {
    const o = s.own[c];
    if (!o || o.o !== n || !o.m) return 'Нельзя';
    if (s.pl[n].money < unmortgageCost(c)) return 'Не хватает денег';
    return null;
  },
  tradable(s, n, c) {
    const o = s.own[c];
    return !!o && o.o === n && !(CELLS[c].t === 'prop' && R.groupHasBuildings(s, CELLS[c].g));
  },
  worth(s, n) {
    let w = s.pl[n].money;
    for (const c in s.own) {
      const o = s.own[c];
      if (o.o !== n) continue;
      w += o.m ? CELLS[c].p / 2 : CELLS[c].p;
      if (CELLS[c].t === 'prop') w += o.h * GROUPS[CELLS[c].g].house;
    }
    return w;
  },
};

// ---------- Движок (у хоста) ----------
class Engine {
  constructor(onChange, saved) {
    this.onChange = onChange;
    this.timer = null;
    if (saved) this.restore(saved); else this.reset();
  }
  reset() {
    clearTimeout(this.timer);
    const old = this.pl;
    this.pl = {};
    for (const n of PLAYERS) {
      this.pl[n] = { money: START_MONEY, pos: 0, jail: false, jt: 0, jc: 0, out: false,
        joined: !!old?.[n]?.joined, on: !!old?.[n]?.on, peer: old?.[n]?.peer ?? null };
    }
    this.g = { ph: 'lobby', order: [], turn: 0, step: 'roll', dice: [0, 0], dbl: 0, again: false, landPending: false, rentMult: 1,
      ev: [], evId: 0, own: {}, offer: null, auc: null, debts: [], card: null, cardId: 0, trade: null, tradeId: 0,
      log: [], houses: 32, hotels: 12, rank: null };
    this.decks = { luck: shuffled(LUCK.length), bank: shuffled(BANK.length) };
    this.rq = this.rq || [];
    this.ok = this.ok || {};
  }
  changed() { this.onChange && this.onChange(); }
  state() { return { own: this.g.own, pl: this.pl, houses: this.g.houses, hotels: this.g.hotels }; }
  log(t) { this.g.log.push(t); if (this.g.log.length > 30) this.g.log.shift(); }
  // События для анимаций на телефонах: проигрываются по очереди
  ev(k, d) { const g = this.g; g.ev.push({ id: ++g.evId, k, ...d }); if (g.ev.length > 30) g.ev.shift(); }
  cur() { return this.g.order[this.g.turn]; }
  alive() { return this.g.order.filter((n) => !this.pl[n].out); }
  fmt(v) { return v + ' €'; }

  // --- игроки и вход по ссылке ---
  join(name, peer, trusted) {
    const p = this.pl[name];
    if (!p) return 'Нет такого игрока';
    if (p.on && p.peer && p.peer !== peer) return name + ' уже играет на другом телефоне';
    if (this.g.ph !== 'lobby' && !p.joined) return 'Игра уже идёт без этого игрока';
    if (!trusted && !this.ok[peer]) {
      this.rq = this.rq.filter((r) => r[1] !== peer).concat([[name, peer]]).slice(-8);
      this.changed();
      return null;
    }
    for (const n of PLAYERS) if (n !== name && this.pl[n].peer === peer) { this.pl[n].on = false; this.pl[n].peer = null; }
    Object.assign(p, { joined: true, on: true, peer });
    this.changed();
    return null;
  }
  approve(peer, yes) {
    const r = this.rq.find((x) => x[1] === peer);
    this.rq = this.rq.filter((x) => x[1] !== peer);
    if (r && yes) { this.ok[peer] = 1; if (this.join(r[0], peer, true)) this.changed(); } else this.changed();
  }
  dropPeer(peer) {
    let ch = false;
    for (const n of PLAYERS) if (this.pl[n].peer === peer && this.pl[n].on) { this.pl[n].on = false; ch = true; }
    if (this.rq.some((r) => r[1] === peer)) { this.rq = this.rq.filter((r) => r[1] !== peer); ch = true; }
    if (ch) this.changed();
  }
  markPeer(peer) {
    let ch = false;
    for (const n of PLAYERS) if (this.pl[n].peer === peer && this.pl[n].joined && !this.pl[n].on) { this.pl[n].on = true; ch = true; }
    if (ch) this.changed();
  }

  // --- начало ---
  start() {
    const js = PLAYERS.filter((n) => this.pl[n].joined);
    if (this.g.ph !== 'lobby' || js.length < 2) return;
    const ord = shuffled(js.length).map((i) => js[i]);
    this.reset();
    this.g.ph = 'play';
    this.g.order = ord;
    for (const n of PLAYERS) if (!ord.includes(n)) this.pl[n].out = true;
    this.log('Игра началась! Порядок ходов: ' + ord.join(' → '));
    this.changed();
  }

  // --- бросок ---
  roll(n) {
    const g = this.g, p = this.pl[n];
    if (g.ph !== 'play' || n !== this.cur() || g.step !== 'roll') return;
    const a = d6(), b = d6(), dbl = a === b;
    g.dice = [a, b];
    g.card = null;
    this.ev('dice', { who: n, d: [a, b] });
    this.log(`${n} бросает ${a} и ${b}${dbl ? ' — дубль!' : ''}`);
    if (p.jail) {
      if (dbl) {
        p.jail = false; p.jt = 0; g.again = false;
        this.log(`${n}: дубль — выход из тюрьмы`);
        this.move(n, a + b);
        g.landPending = true;
        return this.proceed();
      }
      p.jt += 1;
      if (p.jt >= 3) {
        p.jail = false; p.jt = 0; g.again = false;
        this.log(`${n}: три попытки без дубля — штраф ${this.fmt(JAIL_FINE)} и выход из тюрьмы`);
        this.charge(n, null, JAIL_FINE, 'выход из тюрьмы');
        this.move(n, a + b);
        g.landPending = true;
        return this.proceed();
      }
      this.log(`${n} остаётся в тюрьме (попытка ${p.jt} из 3)`);
      g.again = false;
      return this.proceed();
    }
    if (dbl) {
      g.dbl += 1;
      if (g.dbl >= 3) {
        this.log(`${n}: три дубля подряд — в тюрьму!`);
        this.sendJail(n);
        return this.proceed();
      }
    }
    g.again = dbl;
    this.move(n, a + b);
    g.landPending = true;
    this.proceed();
  }
  payJail(n) {
    const g = this.g, p = this.pl[n];
    if (n !== this.cur() || g.step !== 'roll' || !p.jail || p.money < JAIL_FINE) return;
    p.money -= JAIL_FINE; p.jail = false; p.jt = 0;
    this.log(`${n} платит ${this.fmt(JAIL_FINE)} и выходит из тюрьмы`);
    this.changed();
  }
  useJailCard(n) {
    const g = this.g, p = this.pl[n];
    if (n !== this.cur() || g.step !== 'roll' || !p.jail || p.jc <= 0) return;
    p.jc -= 1; p.jail = false; p.jt = 0;
    this.log(`${n} использует карту «Выйти из тюрьмы»`);
    this.changed();
  }

  // --- движение ---
  move(n, steps, kind = 'walk') {
    const p = this.pl[n], from = p.pos;
    const to = ((from + steps) % 40 + 40) % 40;
    p.pos = to;
    this.ev('move', { who: n, from, steps, to, kind });
    if (steps > 0 && from + steps >= 40) { p.money += SALARY; this.log(`${n} проходит Старт: +${this.fmt(SALARY)}`); this.ev('gain', { who: n, amt: SALARY, why: 'Старт' }); }
  }
  moveTo(n, target) { this.move(n, (target - this.pl[n].pos + 40) % 40 || 40); }
  sendJail(n) {
    const p = this.pl[n], g = this.g;
    this.ev('jail', { who: n });
    this.ev('move', { who: n, from: p.pos, steps: 0, to: JAIL, kind: 'jump' });
    p.pos = JAIL; p.jail = true; p.jt = 0;
    g.again = false; g.dbl = 0; g.landPending = false;
  }

  // --- что происходит на клетке ---
  land() {
    const g = this.g, n = this.cur(), p = this.pl[n], c = p.pos, cell = CELLS[c];
    const mult = g.rentMult; g.rentMult = 1;
    if (OWNABLE(c)) {
      const o = g.own[c];
      if (!o) { g.offer = c; g.step = 'buy'; return this.changed(); }
      if (o.o !== n && !o.m) {
        const rent = R.rent(this.state(), c, g.dice[0] + g.dice[1], mult);
        this.log(`${n} платит ${o.o} аренду ${this.fmt(rent)} за «${cell.n}»`);
        this.charge(n, o.o, rent, 'аренда');
      }
    } else if (cell.t === 'tax') {
      this.log(`${n}: ${cell.n} −${this.fmt(cell.amt)}`);
      this.charge(n, null, cell.amt, cell.n);
    } else if (cell.t === 'casino') {
      g.step = 'casino';
      return this.changed();
    } else if (cell.t === 'gojail') {
      this.log(`${n} отправляется в тюрьму`);
      this.sendJail(n);
    } else if (cell.t === 'luck' || cell.t === 'bank') {
      const deck = cell.t, list = deck === 'luck' ? LUCK : BANK;
      const i = this.decks[deck].shift(); this.decks[deck].push(i);
      const card = list[i];
      g.card = { id: ++g.cardId, deck, i, who: n };
      this.ev('card', { who: n, deck, i });
      this.log(`${n} тянет «${deck === 'luck' ? 'Удачу' : 'Банк'}»`);
      this.applyCard(n, card);
    }
    this.proceed();
  }
  applyCard(n, k) {
    const g = this.g, p = this.pl[n];
    switch (k.k) {
      case 'money': if (k.v >= 0) { p.money += k.v; this.ev('gain', { who: n, amt: k.v, why: 'карточка' }); } else this.charge(n, null, -k.v, 'карточка'); break;
      case 'jcard': p.jc += 1; this.ev('note', { t: `${n} получает карту «Выйти из тюрьмы»` }); break;
      case 'goto': this.moveTo(n, k.c); g.landPending = true; break;
      case 'back': this.move(n, -k.v, 'back'); g.landPending = true; break;
      case 'jail': this.sendJail(n); break;
      case 'payEach': for (const o of this.alive()) if (o !== n) this.charge(n, o, k.v, 'карточка'); break;
      case 'collectEach': for (const o of this.alive()) if (o !== n) this.charge(o, n, k.v, 'подарок'); break;
      case 'repairs': {
        let h = 0, H = 0;
        for (const c in g.own) if (g.own[c].o === n) { const x = g.own[c].h; if (x === 5) H++; else h += x; }
        const sum = h * k.h + H * k.H;
        if (sum) this.charge(n, null, sum, 'ремонт'); else this.log(`${n}: домов нет, ремонт бесплатно`);
        break;
      }
      case 'rail': {
        const next = RAILS.find((c) => c > p.pos) ?? RAILS[0];
        this.moveTo(n, next); g.rentMult = 2; g.landPending = true; break;
      }
    }
  }
  // Платёж: если денег не хватает — долг, игра ждёт
  charge(from, to, amt, why) {
    const p = this.pl[from];
    if (amt <= 0) return;
    if (p.money >= amt && !this.g.debts.some((d) => d.who === from)) {
      p.money -= amt;
      if (to) this.pl[to].money += amt;
      this.ev('pay', { from, to, amt, why });
    } else {
      this.g.debts.push({ who: from, to, amt, why });
      this.ev('note', { t: `${from}: не хватает ${amt} €!` });
      this.log(`${from} не хватает денег: должен ${this.fmt(amt)}${to ? ' игроку ' + to : ' банку'}`);
    }
  }
  proceed() {
    const g = this.g;
    if (g.ph !== 'play') return this.changed();
    if (g.debts.length) { g.step = 'debt'; return this.changed(); }
    if (g.auc) { g.step = 'auction'; return this.changed(); }
    if (g.landPending) { g.landPending = false; return this.land(); }
    g.step = g.again ? 'roll' : 'end';
    this.changed();
  }
  endTurn(n, force) {
    const g = this.g;
    if (g.ph !== 'play' || (!force && (n !== this.cur() || g.step !== 'end'))) return;
    if (force && (g.debts.length || g.auc)) return;
    this.nextTurn();
  }
  nextTurn() {
    const g = this.g;
    g.dbl = 0; g.again = false; g.landPending = false; g.offer = null; g.rentMult = 1;
    if (this.alive().length <= 1) return this.finish();
    do g.turn = (g.turn + 1) % g.order.length; while (this.pl[g.order[g.turn]].out);
    g.step = 'roll';
    this.log(`Ход: ${this.cur()}`);
    this.changed();
  }

  // --- покупка и аукцион ---
  buy(n) {
    const g = this.g, c = g.offer;
    if (g.step !== 'buy' || n !== this.cur() || c == null || this.pl[n].money < CELLS[c].p) return;
    this.pl[n].money -= CELLS[c].p;
    g.own[c] = { o: n, h: 0, m: 0 };
    g.offer = null;
    this.log(`${n} покупает «${CELLS[c].n}» за ${this.fmt(CELLS[c].p)}`);
    this.ev('buy', { who: n, c, amt: CELLS[c].p });
    this.proceed();
  }
  decline(n) {
    const g = this.g;
    if (g.step !== 'buy' || n !== this.cur() || g.offer == null) return;
    g.auc = { c: g.offer, bid: 0, by: null, dl: Date.now() + 15000 };
    g.offer = null;
    this.log(`«${CELLS[g.auc.c].n}» уходит на аукцион`);
    this.armAuction();
    this.proceed();
  }
  casinoBet(n, amt, on) {
    const g = this.g, p = this.pl[n];
    amt = Math.floor(Number(amt));
    if (g.step !== 'casino' || n !== this.cur() || !['red', 'black', 'zero'].includes(on)) return;
    if (!(amt >= CASINO_MIN && amt <= Math.min(CASINO_MAX, p.money))) return;
    const r = rnd(37), win = rouletteColor(r) === on;
    const net = win ? (on === 'zero' ? amt * 35 : amt) : -amt;
    p.money += net;
    const names = { red: 'красное', black: 'чёрное', zero: 'зеро' };
    this.log(`🎰 ${n} ставит ${this.fmt(amt)} на ${names[on]}. Выпало ${r} — ${win ? 'выигрыш +' + this.fmt(net) : 'проигрыш ' + this.fmt(amt)}`);
    this.ev('roulette', { who: n, amt, on, r, net });
    this.proceed();
  }
  casinoSkip(n) {
    if (this.g.step !== 'casino' || n !== this.cur()) return;
    this.log(`🎰 ${n} проходит мимо казино`);
    this.proceed();
  }
  pass(n) {
    const g = this.g;
    if (g.step !== 'buy' || n !== this.cur() || g.offer == null) return;
    this.log(`${n} не покупает «${CELLS[g.offer].n}»`);
    this.ev('note', { t: `${n} не покупает «${CELLS[g.offer].n}»` });
    g.offer = null;
    this.proceed();
  }
  armAuction() {
    clearTimeout(this.timer);
    const left = Math.max(0, this.g.auc.dl - Date.now());
    this.timer = setTimeout(() => this.endAuction(), left);
  }
  bid(n, amt) {
    const a = this.g.auc, p = this.pl[n];
    amt = Math.floor(Number(amt));
    if (!a || !p || p.out || !this.g.order.includes(n) || !(amt > a.bid) || amt > p.money) return;
    a.bid = amt; a.by = n;
    a.dl = Math.max(a.dl, Date.now() + 8000);
    this.armAuction();
    this.changed();
  }
  endAuction() {
    const g = this.g, a = g.auc;
    if (!a) return;
    if (a.by && this.pl[a.by].money >= a.bid) {
      this.pl[a.by].money -= a.bid;
      g.own[a.c] = { o: a.by, h: 0, m: 0 };
      this.log(`${a.by} выигрывает аукцион: «${CELLS[a.c].n}» за ${this.fmt(a.bid)}`);
      this.ev('buy', { who: a.by, c: a.c, amt: a.bid, auc: 1 });
    } else this.log(`На «${CELLS[a.c].n}» никто не поставил, улица осталась у банка`);
    g.auc = null;
    this.proceed();
  }

  // --- дома, залог ---
  build(n, c) {
    if (R.canBuild(this.state(), n, c) || this.g.ph !== 'play') return;
    const o = this.g.own[c];
    this.pl[n].money -= GROUPS[CELLS[c].g].house;
    if (o.h === 4) { this.g.hotels--; this.g.houses += 4; } else this.g.houses--;
    o.h++;
    this.log(`${n} строит ${o.h === 5 ? 'отель' : 'дом'} на «${CELLS[c].n}»`);
    this.ev('note', { t: `🏗️ ${n} строит ${o.h === 5 ? 'отель' : 'дом'}: ${CELLS[c].s}` });
    this.changed();
  }
  sell(n, c) {
    if (R.canSell(this.state(), n, c) || this.g.ph !== 'play') return;
    const o = this.g.own[c];
    if (o.h === 5) { this.g.hotels++; this.g.houses -= 4; } else this.g.houses++;
    o.h--;
    const back = GROUPS[CELLS[c].g].house / 2;
    this.pl[n].money += back;
    this.log(`${n} продаёт ${o.h === 4 ? 'отель' : 'дом'} на «${CELLS[c].n}»: +${this.fmt(back)}`);
    this.changed();
  }
  mortgage(n, c) {
    if (R.canMortgage(this.state(), n, c) || this.g.ph !== 'play') return;
    this.g.own[c].m = 1;
    this.pl[n].money += mortgageValue(c);
    this.log(`${n} закладывает «${CELLS[c].n}»: +${this.fmt(mortgageValue(c))}`);
    this.changed();
  }
  unmortgage(n, c) {
    if (R.canUnmortgage(this.state(), n, c) || this.g.ph !== 'play') return;
    this.g.own[c].m = 0;
    this.pl[n].money -= unmortgageCost(c);
    this.log(`${n} выкупает «${CELLS[c].n}» из залога: −${this.fmt(unmortgageCost(c))}`);
    this.changed();
  }

  // --- долги и банкротство ---
  payDebt(n) {
    const g = this.g, d = g.debts[0];
    if (!d || d.who !== n || this.pl[n].money < d.amt) return;
    this.pl[n].money -= d.amt;
    if (d.to) this.pl[d.to].money += d.amt;
    this.log(`${n} гасит долг ${this.fmt(d.amt)}`);
    this.ev('pay', { from: n, to: d.to, amt: d.amt, why: 'долг' });
    g.debts.shift();
    this.proceed();
  }
  bankrupt(n) {
    const g = this.g, d = g.debts[0];
    if (!d || d.who !== n) return;
    const p = this.pl[n], to = d.to;
    // Дома продаются банку за полцены
    for (const c in g.own) {
      const o = g.own[c];
      if (o.o !== n || !o.h) continue;
      p.money += (o.h * GROUPS[CELLS[c].g].house) / 2;
      if (o.h === 5) { g.hotels++; } else g.houses += o.h;
      o.h = 0;
    }
    if (to) {
      this.pl[to].money += p.money;
      this.pl[to].jc += p.jc;
      for (const c in g.own) if (g.own[c].o === n) g.own[c].o = to;
      this.log(`${n} банкрот! Всё имущество переходит к ${to}`);
      this.ev('note', { t: `💥 ${n} банкрот!`, big: 1 });
    } else {
      for (const c in g.own) if (g.own[c].o === n) delete g.own[c];
      this.log(`${n} банкрот! Улицы возвращаются банку`);
      this.ev('note', { t: `💥 ${n} банкрот!`, big: 1 });
    }
    p.money = 0; p.jc = 0; p.out = true;
    g.debts = g.debts.filter((x) => x.who !== n).map((x) => (x.to === n ? { ...x, to: null } : x));
    if (g.trade && (g.trade.from === n || g.trade.to === n)) g.trade = null;
    if (this.alive().length <= 1) return this.finish();
    if (this.cur() === n) {
      g.landPending = false; g.again = false; g.offer = null;
      if (g.debts.length) return this.proceed();
      return this.nextTurn();
    }
    this.proceed();
  }

  // --- сделки ---
  tradeOk(t) {
    const s = this.state(), A = this.pl[t.from], B = this.pl[t.to];
    if (!A || !B || A.out || B.out || t.from === t.to) return false;
    if (!(t.gm >= 0 && t.rm >= 0 && t.gm <= A.money && t.rm <= B.money)) return false;
    if (!(t.gj >= 0 && t.rj >= 0 && t.gj <= A.jc && t.rj <= B.jc)) return false;
    if (!t.gc.every((c) => R.tradable(s, t.from, c)) || !t.rc.every((c) => R.tradable(s, t.to, c))) return false;
    return t.gm + t.rm + t.gj + t.rj + t.gc.length + t.rc.length > 0;
  }
  propose(n, d) {
    const g = this.g;
    if (g.ph !== 'play' || g.trade || this.pl[n]?.out) return;
    const num = (v) => Math.max(0, Math.floor(Number(v) || 0));
    const cells = (a) => [...new Set((Array.isArray(a) ? a : []).map(Number).filter((c) => c >= 0 && c < 40))];
    const t = { id: ++g.tradeId, from: n, to: String(d.to), gm: num(d.gm), rm: num(d.rm), gj: num(d.gj), rj: num(d.rj), gc: cells(d.gc), rc: cells(d.rc) };
    if (!this.tradeOk(t)) return;
    g.trade = t;
    this.log(`${n} предлагает сделку игроку ${t.to}`);
    this.changed();
  }
  tradeAnswer(n, yes) {
    const g = this.g, t = g.trade;
    if (!t || n !== t.to) return;
    g.trade = null;
    if (!yes) { this.log(`${n} отклоняет сделку`); return this.changed(); }
    if (!this.tradeOk(t)) { this.log('Сделка сорвалась: условия изменились'); return this.changed(); }
    const A = this.pl[t.from], B = this.pl[t.to];
    A.money += t.rm - t.gm; B.money += t.gm - t.rm;
    A.jc += t.rj - t.gj; B.jc += t.gj - t.rj;
    for (const c of t.gc) g.own[c].o = t.to;
    for (const c of t.rc) g.own[c].o = t.from;
    this.log(`Сделка между ${t.from} и ${t.to} состоялась`);
    this.ev('note', { t: `🤝 Сделка: ${t.from} и ${t.to}` });
    this.changed();
  }
  tradeCancel(n) {
    if (this.g.trade && this.g.trade.from === n) { this.g.trade = null; this.changed(); }
  }

  // --- конец игры ---
  finish() {
    clearTimeout(this.timer);
    const g = this.g;
    g.ph = 'over';
    g.auc = null; g.trade = null; g.debts = [];
    const s = this.state();
    g.rank = g.order.map((n) => [n, this.pl[n].out ? 0 : R.worth(s, n), this.pl[n].out ? 1 : 0])
      .sort((a, b) => a[2] - b[2] || b[1] - a[1]);
    this.log(`Игра окончена! Победитель: ${g.rank[0][0]}`);
    this.changed();
  }

  // --- снимок и публичное состояние ---
  snapshot() { return { pl: this.pl, g: this.g, decks: this.decks, ok: this.ok }; }
  restore(s) {
    this.pl = s.pl; this.g = s.g; this.decks = s.decks; this.ok = s.ok || {}; this.rq = [];
    this.g.ev = this.g.ev || []; this.g.evId = this.g.evId || 0;
    for (const n of PLAYERS) this.pl[n].on = false;
    if (this.g.auc) setTimeout(() => this.armAuction(), 0);
  }
  pub() {
    const pl = {};
    for (const n of PLAYERS) { const p = this.pl[n]; pl[n] = [p.money, p.pos, p.jail ? 1 : 0, p.jt, p.jc, p.out ? 1 : 0, p.joined ? 1 : 0, p.on ? 1 : 0, p.peer]; }
    const g = this.g;
    return { now: Date.now(), rq: this.rq, pl, ph: g.ph, order: g.order, turn: g.turn, step: g.step, dice: g.dice, dbl: g.dbl, ev: g.ev,
      own: g.own, offer: g.offer, auc: g.auc, debts: g.debts, card: g.card, trade: g.trade, log: g.log.slice(-12),
      houses: g.houses, hotels: g.hotels, rank: g.rank };
  }
}

if (typeof module !== 'undefined') {
  module.exports = { WHEEL, rouletteColor, PLAYERS, PCOLORS, CELLS, GROUPS, LUCK, BANK, RAILS, R, Engine, rentTable, RAIL_RENT, mortgageValue, unmortgageCost, groupCells, OWNABLE, d6, START_MONEY };
}
