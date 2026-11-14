// Собирает docs/ibbenburen/index.html: движок + интерфейс + связь (MQTT) + Three.js.
const fs = require('fs');
const path = require('path');
const read = (f) => fs.readFileSync(path.join(__dirname, f), 'utf8');
const tpl = read('template.html').replace('/*__ENGINE__*/', () => read('engine.js'));
const shim = fs.readFileSync(path.join(__dirname, '..', 'standalone', 'mqtt-room.js'), 'utf8');
const mqttSrc = process.env.MQTT_SRC || 'https://unpkg.com/mqtt@5.10.1/dist/mqtt.min.js';
const threeSrc = process.env.THREE_SRC || 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
const page = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0d1420">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}[hidden]{display:none!important}</style>
<script src="${threeSrc}"></script>
<script src="${mqttSrc}"></script>
<script>${shim}</script>
</head>
<body>
${tpl}
</body>
</html>
`;
const out = path.join(__dirname, '..', 'docs', 'ibbenburen');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'index.html'), page);
console.log('docs/ibbenburen/index.html собран');
