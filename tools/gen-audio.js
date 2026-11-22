// Озвучка пересказов рэп-треков через xAI TTS (голос Rex).
// Запуск: XAI_API_KEY=... node tools/gen-audio.js [id ...]
// Ключ берётся только из переменной окружения. Готовые файлы docs/audio/<id>.mp3 повторно не создаются.
const fs = require('fs');
const path = require('path');
const { rounds } = require('../questions');

const KEY = process.env.XAI_API_KEY;
if (!KEY) { console.error('Нужна переменная XAI_API_KEY'); process.exit(1); }
const OUT = path.join(__dirname, '..', 'docs', 'audio');
fs.mkdirSync(OUT, { recursive: true });
const all = rounds.flatMap((r) => r.themes.flatMap((t) => t.questions)).filter((q) => q.audio && q.say);
const only = process.argv.slice(2);
const todo = all.filter((q) => (only.length ? only.includes(q.audio) : !fs.existsSync(path.join(OUT, q.audio + '.mp3'))));

(async () => {
  for (const q of todo) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const r = await fetch('https://api.x.ai/v1/tts', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: q.say, language: 'ru', voice_id: 'rex' }),
        });
        if (!r.ok) throw new Error(r.status + ' ' + (await r.text()).slice(0, 150));
        fs.writeFileSync(path.join(OUT, q.audio + '.mp3'), Buffer.from(await r.arrayBuffer()));
        console.log('ok', q.audio);
        break;
      } catch (e) {
        console.log('retry', q.audio, attempt, e.message);
        await new Promise((res) => setTimeout(res, 2000 * attempt));
      }
    }
  }
  console.log('готово:', todo.length);
})();
