// Собирает две одностраничные версии игры из template.html и ../questions.js:
//  - standalone/moya-igra.html — страница для claude.ai (онлайн через «комнаты» claude.ai);
//  - docs/index.html — сайт для GitHub Pages (онлайн по ссылке без регистрации, через MQTT).
const fs = require('fs');
const path = require('path');
const { rounds, finals } = require('../questions');

const tpl = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8')
  .replace('/*__QUESTIONS__*/null', () => JSON.stringify({ rounds, finals }))
  .replace('/*__CHECK__*/', () => fs.readFileSync(path.join(__dirname, '..', 'answer-check.js'), 'utf8'));

fs.writeFileSync(path.join(__dirname, 'moya-igra.html'), tpl);

const shim = fs.readFileSync(path.join(__dirname, 'mqtt-room.js'), 'utf8');
const mqttSrc = process.env.MQTT_SRC || 'https://unpkg.com/mqtt@5.10.1/dist/mqtt.min.js';
const page = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#08133a">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}[hidden]{display:none!important}</style>
<script src="${mqttSrc}"></script>
<script>${shim}</script>
</head>
<body>
${tpl}
</body>
</html>
`;
fs.mkdirSync(path.join(__dirname, '..', 'docs'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '..', 'docs', 'index.html'), page);
fs.writeFileSync(path.join(__dirname, '..', 'docs', '.nojekyll'), '');
console.log('standalone/moya-igra.html и docs/index.html собраны');
