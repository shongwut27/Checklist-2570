import fs from 'fs';
let lines = fs.readFileSync('server.ts', 'utf8').split('\n');

const newLines = `    newRecord.pdfUrl = "https://drive.google.com/drive/folders/1uCP6AOi-d2JhHFsouZJhnu0_zNZquTSj";
    dbRecords.push(newRecord);
    saveRecords(dbRecords);

    // Forward to Google Apps Script Webhook if configured
    const targetWebhookUrl = formData.gasWebhookUrl || currentConfig.gasWebhookUrl || process.env.GAS_WEBHOOK_URL || "";
    if (targetWebhookUrl) {
      try {
        const gasResponse = await fetch(targetWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            displayDocId,
            id: displayDocId,
            formattedTime,
            timestamp: newRecord.timestamp,
            cabinetId: cabId,
            keypass: kp,
            spreadsheetId: currentConfig.spreadsheetId || "1Uxci-m9YhP7SFYF098f-kVdYgyXyRQ0gTuIUYghX3Fc",
            sheetName: currentConfig.sheetName || "2570-CHECKLIST",
            templateSlideId: "1H0Ka4w-cNHpb-nXEdLbzpqq2PJodYsRLjgqS0rcwGFU",
            folderId: "1uCP6AOi-d2JhHFsouZJhnu0_zNZquTSj",
          }),
        });

        const gasJson = await gasResponse.json().catch(() => null);
        if (gasJson && gasJson.pdfUrl) {
          newRecord.pdfUrl = gasJson.pdfUrl;
          saveRecords(dbRecords);
        }
      } catch (e) {
        console.warn("Webhook forward failed, stored locally:", e);
      }
    }`;

lines.splice(322, 38, ...newLines.split('\n'));
fs.writeFileSync('server.ts', lines.join('\n'));
