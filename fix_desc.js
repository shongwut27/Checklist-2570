import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

// Fix the duplicates first
content = content.replace(/status: "สร้างสำเร็จ", description: "",\s*description: formData.description \|\| "",/g, 'status: "สร้างสำเร็จ",');

// Wait, the one inside newRecord should not have description: "". Let's just fix it specifically.
let lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('status: "สร้างสำเร็จ", description: "",') && lines[i+1] && lines[i+1].includes('editLog: "",')) {
    lines[i] = '      status: "สร้างสำเร็จ",';
  }
}
fs.writeFileSync('server.ts', lines.join('\n'));
