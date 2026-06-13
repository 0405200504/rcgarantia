// Roteador de backend — prioridade:
//   1. Google Apps Script  (GOOGLE_APPS_SCRIPT_URL)   ← mais simples
//   2. Google Sheets API   (GOOGLE_SHEETS_SPREADSHEET_ID) ← service account
//   3. JSON local          (padrão para desenvolvimento)

export { hashPassword, verifyPassword } from './auth';

function backend() {
  if (process.env.GOOGLE_APPS_SCRIPT_URL)        return import('./appsScript');
  if (process.env.GOOGLE_SHEETS_SPREADSHEET_ID)  return import('./sheets');
  return import('./localDb');
}

export async function getUserByEmail(email)       { return (await backend()).getUserByEmail(email); }
export async function getUserById(id)             { return (await backend()).getUserById(id); }
export async function getConfig()                 { return (await backend()).getConfig(); }
export async function updateConfig(patch)         { return (await backend()).updateConfig(patch); }
export async function listGarantias()             { return (await backend()).listGarantias(); }
export async function getGarantia(id)             { return (await backend()).getGarantia(id); }
export async function getGarantiaByCodigo(c)      { return (await backend()).getGarantiaByCodigo(c); }
export async function createGarantia(data)        { return (await backend()).createGarantia(data); }
export async function updateGarantia(id, patch)   { return (await backend()).updateGarantia(id, patch); }
export async function setStatus(id, status)       { return (await backend()).setStatus(id, status); }
export async function deleteGarantia(id)          { return (await backend()).deleteGarantia(id); }
