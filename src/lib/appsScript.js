// Backend via Google Apps Script Web App (sem Google Cloud, sem service account)
// Variáveis necessárias no .env.local:
//   GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
//   GOOGLE_APPS_SCRIPT_SECRET=rc-garantia-2026  (mesmo valor do Apps Script)

const scriptUrl = () => process.env.GOOGLE_APPS_SCRIPT_URL;
const secret = () => process.env.GOOGLE_APPS_SCRIPT_SECRET || 'rc-garantia-2026';

async function call(action, data = {}) {
  const res = await fetch(scriptUrl(), {
    method: 'POST',
    redirect: 'follow', // Apps Script redireciona o POST para a URL real
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: secret(), action, data }),
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Resposta inválida do Apps Script: ' + text.slice(0, 200));
  }
}

export async function getUserByEmail(email) { return call('getUserByEmail', { email }); }
export async function getUserById(id) { return call('getUserById', { id }); }
export async function getConfig() { return call('getConfig'); }
export async function updateConfig(patch) { return call('updateConfig', patch); }
export async function listGarantias() { const r = await call('listGarantias'); return Array.isArray(r) ? r : []; }
export async function getGarantia(id) { return call('getGarantia', { id }); }
export async function getGarantiaByCodigo(codigo) { return call('getGarantiaByCodigo', { codigo }); }
export async function createGarantia(data) { return call('createGarantia', data); }
export async function updateGarantia(id, patch) { return call('updateGarantia', { id, patch }); }
export async function setStatus(id, status) { return call('setStatus', { id, status }); }
export async function deleteGarantia(id) { return call('deleteGarantia', { id }); }
