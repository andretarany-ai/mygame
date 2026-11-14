// Собирает одностраничную версию игры: вставляет вопросы из ../questions.js в шаблон.
const fs = require('fs');
const path = require('path');
const { rounds, finals } = require('../questions');
const tpl = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');
const out = tpl.replace('/*__QUESTIONS__*/null', JSON.stringify({ rounds, finals }));
fs.writeFileSync(path.join(__dirname, 'moya-igra.html'), out);
console.log('standalone/moya-igra.html', out.length, 'bytes');
