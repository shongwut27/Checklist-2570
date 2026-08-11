export interface ChecklistItem {
  id: string;
  label: string;
}

export interface FormDataState {
  name: string;
  phone: string;
  clientEmail: string;
  dept: string;
  avNumber: string;
  docNumbers: string;
  type: string;
  attachments: string[];
  other: string;
  description: string;
}

export interface ChecklistRecord {
  id: string; // e.g. 70070001
  timestamp: string; // ISO or formatted
  formattedTime: string; // e.g. 23/07/2026 19:20
  clientEmail: string;
  name: string;
  phone: string;
  dept: string;
  avNumber: string;
  type: string;
  docNumbers: string;
  attachments: string[];
  other: string;
  description: string;
  cabinetId: string;
  keypass: string;
  pdfUrl?: string;
  status?: string;
  editLog?: string;
}

export interface WebhookConfig {
  spreadsheetId: string;
  sheetName: string;
  gasWebhookUrl: string;
}
