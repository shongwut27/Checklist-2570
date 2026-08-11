import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace('    }      status: "success",', '    }\n\n    res.json({\n      status: "success",');
fs.writeFileSync('server.ts', content);
