import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

// Find start of cabinetMap
let lines = content.split('\n');
let cabinetMapStart = lines.findIndex(l => l.startsWith('const cabinetMap: Record<string, string> = {'));

// We will fetch the actual DEPARTMENTS from src/data/departments.ts and rebuild cabinetMap.
let depsContent = fs.readFileSync('src/data/departments.ts', 'utf8');
let cabMapRegex = /const CABINET_MAP: Record<string, string> = {([^}]+)};/m;
let match = depsContent.match(cabMapRegex);
let cabMapContent = match ? match[1] : '';

let processPostStart = lines.findIndex(l => l.startsWith('// POST /api/process') || l.startsWith('app.post("/api/process"'));

let fixedCabinetMap = `const cabinetMap: Record<string, string> = {${cabMapContent}};`;

// What about other endpoints before process?
// Let's just put GET /api/history and POST /api/sync if they are missing
let missingEndpoints = `
// GET /api/history (Fallback if no token)
app.get("/api/history", (req, res) => {
  res.json({ status: "success", records: dbRecords });
});

// POST /api/sync (Sync from Google Sheet to local server)
app.post("/api/sync", (req, res) => {
  if (req.body && req.body.records) {
    dbRecords = req.body.records;
    saveRecords(dbRecords);
  }
  res.json({ status: "success" });
});
`;

let newLines = [
  ...lines.slice(0, cabinetMapStart),
  fixedCabinetMap,
  missingEndpoints,
  ...lines.slice(processPostStart)
];

fs.writeFileSync('server.ts', newLines.join('\n'));
console.log('Fixed server.ts');
