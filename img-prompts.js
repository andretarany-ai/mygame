// Описания картинок для генерации (grok-imagine-image). Скрипт: tools/gen-images.js
// Картинки специально без подсказок: только предмет или деталь, без людей в лицо и без надписей.
const STYLE = ' High quality realistic photo, sharp focus. No text, no letters, no captions, no watermark, no logos.';
const P = {
  'mw2-straightener': 'Close-up product photo of a ceramic hair straightener flat iron lying open on a bathroom vanity.',
  'mw2-suspenders': 'Close-up of brown leather men’s suspenders with metal clips attached to the waistband of grey trousers.',
  'mw2-razor': 'Close-up of a classic folding straight razor with a wooden handle, half open, on a dark barbershop table.',
  'mw2-corset': 'Close-up product photo of a black satin lace-up corset with ribbon lacing on a tailor mannequin.',
  'mw2-boutonniere': 'Close-up of a small white rose boutonniere pinned to the lapel of a dark navy suit jacket.',
  'film2-homealone': 'A suburban American house front door at night in winter with Christmas lights, a paint can on a rope swinging down from the stairs toward the door, no people.',
  'film2-pulp': 'An open black briefcase glowing with mysterious golden light from inside, on a 1990s diner table, no people visible.',
  'film2-ivan': 'A homemade time machine apparatus with wires, dials and glowing lamps in a cramped Soviet 1970s apartment, a medieval Russian tsar fur crown and brocade robe lying on a chair next to it, no people.',
  'film2-brat': 'A young man seen strictly from behind in a knitted grey sweater with a portable CD player and headphones, walking along a gloomy St. Petersburg canal embankment in the 1990s.',
  'film2-fightclub': 'A single bar of pink soap lying on a dirty concrete basement floor under a harsh bare light bulb, gritty mood.',
};
for (const k of Object.keys(P)) P[k] += STYLE;
module.exports = P;
