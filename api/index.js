// server.ts
import express from "express";
import path from "path";
import fs from "fs";
var app = express();
var PORT = 3e3;
app.use(express.json());
var isVercel = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
var DATA_FILE = isVercel ? path.join("/tmp", "checklist_records.json") : path.join(process.cwd(), "checklist_records.json");
var CONFIG_FILE = isVercel ? path.join("/tmp", "webhook_config.json") : path.join(process.cwd(), "webhook_config.json");
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error loading webhook config:", err);
  }
  return {
    spreadsheetId: "1Uxci-m9YhP7SFYF098f-kVdYgyXyRQ0gTuIUYghX3Fc",
    sheetName: "(2570)CHECKLIST",
    gasWebhookUrl: process.env.GAS_WEBHOOK_URL || ""
  };
}
function saveConfig(cfg) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving webhook config:", err);
  }
}
var currentConfig = loadConfig();
function loadRecords() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error loading records:", err);
  }
  return [];
}
function saveRecords(records) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving records:", err);
  }
}
var dbRecords = loadRecords();
if (dbRecords.length === 0) {
  dbRecords = [
    {
      id: "69070001",
      timestamp: (/* @__PURE__ */ new Date("2026-07-01T07:51:00")).toISOString(),
      formattedTime: "01/07/26 07:51",
      clientEmail: "shongwut.tab@mfu.ac.th",
      name: "\u0E17\u0E23\u0E07\u0E27\u0E38\u0E12\u0E34",
      phone: "053-916000",
      dept: "\u0E1C\u0E25\u0E34\u0E15\u0E20\u0E31\u0E13\u0E11\u0E4C\u0E08\u0E32\u0E01\u0E1C\u0E25\u0E07\u0E32\u0E19\u0E01\u0E32\u0E23\u0E27\u0E34\u0E08\u0E31\u0E22\u0E21\u0E2B\u0E32\u0E27\u0E34\u0E17\u0E22\u0E32\u0E25\u0E31\u0E22\u0E41\u0E21\u0E48\u0E1F\u0E49\u0E32\u0E2B\u0E25\u0E27\u0E07",
      avNumber: "7700/0000",
      type: "\u0E04\u0E37\u0E19\u0E40\u0E07\u0E34\u0E19\u0E22\u0E37\u0E21\u0E17\u0E14\u0E23\u0E2D\u0E07",
      docNumbers: "11111 11111",
      attachments: ["1.\u0E2A\u0E33\u0E40\u0E19\u0E32\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E17\u0E35\u0E48\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34\u0E41\u0E25\u0E49\u0E27", "2.\u0E2A\u0E33\u0E40\u0E19\u0E32\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13\u0E01\u0E32\u0E23\u0E23\u0E32\u0E22\u0E08\u0E48\u0E32\u0E22"],
      other: "",
      cabinetId: "N/A",
      keypass: "3",
      status: "\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08",
      description: ""
    },
    {
      id: "69060965",
      timestamp: (/* @__PURE__ */ new Date("2026-06-13T14:25:00")).toISOString(),
      formattedTime: "13/06/26 14:25",
      clientEmail: "info.finance@mfu.ac.th",
      name: "\u0E17\u0E14\u0E2A\u0E2D\u0E1A 11",
      phone: "053-916001",
      dept: "\u0E2A\u0E16\u0E32\u0E1A\u0E31\u0E19\u0E28\u0E34\u0E25\u0E1B\u0E27\u0E31\u0E12\u0E19\u0E18\u0E23\u0E23\u0E21\u0E41\u0E25\u0E30\u0E2D\u0E32\u0E23\u0E22\u0E18\u0E23\u0E23\u0E21\u0E25\u0E38\u0E48\u0E21\u0E19\u0E49\u0E33\u0E42\u0E02\u0E07",
      avNumber: "1111/1111",
      type: "\u0E04\u0E37\u0E19\u0E40\u0E07\u0E34\u0E19\u0E22\u0E37\u0E21\u0E17\u0E14\u0E23\u0E2D\u0E07",
      docNumbers: "12313456465",
      attachments: ["1.\u0E2A\u0E33\u0E40\u0E19\u0E32\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E17\u0E35\u0E48\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34\u0E41\u0E25\u0E49\u0E27"],
      other: "",
      cabinetId: "A12",
      keypass: "3",
      status: "\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08",
      description: ""
    },
    {
      id: "69050453",
      timestamp: (/* @__PURE__ */ new Date("2026-05-07T09:47:00")).toISOString(),
      formattedTime: "07/05/26 09:47",
      clientEmail: "shongwut.tab@mfu.ac.th",
      name: "\u0E17\u0E23\u0E07\u0E27\u0E38\u0E12\u0E34",
      phone: "053-916002",
      dept: "\u0E28\u0E39\u0E19\u0E22\u0E4C\u0E04\u0E27\u0E32\u0E21\u0E40\u0E1B\u0E47\u0E19\u0E40\u0E25\u0E34\u0E28\u0E14\u0E49\u0E32\u0E19\u0E19\u0E27\u0E31\u0E15\u0E01\u0E23\u0E23\u0E21\u0E1C\u0E25\u0E34\u0E15\u0E20\u0E31\u0E13\u0E11\u0E4C\u0E18\u0E23\u0E23\u0E21\u0E0A\u0E32\u0E15\u0E34",
      avNumber: "7700/0000",
      type: "\u0E07\u0E32\u0E19\u0E40\u0E07\u0E34\u0E19\u0E40\u0E14\u0E37\u0E2D\u0E19",
      docNumbers: "21221232",
      attachments: [],
      other: "",
      cabinetId: "A7",
      keypass: "2",
      status: "\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08",
      description: ""
    }
  ];
  saveRecords(dbRecords);
}
var keyPassMap = {
  "\u0E22\u0E37\u0E21\u0E40\u0E07\u0E34\u0E19\u0E17\u0E14\u0E23\u0E2D\u0E07\u0E08\u0E48\u0E32\u0E22": "1",
  "\u0E40\u0E1A\u0E34\u0E01\u0E2A\u0E33\u0E23\u0E2D\u0E07\u0E08\u0E48\u0E32\u0E22": "1",
  "\u0E40\u0E1A\u0E34\u0E01\u0E08\u0E48\u0E32\u0E22\u0E17\u0E31\u0E48\u0E27\u0E44\u0E1B": "1",
  "\u0E40\u0E1A\u0E34\u0E01\u0E08\u0E48\u0E32\u0E22\u0E15\u0E23\u0E27\u0E08\u0E23\u0E31\u0E1A\u0E1E\u0E31\u0E2A\u0E14\u0E38": "1",
  "\u0E04\u0E37\u0E19\u0E40\u0E07\u0E34\u0E19\u0E22\u0E37\u0E21\u0E17\u0E14\u0E23\u0E2D\u0E07": "3",
  "\u0E2A\u0E27\u0E31\u0E2A\u0E14\u0E34\u0E01\u0E32\u0E23": "2",
  "\u0E04\u0E48\u0E32\u0E2D\u0E32\u0E2B\u0E32\u0E23\u0E17\u0E33\u0E01\u0E32\u0E23\u0E19\u0E2D\u0E01\u0E40\u0E27\u0E25\u0E32": "2",
  "\u0E40\u0E1A\u0E34\u0E01\u0E08\u0E48\u0E32\u0E22\u0E04\u0E48\u0E32\u0E41\u0E23\u0E07": "2",
  "\u0E17\u0E38\u0E19\u0E01\u0E32\u0E23\u0E28\u0E36\u0E01\u0E29\u0E32": "2",
  "\u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23\u0E1B\u0E34\u0E14\u0E42\u0E04\u0E23\u0E07\u0E01\u0E32\u0E23": "4",
  "\u0E07\u0E32\u0E19\u0E40\u0E07\u0E34\u0E19\u0E40\u0E14\u0E37\u0E2D\u0E19": "2",
  "\u0E40\u0E07\u0E34\u0E19\u0E25\u0E07\u0E17\u0E38\u0E19": "1"
};
var cabinetMap = {
  "\u0E2A\u0E48\u0E27\u0E19\u0E17\u0E23\u0E31\u0E1E\u0E22\u0E32\u0E01\u0E23\u0E1A\u0E38\u0E04\u0E04\u0E25": "A1",
  "\u0E2A\u0E48\u0E27\u0E19\u0E19\u0E34\u0E15\u0E34\u0E01\u0E32\u0E23": "A1",
  "\u0E28\u0E39\u0E19\u0E22\u0E4C\u0E01\u0E35\u0E2C\u0E32\u0E21\u0E2B\u0E32\u0E27\u0E34\u0E17\u0E22\u0E32\u0E25\u0E31\u0E22\u0E41\u0E21\u0E48\u0E1F\u0E49\u0E32\u0E2B\u0E25\u0E27\u0E07": "A2",
  "\u0E2A\u0E16\u0E32\u0E1A\u0E31\u0E19\u0E0A\u0E32\u0E41\u0E25\u0E30\u0E01\u0E32\u0E41\u0E1F \u0E41\u0E2B\u0E48\u0E07\u0E21\u0E2B\u0E32\u0E27\u0E34\u0E17\u0E22\u0E32\u0E25\u0E31\u0E22\u0E41\u0E21\u0E48\u0E1F\u0E49\u0E32\u0E2B\u0E25\u0E27\u0E07": "A2",
  "\u0E2B\u0E19\u0E48\u0E27\u0E22\u0E04\u0E27\u0E32\u0E21\u0E23\u0E48\u0E27\u0E21\u0E21\u0E37\u0E2D\u0E17\u0E32\u0E07\u0E27\u0E34\u0E0A\u0E32\u0E01\u0E32\u0E23\u0E1D\u0E23\u0E31\u0E48\u0E07\u0E40\u0E28\u0E2A-\u0E2D\u0E19\u0E38\u0E20\u0E39\u0E21\u0E34\u0E20\u0E32\u0E04\u0E25\u0E38\u0E48\u0E21\u0E41\u0E21\u0E48\u0E19\u0E49\u0E33\u0E42\u0E02\u0E07": "A3",
  "\u0E42\u0E04\u0E23\u0E07\u0E01\u0E32\u0E23\u0E08\u0E31\u0E14\u0E15\u0E31\u0E49\u0E07\u0E2B\u0E19\u0E48\u0E27\u0E22\u0E04\u0E27\u0E32\u0E21\u0E23\u0E48\u0E27\u0E21\u0E21\u0E37\u0E2D\u0E17\u0E32\u0E07\u0E27\u0E34\u0E0A\u0E32\u0E01\u0E32\u0E23\u0E1D\u0E23\u0E31\u0E48\u0E07\u0E40\u0E28\u0E2A-\u0E2D\u0E19\u0E38\u0E20\u0E39\u0E21\u0E34\u0E20\u0E32\u0E04\u0E25\u0E38\u0E48\u0E21\u0E41\u0E21\u0E48\u0E19\u0E49\u0E33\u0E42\u0E02\u0E07": "A3",
  "\u0E28\u0E39\u0E19\u0E22\u0E4C\u0E04\u0E27\u0E32\u0E21\u0E40\u0E1B\u0E47\u0E19\u0E40\u0E25\u0E34\u0E28\u0E17\u0E32\u0E07\u0E14\u0E49\u0E32\u0E19\u0E01\u0E32\u0E23\u0E27\u0E34\u0E08\u0E31\u0E22\u0E40\u0E0A\u0E37\u0E49\u0E2D\u0E23\u0E32": "A4",
  "\u0E2B\u0E19\u0E48\u0E27\u0E22\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E20\u0E32\u0E22\u0E43\u0E19": "A4",
  "\u0E28\u0E39\u0E19\u0E22\u0E4C\u0E40\u0E17\u0E04\u0E42\u0E19\u0E42\u0E25\u0E22\u0E35\u0E14\u0E34\u0E08\u0E34\u0E17\u0E31\u0E25\u0E41\u0E25\u0E30\u0E2A\u0E32\u0E23\u0E2A\u0E19\u0E40\u0E17\u0E28": "A5",
  "\u0E28\u0E39\u0E19\u0E22\u0E4C\u0E1A\u0E23\u0E34\u0E01\u0E32\u0E23\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E\u0E41\u0E1A\u0E1A\u0E04\u0E23\u0E1A\u0E27\u0E07\u0E08\u0E23\u0E41\u0E2B\u0E48\u0E07\u0E20\u0E32\u0E04\u0E40\u0E2B\u0E19\u0E37\u0E2D \u0E41\u0E25\u0E30\u0E2D\u0E19\u0E38\u0E20\u0E39\u0E21\u0E34\u0E20\u0E32\u0E04\u0E25\u0E38\u0E48\u0E21\u0E41\u0E21\u0E48\u0E19\u0E49\u0E33\u0E42\u0E02\u0E07": "A6",
  "\u0E28\u0E39\u0E19\u0E22\u0E4C\u0E19\u0E27\u0E31\u0E15\u0E01\u0E23\u0E23\u0E21\u0E2A\u0E21\u0E38\u0E19\u0E44\u0E1E\u0E23\u0E04\u0E23\u0E1A\u0E27\u0E07\u0E08\u0E23 \u0E21\u0E2B\u0E32\u0E27\u0E34\u0E17\u0E22\u0E32\u0E25\u0E31\u0E22\u0E41\u0E21\u0E48\u0E1F\u0E49\u0E32\u0E2B\u0E25\u0E27\u0E07": "A7",
  "\u0E28\u0E39\u0E19\u0E22\u0E4C\u0E04\u0E27\u0E32\u0E21\u0E40\u0E1B\u0E47\u0E19\u0E40\u0E25\u0E34\u0E28\u0E14\u0E49\u0E32\u0E19\u0E19\u0E27\u0E31\u0E15\u0E01\u0E23\u0E23\u0E21\u0E1C\u0E25\u0E34\u0E15\u0E20\u0E31\u0E13\u0E11\u0E4C\u0E18\u0E23\u0E23\u0E21\u0E0A\u0E32\u0E15\u0E34": "A7",
  "\u0E2A\u0E16\u0E32\u0E1A\u0E31\u0E19\u0E19\u0E27\u0E31\u0E15\u0E01\u0E23\u0E23\u0E21\u0E01\u0E32\u0E23\u0E40\u0E23\u0E35\u0E22\u0E19\u0E23\u0E39\u0E49\u0E21\u0E2B\u0E32\u0E27\u0E34\u0E17\u0E22\u0E32\u0E25\u0E31\u0E22\u0E41\u0E21\u0E48\u0E1F\u0E49\u0E32\u0E2B\u0E25\u0E27\u0E07": "A8",
  "\u0E2A\u0E16\u0E32\u0E1A\u0E31\u0E19\u0E2D\u0E19\u0E38\u0E23\u0E31\u0E01\u0E29\u0E4C \u0E1E\u0E31\u0E12\u0E19\u0E32\u0E17\u0E23\u0E31\u0E1E\u0E22\u0E32\u0E01\u0E23\u0E18\u0E23\u0E23\u0E21\u0E0A\u0E32\u0E15\u0E34\u0E41\u0E25\u0E30\u0E2A\u0E34\u0E48\u0E07\u0E41\u0E27\u0E14\u0E25\u0E49\u0E2D\u0E21 \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E22\u0E31\u0E48\u0E07\u0E22\u0E37\u0E19": "A9",
  "\u0E28\u0E39\u0E19\u0E22\u0E4C\u0E08\u0E31\u0E14\u0E01\u0E32\u0E23\u0E17\u0E23\u0E31\u0E1E\u0E22\u0E32\u0E01\u0E23\u0E18\u0E23\u0E23\u0E21\u0E0A\u0E32\u0E15\u0E34\u0E41\u0E25\u0E30\u0E2A\u0E34\u0E48\u0E07\u0E41\u0E27\u0E14\u0E25\u0E49\u0E2D\u0E21": "A9",
  "\u0E2A\u0E33\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E1A\u0E31\u0E13\u0E11\u0E34\u0E15\u0E28\u0E36\u0E01\u0E29\u0E32": "A10",
  "\u0E2A\u0E48\u0E27\u0E19\u0E08\u0E31\u0E14\u0E01\u0E32\u0E23\u0E17\u0E23\u0E31\u0E1E\u0E22\u0E4C\u0E2A\u0E34\u0E19\u0E17\u0E32\u0E07\u0E1B\u0E31\u0E0D\u0E0D\u0E32\u0E41\u0E25\u0E30\u0E19\u0E27\u0E31\u0E15\u0E01\u0E23\u0E23\u0E21": "A11",
  "\u0E1C\u0E25\u0E34\u0E15\u0E20\u0E31\u0E13\u0E11\u0E4C\u0E08\u0E32\u0E01\u0E1C\u0E25\u0E07\u0E32\u0E19\u0E01\u0E32\u0E23\u0E27\u0E34\u0E08\u0E31\u0E22\u0E21\u0E2B\u0E32\u0E27\u0E34\u0E17\u0E22\u0E32\u0E25\u0E31\u0E22\u0E41\u0E21\u0E48\u0E1F\u0E49\u0E32\u0E2B\u0E25\u0E27\u0E07": "A11",
  "\u0E2A\u0E33\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E08\u0E31\u0E14\u0E01\u0E32\u0E23\u0E17\u0E23\u0E31\u0E1E\u0E22\u0E4C\u0E2A\u0E34\u0E19\u0E41\u0E25\u0E30\u0E23\u0E32\u0E22\u0E44\u0E14\u0E49": "A12",
  "\u0E2A\u0E16\u0E32\u0E1A\u0E31\u0E19\u0E28\u0E34\u0E25\u0E1B\u0E27\u0E31\u0E12\u0E19\u0E18\u0E23\u0E23\u0E21\u0E41\u0E25\u0E30\u0E2D\u0E32\u0E23\u0E22\u0E18\u0E23\u0E23\u0E21\u0E25\u0E38\u0E48\u0E21\u0E19\u0E49\u0E33\u0E42\u0E02\u0E07": "A12",
  "\u0E28\u0E39\u0E19\u0E22\u0E4C\u0E2B\u0E19\u0E31\u0E07\u0E2A\u0E37\u0E2D": "A12",
  "\u0E28\u0E39\u0E19\u0E22\u0E4C\u0E1A\u0E23\u0E34\u0E01\u0E32\u0E23\u0E17\u0E35\u0E48\u0E1E\u0E31\u0E01": "A12",
  "\u0E28\u0E39\u0E19\u0E22\u0E4C\u0E1A\u0E23\u0E34\u0E01\u0E32\u0E23\u0E2D\u0E32\u0E2B\u0E32\u0E23": "A12",
  "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E28\u0E39\u0E19\u0E22\u0E4C\u0E01\u0E32\u0E23\u0E41\u0E1E\u0E17\u0E22\u0E4C\u0E21\u0E2B\u0E32\u0E27\u0E34\u0E17\u0E22\u0E32\u0E25\u0E31\u0E22\u0E41\u0E21\u0E48\u0E1F\u0E49\u0E32\u0E2B\u0E25\u0E27\u0E07": "A13",
  "\u0E2A\u0E33\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E43\u0E2B\u0E49\u0E04\u0E33\u0E1B\u0E23\u0E36\u0E01\u0E29\u0E32\u0E41\u0E25\u0E30\u0E0A\u0E48\u0E27\u0E22\u0E40\u0E2B\u0E25\u0E37\u0E2D\u0E19\u0E31\u0E01\u0E28\u0E36\u0E01\u0E29\u0E32": "A14",
  "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E21\u0E2B\u0E32\u0E27\u0E34\u0E17\u0E22\u0E32\u0E25\u0E31\u0E22\u0E41\u0E21\u0E48\u0E1F\u0E49\u0E32\u0E2B\u0E25\u0E27\u0E07 \u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E21\u0E2B\u0E32\u0E19\u0E04\u0E23": "A14",
  "\u0E2B\u0E19\u0E48\u0E27\u0E22\u0E1B\u0E23\u0E30\u0E2A\u0E32\u0E19\u0E07\u0E32\u0E19\u0E21\u0E2B\u0E32\u0E27\u0E34\u0E17\u0E22\u0E32\u0E25\u0E31\u0E22\u0E41\u0E21\u0E48\u0E1F\u0E49\u0E32\u0E2B\u0E25\u0E27\u0E07 \u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E2F": "A15",
  "\u0E28\u0E39\u0E19\u0E22\u0E4C\u0E1A\u0E23\u0E23\u0E13\u0E2A\u0E32\u0E23\u0E41\u0E25\u0E30\u0E2A\u0E37\u0E48\u0E2D\u0E01\u0E32\u0E23\u0E28\u0E36\u0E01\u0E29\u0E32 (\u0E2B\u0E49\u0E2D\u0E07\u0E2A\u0E21\u0E38\u0E14)": "B1",
  "\u0E28\u0E39\u0E19\u0E22\u0E4C\u0E1A\u0E23\u0E34\u0E01\u0E32\u0E23\u0E27\u0E34\u0E0A\u0E32\u0E01\u0E32\u0E23": "B2",
  "\u0E28\u0E39\u0E19\u0E22\u0E4C\u0E40\u0E04\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E21\u0E37\u0E2D\u0E27\u0E34\u0E17\u0E22\u0E32\u0E28\u0E32\u0E2A\u0E15\u0E23\u0E4C\u0E41\u0E25\u0E30\u0E40\u0E17\u0E04\u0E42\u0E19\u0E42\u0E25\u0E22\u0E35": "B3",
  "\u0E28\u0E39\u0E19\u0E22\u0E4C\u0E20\u0E32\u0E29\u0E32\u0E41\u0E25\u0E30\u0E27\u0E31\u0E12\u0E19\u0E18\u0E23\u0E23\u0E21\u0E08\u0E35\u0E19\u0E2A\u0E34\u0E23\u0E34\u0E19\u0E18\u0E23": "B4",
  "\u0E2A\u0E48\u0E27\u0E19\u0E2A\u0E32\u0E23\u0E1A\u0E23\u0E23\u0E13\u0E41\u0E25\u0E30\u0E2D\u0E33\u0E19\u0E27\u0E22\u0E01\u0E32\u0E23": "B5",
  "\u0E2A\u0E33\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E2A\u0E20\u0E32\u0E21\u0E2B\u0E32\u0E27\u0E34\u0E17\u0E22\u0E32\u0E25\u0E31\u0E22": "B5",
  "\u0E2A\u0E48\u0E27\u0E19\u0E19\u0E42\u0E22\u0E1A\u0E32\u0E22\u0E41\u0E25\u0E30\u0E41\u0E1C\u0E19": "B6",
  "\u0E2A\u0E48\u0E27\u0E19\u0E2D\u0E32\u0E04\u0E32\u0E23\u0E2A\u0E16\u0E32\u0E19\u0E17\u0E35\u0E48": "B7",
  "\u0E2A\u0E48\u0E27\u0E19\u0E1B\u0E23\u0E30\u0E0A\u0E32\u0E2A\u0E31\u0E21\u0E1E\u0E31\u0E19\u0E18\u0E4C": "B8",
  "\u0E2A\u0E48\u0E27\u0E19\u0E1E\u0E31\u0E2A\u0E14\u0E38": "B9",
  "\u0E2A\u0E48\u0E27\u0E19\u0E17\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19\u0E41\u0E25\u0E30\u0E1B\u0E23\u0E30\u0E21\u0E27\u0E25\u0E1C\u0E25": "B10",
  "\u0E1D\u0E48\u0E32\u0E22\u0E23\u0E31\u0E1A\u0E19\u0E31\u0E01\u0E28\u0E36\u0E01\u0E29\u0E32": "B10",
  "\u0E2A\u0E48\u0E27\u0E19\u0E1A\u0E23\u0E34\u0E2B\u0E32\u0E23\u0E07\u0E32\u0E19\u0E27\u0E34\u0E08\u0E31\u0E22": "B11",
  "\u0E28\u0E39\u0E19\u0E22\u0E4C\u0E27\u0E34\u0E08\u0E31\u0E22\u0E41\u0E25\u0E30\u0E19\u0E27\u0E31\u0E15\u0E01\u0E23\u0E23\u0E21\u0E2A\u0E31\u0E07\u0E04\u0E21\u0E40\u0E0A\u0E34\u0E07\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48 \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E01\u0E32\u0E23\u0E1E\u0E31\u0E12\u0E19\u0E32\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E22\u0E31\u0E48\u0E07\u0E22\u0E37\u0E19": "B11",
  "\u0E2A\u0E48\u0E27\u0E19\u0E1E\u0E31\u0E12\u0E19\u0E32\u0E19\u0E31\u0E01\u0E28\u0E36\u0E01\u0E29\u0E32": "B12",
  "\u0E2B\u0E19\u0E48\u0E27\u0E22\u0E07\u0E32\u0E19\u0E2A\u0E48\u0E07\u0E40\u0E2A\u0E23\u0E34\u0E21\u0E01\u0E32\u0E23\u0E1A\u0E23\u0E34\u0E01\u0E32\u0E23\u0E19\u0E31\u0E01\u0E28\u0E36\u0E01\u0E29\u0E32\u0E40\u0E1A\u0E47\u0E14\u0E40\u0E2A\u0E23\u0E47\u0E08 (M for U Centre)": "B12",
  "\u0E2A\u0E48\u0E27\u0E19\u0E1E\u0E31\u0E12\u0E19\u0E32\u0E04\u0E27\u0E32\u0E21\u0E2A\u0E31\u0E21\u0E1E\u0E31\u0E19\u0E18\u0E4C\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E1B\u0E23\u0E30\u0E40\u0E17\u0E28": "B13",
  "\u0E2A\u0E48\u0E27\u0E19\u0E1B\u0E23\u0E30\u0E01\u0E31\u0E19\u0E04\u0E38\u0E13\u0E20\u0E32\u0E1E\u0E01\u0E32\u0E23\u0E28\u0E36\u0E01\u0E29\u0E32\u0E41\u0E25\u0E30\u0E1E\u0E31\u0E12\u0E19\u0E32\u0E2B\u0E25\u0E31\u0E01\u0E2A\u0E39\u0E15\u0E23": "B14",
  "\u0E2A\u0E48\u0E27\u0E19\u0E08\u0E31\u0E14\u0E2B\u0E32\u0E07\u0E32\u0E19\u0E41\u0E25\u0E30\u0E1D\u0E36\u0E01\u0E07\u0E32\u0E19\u0E02\u0E2D\u0E07\u0E19\u0E31\u0E01\u0E28\u0E36\u0E01\u0E29\u0E32": "B15",
  "\u0E2A\u0E48\u0E27\u0E19\u0E01\u0E32\u0E23\u0E40\u0E07\u0E34\u0E19\u0E41\u0E25\u0E30\u0E1A\u0E31\u0E0D\u0E0A\u0E35": "B16",
  "\u0E2A\u0E33\u0E19\u0E31\u0E01\u0E27\u0E34\u0E0A\u0E32\u0E28\u0E34\u0E25\u0E1B\u0E28\u0E32\u0E2A\u0E15\u0E23\u0E4C": "C1",
  "\u0E2A\u0E33\u0E19\u0E31\u0E01\u0E27\u0E34\u0E0A\u0E32\u0E40\u0E17\u0E04\u0E42\u0E19\u0E42\u0E25\u0E22\u0E35\u0E14\u0E34\u0E08\u0E34\u0E17\u0E31\u0E25\u0E1B\u0E23\u0E30\u0E22\u0E38\u0E01\u0E15\u0E4C": "C2",
  "\u0E2A\u0E33\u0E19\u0E31\u0E01\u0E27\u0E34\u0E0A\u0E32\u0E40\u0E17\u0E04\u0E42\u0E19\u0E42\u0E25\u0E22\u0E35\u0E2A\u0E32\u0E23\u0E2A\u0E19\u0E40\u0E17\u0E28": "C2",
  "\u0E2A\u0E33\u0E19\u0E31\u0E01\u0E27\u0E34\u0E0A\u0E32\u0E19\u0E34\u0E15\u0E34\u0E28\u0E32\u0E2A\u0E15\u0E23\u0E4C": "C3",
  "\u0E2A\u0E33\u0E19\u0E31\u0E01\u0E27\u0E34\u0E0A\u0E32\u0E27\u0E34\u0E17\u0E22\u0E32\u0E28\u0E32\u0E2A\u0E15\u0E23\u0E4C": "C4",
  "\u0E2A\u0E33\u0E19\u0E31\u0E01\u0E27\u0E34\u0E0A\u0E32\u0E2D\u0E38\u0E15\u0E2A\u0E32\u0E2B\u0E01\u0E23\u0E23\u0E21\u0E40\u0E01\u0E29\u0E15\u0E23": "C5",
  "\u0E2A\u0E33\u0E19\u0E31\u0E01\u0E27\u0E34\u0E0A\u0E32\u0E27\u0E34\u0E17\u0E22\u0E32\u0E28\u0E32\u0E2A\u0E15\u0E23\u0E4C\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E": "C6",
  "\u0E2A\u0E33\u0E19\u0E31\u0E01\u0E27\u0E34\u0E0A\u0E32\u0E27\u0E34\u0E17\u0E22\u0E32\u0E28\u0E32\u0E2A\u0E15\u0E23\u0E4C\u0E40\u0E04\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E2A\u0E33\u0E2D\u0E32\u0E07": "C7",
  "\u0E2A\u0E33\u0E19\u0E31\u0E01\u0E27\u0E34\u0E0A\u0E32\u0E01\u0E32\u0E23\u0E08\u0E31\u0E14\u0E01\u0E32\u0E23": "C8",
  "\u0E2A\u0E33\u0E19\u0E31\u0E01\u0E27\u0E34\u0E0A\u0E32\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E28\u0E32\u0E2A\u0E15\u0E23\u0E4C": "C9",
  "\u0E2A\u0E33\u0E19\u0E31\u0E01\u0E27\u0E34\u0E0A\u0E32\u0E40\u0E27\u0E0A\u0E28\u0E32\u0E2A\u0E15\u0E23\u0E4C\u0E0A\u0E30\u0E25\u0E2D\u0E27\u0E31\u0E22\u0E41\u0E25\u0E30\u0E1F\u0E37\u0E49\u0E19\u0E1F\u0E39\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E": "C10",
  "\u0E2A\u0E33\u0E19\u0E31\u0E01\u0E27\u0E34\u0E0A\u0E32\u0E41\u0E1E\u0E17\u0E22\u0E28\u0E32\u0E2A\u0E15\u0E23\u0E4C": "C11",
  "\u0E2A\u0E33\u0E19\u0E31\u0E01\u0E27\u0E34\u0E0A\u0E32\u0E17\u0E31\u0E19\u0E15\u0E41\u0E1E\u0E17\u0E22\u0E28\u0E32\u0E2A\u0E15\u0E23\u0E4C": "C12",
  "\u0E2A\u0E33\u0E19\u0E31\u0E01\u0E27\u0E34\u0E0A\u0E32\u0E19\u0E27\u0E31\u0E15\u0E01\u0E23\u0E23\u0E21\u0E2A\u0E31\u0E07\u0E04\u0E21": "C13",
  "\u0E2A\u0E33\u0E19\u0E31\u0E01\u0E27\u0E34\u0E0A\u0E32\u0E08\u0E35\u0E19\u0E27\u0E34\u0E17\u0E22\u0E32": "C14",
  "\u0E2A\u0E33\u0E19\u0E31\u0E01\u0E27\u0E34\u0E0A\u0E32\u0E01\u0E32\u0E23\u0E41\u0E1E\u0E17\u0E22\u0E4C\u0E1A\u0E39\u0E23\u0E13\u0E32\u0E01\u0E32\u0E23": "C15"
};
function getCabinetIdServer(deptName) {
  if (!deptName) return "N/A";
  const trimmed = deptName.trim();
  if (cabinetMap[trimmed]) return cabinetMap[trimmed];
  const lines = trimmed.split("\n").map((s) => s.trim());
  if (lines[0] && cabinetMap[lines[0]]) return cabinetMap[lines[0]];
  const match = trimmed.match(/^([\u0E00-\u0E7F0-9\s()/\-.,]+?)([A-Za-z].*)?$/);
  if (match && match[1]) {
    const thaiPart = match[1].trim();
    if (cabinetMap[thaiPart]) return cabinetMap[thaiPart];
  }
  for (const key in cabinetMap) {
    if (trimmed.includes(key) || key.includes(trimmed)) {
      return cabinetMap[key];
    }
  }
  return "N/A";
}
async function fetchSheetRecordsServer() {
  try {
    const spreadsheetId = currentConfig.spreadsheetId || "1Uxci-m9YhP7SFYF098f-kVdYgyXyRQ0gTuIUYghX3Fc";
    const sheetName = currentConfig.sheetName || "(2570)CHECKLIST";
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}&t=${Date.now()}`;
    const res = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
    if (!res.ok) return null;
    const t = await res.text();
    const jsonStr = t.substring(t.indexOf("{"), t.lastIndexOf("}") + 1);
    const data = JSON.parse(jsonStr);
    const rows = data.table.rows || [];
    const parsed = [];
    for (const row of rows) {
      const c = row.c || [];
      const getVal = (idx) => {
        if (!c[idx]) return "";
        if (c[idx].f !== void 0 && c[idx].f !== null) return String(c[idx].f);
        if (c[idx].v !== void 0 && c[idx].v !== null) return String(c[idx].v);
        return "";
      };
      const id = getVal(0);
      if (!id || id.toLowerCase() === "id" || id.includes("\u0E17\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19")) continue;
      const rawAtt = getVal(9);
      const attachments = rawAtt ? rawAtt.split(",").map((s) => s.trim()).filter(Boolean) : [];
      parsed.push({
        id,
        formattedTime: getVal(1) || (/* @__PURE__ */ new Date()).toLocaleString("th-TH"),
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        clientEmail: getVal(2),
        name: getVal(3),
        phone: getVal(4),
        dept: getVal(5),
        avNumber: getVal(6),
        type: getVal(7),
        docNumbers: getVal(8),
        attachments,
        cabinetId: getVal(10) || getCabinetIdServer(getVal(5)) || "N/A",
        keypass: getVal(11) || keyPassMap[getVal(7)] || "1",
        pdfUrl: getVal(12) || "",
        description: getVal(13),
        editLog: getVal(14),
        status: "\u0E14\u0E36\u0E07\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E08\u0E32\u0E01 Google Sheet",
        other: ""
      });
    }
    return parsed;
  } catch (err) {
    console.warn("Failed to fetch Google Sheet via gviz:", err);
    return null;
  }
}
app.get(["/api/history", "/history"], async (req, res) => {
  const sheetRecords = await fetchSheetRecordsServer();
  if (sheetRecords && sheetRecords.length > 0) {
    if (dbRecords && dbRecords.length > 0) {
      const merged = sheetRecords.map((sRec) => {
        const localRec = dbRecords.find((l) => String(l.id).trim() === String(sRec.id).trim());
        if (localRec && localRec.status === "\u0E41\u0E01\u0E49\u0E44\u0E02\u0E41\u0E25\u0E49\u0E27") {
          return {
            ...sRec,
            name: localRec.name || sRec.name,
            phone: localRec.phone || sRec.phone,
            clientEmail: localRec.clientEmail || sRec.clientEmail,
            dept: localRec.dept || sRec.dept,
            avNumber: localRec.avNumber || sRec.avNumber,
            type: localRec.type || sRec.type,
            docNumbers: localRec.docNumbers || sRec.docNumbers,
            attachments: localRec.attachments && localRec.attachments.length > 0 ? localRec.attachments : sRec.attachments,
            description: localRec.description || sRec.description,
            cabinetId: localRec.cabinetId || sRec.cabinetId,
            keypass: localRec.keypass || sRec.keypass,
            editLog: localRec.editLog || sRec.editLog,
            status: localRec.status
          };
        }
        return sRec;
      });
      dbRecords = merged;
    } else {
      dbRecords = sheetRecords;
    }
    saveRecords(dbRecords);
  }
  let list = dbRecords.slice().reverse();
  const email = req.query.email ? String(req.query.email).trim().toLowerCase() : "";
  if (email) {
    list = list.filter((r) => r.clientEmail.toLowerCase() === email);
  }
  res.json({ status: "success", records: list });
});
app.post(["/api/sync", "/sync"], (req, res) => {
  if (req.body && req.body.records) {
    dbRecords = req.body.records;
    saveRecords(dbRecords);
  }
  res.json({ status: "success" });
});
async function sendPostToGas(url, payload) {
  if (!url) return null;
  try {
    const jsonBody = JSON.stringify(payload);
    let res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: jsonBody,
      redirect: "manual"
    });
    if (res.status >= 300 && res.status < 400) {
      const redirectUrl = res.headers.get("location");
      if (redirectUrl) {
        res = await fetch(redirectUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: jsonBody
        });
      }
    }
    return res;
  } catch (err) {
    console.warn("GAS Webhook POST error:", err);
    return null;
  }
}
app.post(["/api/process", "/process"], async (req, res) => {
  try {
    const formData = req.body;
    const timestamp = /* @__PURE__ */ new Date();
    if (formData.gasWebhookUrl && formData.gasWebhookUrl.trim() !== currentConfig.gasWebhookUrl) {
      currentConfig.gasWebhookUrl = formData.gasWebhookUrl.trim();
      saveConfig(currentConfig);
    }
    const nowUtc = /* @__PURE__ */ new Date();
    const thaiDate = new Date(nowUtc.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
    const month = ("0" + (thaiDate.getMonth() + 1)).slice(-2);
    const day = ("0" + thaiDate.getDate()).slice(-2);
    const yearStr = ("" + thaiDate.getFullYear()).slice(-2);
    const hours = ("0" + thaiDate.getHours()).slice(-2);
    const mins = ("0" + thaiDate.getMinutes()).slice(-2);
    const secs = ("0" + thaiDate.getSeconds()).slice(-2);
    const formattedTime = `${day}/${month}/${yearStr} ${hours}:${mins}:${secs}`;
    const prefix = "70" + month;
    const currentMonthRecords = dbRecords.filter((r) => r.id.startsWith(prefix));
    let nextNum = 1;
    if (currentMonthRecords.length > 0) {
      const lastId = currentMonthRecords[currentMonthRecords.length - 1].id;
      const lastSeq = parseInt(lastId.substring(4)) || 0;
      nextNum = lastSeq + 1;
    }
    const displayDocId = prefix + ("000" + nextNum).slice(-4);
    const kp = keyPassMap[formData.type] || "1";
    const cabId = getCabinetIdServer(formData.dept);
    const newRecord = {
      id: displayDocId,
      timestamp: timestamp.toISOString(),
      formattedTime,
      clientEmail: formData.clientEmail || "info.finance@mfu.ac.th",
      name: formData.name || "",
      phone: formData.phone || "",
      dept: formData.dept || "",
      avNumber: formData.avNumber || "",
      type: formData.type || "",
      docNumbers: formData.docNumbers || "",
      attachments: Array.isArray(formData.attachments) ? formData.attachments : [],
      other: formData.other || "",
      description: formData.description || "",
      cabinetId: cabId,
      keypass: kp,
      status: "\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08",
      editLog: ""
    };
    newRecord.pdfUrl = "";
    dbRecords.push(newRecord);
    saveRecords(dbRecords);
    const targetWebhookUrl = formData.gasWebhookUrl || currentConfig.gasWebhookUrl || process.env.GAS_WEBHOOK_URL || "";
    if (targetWebhookUrl) {
      try {
        const gasResponse = await sendPostToGas(targetWebhookUrl, {
          ...formData,
          displayDocId,
          id: displayDocId,
          formattedTime,
          timestamp: newRecord.timestamp,
          cabinetId: cabId,
          keypass: kp,
          spreadsheetId: currentConfig.spreadsheetId || "1Uxci-m9YhP7SFYF098f-kVdYgyXyRQ0gTuIUYghX3Fc",
          sheetName: currentConfig.sheetName || "(2570)CHECKLIST"
        });
        if (gasResponse) {
          const gasJson = await gasResponse.json().catch(() => null);
          if (gasJson && gasJson.pdfUrl) {
            newRecord.pdfUrl = gasJson.pdfUrl;
            saveRecords(dbRecords);
          }
        }
      } catch (e) {
        console.warn("Webhook forward failed, stored locally:", e);
      }
    }
    res.json({
      status: "success",
      id: displayDocId,
      record: newRecord
    });
  } catch (err) {
    res.status(500).json({ status: "error", msg: err.message });
  }
});
app.put(["/api/history/:id", "/history/:id"], async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const index = dbRecords.findIndex((r) => String(r.id).trim() === String(id).trim());
    if (index === -1) {
      return res.status(404).json({ status: "error", msg: "Record not found" });
    }
    const kp = updatedData.type ? keyPassMap[updatedData.type] || "1" : dbRecords[index].keypass;
    const cabId = updatedData.dept ? getCabinetIdServer(updatedData.dept) : dbRecords[index].cabinetId;
    const existing = dbRecords[index];
    const updatedRecord = {
      ...existing,
      name: updatedData.name ?? existing.name,
      phone: updatedData.phone ?? existing.phone,
      clientEmail: updatedData.clientEmail ?? existing.clientEmail,
      dept: updatedData.dept ?? existing.dept,
      avNumber: updatedData.avNumber ?? existing.avNumber,
      type: updatedData.type ?? existing.type,
      docNumbers: updatedData.docNumbers ?? existing.docNumbers,
      attachments: Array.isArray(updatedData.attachments) ? updatedData.attachments : existing.attachments,
      other: updatedData.other ?? existing.other,
      description: updatedData.description ?? existing.description,
      cabinetId: cabId,
      keypass: kp,
      status: "\u0E41\u0E01\u0E49\u0E44\u0E02\u0E41\u0E25\u0E49\u0E27",
      editLog: updatedData.editLog ?? existing.editLog
    };
    dbRecords[index] = updatedRecord;
    saveRecords(dbRecords);
    const targetWebhookUrl = updatedData.gasWebhookUrl || currentConfig.gasWebhookUrl || process.env.GAS_WEBHOOK_URL || "";
    if (targetWebhookUrl) {
      try {
        await sendPostToGas(targetWebhookUrl, {
          ...updatedRecord,
          action: "update",
          displayDocId: updatedRecord.id,
          id: updatedRecord.id,
          spreadsheetId: updatedData.spreadsheetId || currentConfig.spreadsheetId || "1Uxci-m9YhP7SFYF098f-kVdYgyXyRQ0gTuIUYghX3Fc",
          sheetName: updatedData.sheetName || currentConfig.sheetName || "(2570)CHECKLIST"
        });
      } catch (e) {
        console.warn("GAS update forward warning:", e);
      }
    }
    res.json({ status: "success", record: updatedRecord });
  } catch (err) {
    res.status(500).json({ status: "error", msg: err.message });
  }
});
app.delete(["/api/history", "/history"], (req, res) => {
  dbRecords = [];
  saveRecords(dbRecords);
  res.json({ status: "success", message: "History cleared" });
});
if (!isVercel) {
  async function startServer() {
    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa"
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
  startServer();
}
var server_default = app;
export {
  server_default as default
};
