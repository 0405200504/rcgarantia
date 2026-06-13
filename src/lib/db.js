// Roteador de backend: Google Sheets (se configurado) ou JSON local.
// Todas as funções são async para funcionar com ambos os backends.

export { hashPassword, verifyPassword } from './auth';

const USE_SHEETS = !!process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

function backend() {
  return USE_SHEETS ? import('./sheets') : import('./localDb');
}

export async function getUserByEmail(email) { return (await backend()).getUserByEmail(email); }
export async function getUserById(id) { return (await backend()).getUserById(id); }
export async function getConfig() { return (await backend()).getConfig(); }
export async function updateConfig(patch) { return (await backend()).updateConfig(patch); }
export async function listGarantias() { return (await backend()).listGarantias(); }
export async function getGarantia(id) { return (await backend()).getGarantia(id); }
export async function getGarantiaByCodigo(c) { return (await backend()).getGarantiaByCodigo(c); }
export async function createGarantia(data) { return (await backend()).createGarantia(data); }
export async function updateGarantia(id, patch) { return (await backend()).updateGarantia(id, patch); }
export async function setStatus(id, status) { return (await backend()).setStatus(id, status); }
export async function deleteGarantia(id) { return (await backend()).deleteGarantia(id); }
