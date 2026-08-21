import fs from 'fs';
let code = fs.readFileSync('index.html', 'utf-8');
code = code.replace('<body style="background-color: #0c0e12; color: #fff;">', '<body>');
fs.writeFileSync('index.html', code);
