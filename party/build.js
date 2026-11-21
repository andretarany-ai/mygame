// Собирает три отдельные страницы: docs/kto, docs/otvet, docs/risunok.
const fs = require('fs');
const path = require('path');
const read = (f) => fs.readFileSync(path.join(__dirname, f), 'utf8');
const shim = fs.readFileSync(path.join(__dirname, '..', 'standalone', 'mqtt-room.js'), 'utf8');
const mqttSrc = process.env.MQTT_SRC || 'https://unpkg.com/mqtt@5.10.1/dist/mqtt.min.js';
const GAMES = [
  { mode: 'who', dir: 'kto', title: 'Кто из нас?', acc: '#ffc93c' },
  { mode: 'funny', dir: 'otvet', title: 'Смешной ответ', acc: '#ff7a59' },
  { mode: 'draw', dir: 'risunok', title: 'Испорченный рисунок', acc: '#29d3c2' },
];
for (const g of GAMES) {
  const tpl = read('template.html')
    .replace('/*__ENGINE__*/', () => read('engine.js'))
    .replace(/\/\*__MODE__\*\//g, g.mode)
    .replace(/\/\*__TITLE__\*\//g, g.title)
    .replace(/\/\*__NAME__\*\//g, g.title)
    .replace(/\/\*__ACC__\*\//g, g.acc);
  const page = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0d0f1a">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}[hidden]{display:none!important}</style>
<script src="${mqttSrc}"></script>
<script>${shim}</script>
</head>
<body>
${tpl}
</body>
</html>
`;
  const out = path.join(__dirname, '..', 'docs', g.dir);
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'index.html'), page);
  console.log('docs/' + g.dir + '/index.html');
}
