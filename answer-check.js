// Мягкая проверка ответа (общая для сервера и одностраничной версии).
//  - большие и маленькие буквы не важны, «ё/е», украинские «і/ї/є/ґ» = «и/и/е/г»;
//  - прощаются мелкие опечатки (1 буква в словах от 4 букв, 2 — от 9);
//  - засчитывается часть ответа: «Кит» = «Синий кит», «Сечь» = «Запорожская Сечь»;
//  - лишние слова тоже не мешают: «озеро Байкал» = «Байкал»;
//  - числа должны совпадать точно.
function normalizeAnswer(s) {
  return String(s)
    .toLowerCase()
    .replace(/ё/g, 'е').replace(/[ії]/g, 'и').replace(/є/g, 'е').replace(/ґ/g, 'г')
    .replace(/[«»"'`’ʼ.,!?;:()_]/g, ' ')
    .replace(/[-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function lev(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m || !n) return m || n;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}

const tol = (w) => (w.length >= 9 ? 2 : w.length >= 4 ? 1 : 0);
const isNum = (w) => /^\d+$/.test(w);
const close = (a, b) => (isNum(a) || isNum(b) ? a === b : lev(a, b) <= tol(b));
// Слова короче 3 букв («да», «по», «с») сами по себе ответом не считаются
const words = (s) => s.split(' ').filter((w) => w.length >= 3 || isNum(w) || /^[ivx]+$/.test(w));

function matchOne(input, variant) {
  const a = normalizeAnswer(input), v = normalizeAnswer(variant);
  if (!a || !v) return false;
  if (a === v) return true;
  if (isNum(v.replace(/ /g, ''))) return a.replace(/\D/g, '') === v.replace(/ /g, '');
  if (lev(a.replace(/ /g, ''), v.replace(/ /g, '')) <= tol(v.replace(/ /g, ''))) return true;
  const aw = words(a), vw = words(v);
  if (!aw.length || !vw.length) return false;
  // часть ответа: все слова игрока есть в правильном ответе
  if (aw.every((w) => vw.some((x) => close(w, x)))) return true;
  // правильный ответ целиком есть в ответе игрока
  if (vw.every((x) => aw.some((w) => close(w, x)))) return true;
  return false;
}

function checkAnswer(raw, q) {
  const text = String(raw || '').trim();
  if (!text) return { ok: false, reason: 'Нет ответа' };
  const ok = [q.a, ...(q.alt || [])].some((v) => matchOne(text, v));
  return ok ? { ok: true } : { ok: false, reason: 'Неверно' };
}

if (typeof module !== 'undefined') module.exports = { checkAnswer, normalizeAnswer, matchOne };
