// Backend Google Sheets — usa fetch + JWT nativo (sem googleapis)
// Configurar: GOOGLE_SHEETS_SPREADSHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
import crypto from 'crypto';
import { hashPassword } from './auth';

const SID = () => process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const SA_EMAIL = () => process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
const SA_KEY = () => (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '').replace(/\\n/g, '\n');

const TERMOS =
  'A garantia cobre exclusivamente o serviço realizado e as peças substituídas neste atendimento, ' +
  'dentro do prazo informado neste comprovante. A garantia não cobre danos causados por queda, ' +
  'contato com líquidos, mau uso, violação do aparelho por terceiros, uso de acessórios inadequados ' +
  'ou novos defeitos não relacionados ao serviço executado.';

const T = { USERS: 'Usuarios', CONFIG: 'Config', GARANTIAS: 'Garantias', META: 'Meta' };

const H = {
  U: ['id', 'nome', 'email', 'senha_hash', 'criado_em'],
  C: ['nome_assistencia', 'logo_url', 'whatsapp', 'endereco', 'cnpj', 'termos_garantia', 'prazo_padrao_garantia', 'cor_principal', 'mostrar_valor_comprovante', 'criado_em', 'atualizado_em'],
  G: ['id', 'codigo_garantia', 'cliente_nome', 'cliente_whatsapp', 'marca_celular', 'modelo_celular', 'imei', 'servico_realizado', 'descricao_servico', 'data_entrega', 'prazo_garantia_dias', 'data_final_garantia', 'valor_servico', 'observacoes_internas', 'status', 'criado_em', 'atualizado_em'],
  M: ['chave', 'valor'],
};

// --- JWT / Token ---
let _tok = null, _tokExp = 0;

function mkJWT() {
  const now = Math.floor(Date.now() / 1000);
  const h = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const p = Buffer.from(JSON.stringify({ iss: SA_EMAIL(), scope: 'https://www.googleapis.com/auth/spreadsheets', aud: 'https://oauth2.googleapis.com/token', exp: now + 3600, iat: now })).toString('base64url');
  const s = crypto.createSign('RSA-SHA256');
  s.update(`${h}.${p}`);
  return `${h}.${p}.${s.sign(SA_KEY(), 'base64url')}`;
}

async function token() {
  if (_tok && Date.now() < _tokExp) return _tok;
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${mkJWT()}`,
  });
  const d = await r.json();
  if (!d.access_token) throw new Error('Google Sheets auth failed: ' + JSON.stringify(d));
  _tok = d.access_token; _tokExp = Date.now() + 3500000;
  return _tok;
}

async function api(path, method = 'GET', body = null) {
  const t = await token();
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SID()}${path}`, {
    method, headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (data.error) throw new Error(`Sheets API error: ${JSON.stringify(data.error)}`);
  return data;
}

async function vals(tab) {
  const d = await api(`/values/${encodeURIComponent(`${tab}!A:Z`)}`);
  return d.values || [];
}

async function putRange(tab, startRow, rows) {
  await api(`/values/${encodeURIComponent(`${tab}!A${startRow}`)}?valueInputOption=RAW`, 'PUT', { values: rows });
}

async function appendRows(tab, rows) {
  await api(`/values/${encodeURIComponent(`${tab}!A:A`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, 'POST', { values: rows });
}

function toObjs(headers, allRows) {
  return allRows.slice(1).map((r, i) => {
    const o = { _row: i + 2 };
    headers.forEach((h, j) => { o[h] = r[j] ?? ''; });
    return o;
  });
}

function toRow(headers, obj) {
  return headers.map(h => { const v = obj[h]; return (v === null || v === undefined) ? '' : String(v); });
}

// --- Sheet IDs (para deletar linhas) ---
let _sheetIds = null;
async function getSheetId(name) {
  if (!_sheetIds) {
    const d = await api('?fields=sheets.properties');
    _sheetIds = {};
    (d.sheets || []).forEach(s => { _sheetIds[s.properties.title] = s.properties.sheetId; });
  }
  return _sheetIds[name];
}

// --- Inicialização ---
let _ready = false;
async function setup() {
  if (_ready) return;
  let metaRows;
  try { metaRows = await vals(T.META); } catch { metaRows = null; }

  if (!metaRows || metaRows.length < 2) {
    const meta = await api('?fields=sheets.properties');
    const existing = new Set((meta.sheets || []).map(s => s.properties.title));
    const toCreate = [T.USERS, T.CONFIG, T.GARANTIAS, T.META].filter(name => !existing.has(name));
    if (toCreate.length) {
      await api(':batchUpdate', 'POST', { requests: toCreate.map(title => ({ addSheet: { properties: { title } } })) });
      _sheetIds = null;
    }
    await _seed();
  }
  _ready = true;
}

async function _seed() {
  const now = new Date().toISOString();
  const [uRows, cRows, gRows, mRows] = await Promise.all([vals(T.USERS), vals(T.CONFIG), vals(T.GARANTIAS), vals(T.META)]);

  if (uRows.length < 2) {
    await putRange(T.USERS, 1, [H.U, [1, 'Administrador', 'admin@rcgarantia.com', hashPassword('123456'), now]]);
  }
  if (cRows.length < 2) {
    await putRange(T.CONFIG, 1, [H.C, ['RC Assistência Técnica', '', '', '', '', TERMOS, '90', '#2563eb', 'false', now, now]]);
  }
  if (gRows.length === 0) await putRange(T.GARANTIAS, 1, [H.G]);
  if (mRows.length < 2) await putRange(T.META, 1, [H.M, ['garantia_counter', '0']]);
}

async function nextId() {
  const rows = await vals(T.META);
  const idx = rows.findIndex(r => r[0] === 'garantia_counter');
  const cur = parseInt(rows[idx]?.[1] || '0', 10);
  const next = cur + 1;
  await putRange(T.META, idx + 1, [[rows[idx][0], String(next)]]);
  return next;
}

// --- Usuários ---
export async function getUserByEmail(email) {
  await setup();
  const users = toObjs(H.U, await vals(T.USERS));
  const u = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
  if (!u) return null;
  const { _row, ...rest } = u;
  return rest;
}

export async function getUserById(id) {
  await setup();
  const users = toObjs(H.U, await vals(T.USERS));
  const u = users.find(u => String(u.id) === String(id));
  if (!u) return null;
  const { _row, ...rest } = u;
  return rest;
}

// --- Config ---
function parseConfig(row) {
  const obj = {};
  H.C.forEach((h, i) => { obj[h] = row[i] ?? ''; });
  return { id: 1, ...obj, prazo_padrao_garantia: Number(obj.prazo_padrao_garantia) || 90, mostrar_valor_comprovante: obj.mostrar_valor_comprovante === 'true' };
}

export async function getConfig() {
  await setup();
  const rows = await vals(T.CONFIG);
  if (rows.length < 2) return parseConfig([]);
  return parseConfig(rows[1]);
}

export async function updateConfig(patch) {
  await setup();
  const current = await getConfig();
  const updated = { ...current, ...patch, id: 1, atualizado_em: new Date().toISOString() };
  // Trunca logo se base64 — Sheets tem limite de 50k chars por célula
  if (updated.logo_url && updated.logo_url.startsWith('data:') && updated.logo_url.length > 40000) {
    updated.logo_url = '';
  }
  const row = toRow(H.C, { ...updated, prazo_padrao_garantia: String(updated.prazo_padrao_garantia), mostrar_valor_comprovante: String(updated.mostrar_valor_comprovante) });
  await putRange(T.CONFIG, 2, [row]);
  return updated;
}

// --- Garantias ---
function parseG(obj) {
  const { _row, ...g } = obj;
  return { ...g, id: Number(g.id) || 0, prazo_garantia_dias: Number(g.prazo_garantia_dias) || 0, valor_servico: g.valor_servico === '' ? null : Number(g.valor_servico) || null };
}

export async function listGarantias() {
  await setup();
  return toObjs(H.G, await vals(T.GARANTIAS)).map(parseG).sort((a, b) => (a.criado_em < b.criado_em ? 1 : -1));
}

export async function getGarantia(id) {
  await setup();
  const obj = toObjs(H.G, await vals(T.GARANTIAS)).find(o => String(o.id) === String(id));
  return obj ? parseG(obj) : null;
}

export async function getGarantiaByCodigo(codigo) {
  await setup();
  const obj = toObjs(H.G, await vals(T.GARANTIAS)).find(o => o.codigo_garantia?.toLowerCase() === codigo.toLowerCase());
  return obj ? parseG(obj) : null;
}

export async function createGarantia(data) {
  await setup();
  const id = await nextId();
  const now = new Date().toISOString();
  const g = {
    id, codigo_garantia: `GAR-${new Date().getFullYear()}-${String(id).padStart(4, '0')}`,
    cliente_nome: data.cliente_nome, cliente_whatsapp: data.cliente_whatsapp,
    marca_celular: data.marca_celular, modelo_celular: data.modelo_celular,
    imei: data.imei || '', servico_realizado: data.servico_realizado,
    descricao_servico: data.descricao_servico || '',
    data_entrega: data.data_entrega, prazo_garantia_dias: Number(data.prazo_garantia_dias),
    data_final_garantia: data.data_final_garantia,
    valor_servico: data.valor_servico === '' || data.valor_servico == null ? null : Number(data.valor_servico),
    observacoes_internas: data.observacoes_internas || '',
    status: 'Ativa', criado_em: now, atualizado_em: now,
  };
  await appendRows(T.GARANTIAS, [toRow(H.G, { ...g, valor_servico: g.valor_servico == null ? '' : String(g.valor_servico) })]);
  return g;
}

export async function updateGarantia(id, patch) {
  await setup();
  const allRows = await vals(T.GARANTIAS);
  const objs = toObjs(H.G, allRows);
  const found = objs.find(o => String(o.id) === String(id));
  if (!found) return null;
  const cur = parseG(found);
  const up = {
    ...cur, ...patch, id: cur.id, codigo_garantia: cur.codigo_garantia, criado_em: cur.criado_em,
    prazo_garantia_dias: patch.prazo_garantia_dias != null ? Number(patch.prazo_garantia_dias) : cur.prazo_garantia_dias,
    valor_servico: patch.valor_servico === '' ? null : (patch.valor_servico != null ? Number(patch.valor_servico) : cur.valor_servico),
    atualizado_em: new Date().toISOString(),
  };
  const row = toRow(H.G, { ...up, valor_servico: up.valor_servico == null ? '' : String(up.valor_servico) });
  await putRange(T.GARANTIAS, found._row, [row]);
  return up;
}

export async function setStatus(id, status) {
  return updateGarantia(id, { status });
}

export async function deleteGarantia(id) {
  await setup();
  const objs = toObjs(H.G, await vals(T.GARANTIAS));
  const found = objs.find(o => String(o.id) === String(id));
  if (!found) return false;
  const sid = await getSheetId(T.GARANTIAS);
  await api(':batchUpdate', 'POST', {
    requests: [{ deleteDimension: { range: { sheetId: sid, dimension: 'ROWS', startIndex: found._row - 1, endIndex: found._row } } }],
  });
  return true;
}
