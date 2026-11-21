// Генерация картинок к вопросам через xAI (grok-imagine-image).
// Запуск: XAI_API_KEY=... node tools/gen-images.js [id ...]
// Ключ берётся только из переменной окружения и никуда не сохраняется.
// Готовые картинки (docs/img/<id>.webp) повторно не генерируются; чтобы перегенерировать — укажите id.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const prompts = require('../img-prompts');

const KEY = process.env.XAI_API_KEY;
if (!KEY) { console.error('Нужна переменная XAI_API_KEY'); process.exit(1); }
const OUT = path.join(__dirname, '..', 'docs', 'img');
fs.mkdirSync(OUT, { recursive: true });
const only = process.argv.slice(2);
const ids = only.length ? only : Object.keys(prompts).filter((id) => !fs.existsSync(path.join(OUT, id + '.webp')));

async function gen(id) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const r = await fetch('https://api.x.ai/v1/images/generations', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'grok-imagine-image', prompt: prompts[id], n: 1, response_format: 'b64_json' }),
      });
      const j = await r.json();
      if (!r.ok || !j.data?.[0]?.b64_json) throw new Error(JSON.stringify(j).slice(0, 200));
      const tmp = path.join(OUT, id + '.tmp.jpg');
      fs.writeFileSync(tmp, Buffer.from(j.data[0].b64_json, 'base64'));
      // уменьшаем до 640 px и сохраняем в WebP (~20–40 КБ)
      execFileSync('python3', ['-c', `from PIL import Image
im = Image.open(${JSON.stringify(tmp)}).convert('RGB'); im.thumbnail((640, 640)); im.save(${JSON.stringify(path.join(OUT, id + '.webp'))}, 'WEBP', quality=78)`]);
      fs.unlinkSync(tmp);
      console.log('ok', id);
      return;
    } catch (e) {
      console.log('retry', id, attempt, String(e.message).slice(0, 160));
      await new Promise((res) => setTimeout(res, 2000 * attempt));
    }
  }
  console.log('FAILED', id);
}

(async () => {
  const queue = [...ids];
  const workers = Array.from({ length: 4 }, async () => { while (queue.length) await gen(queue.shift()); });
  await Promise.all(workers);
  console.log('готово:', ids.length);
})();
