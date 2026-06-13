// Backend local: persiste dados em data/db.json (desenvolvimento / sem Google Sheets)
import fs from 'fs';
import path from 'path';
import { hashPassword } from './auth';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const TERMOS_PADRAO =
  'A garantia cobre exclusivamente o serviço realizado e as peças substituídas neste atendimento, ' +
  'dentro do prazo informado neste comprovante. A garantia não cobre danos causados por queda, ' +
  'contato com líquidos, mau uso, violação do aparelho por terceiros, uso de acessórios inadequados ' +
  'ou novos defeitos não relacionados ao serviço executado.';

function defaultConfig() {
  const now = new Date().toISOString();
  return {
    id: 1, nome_assistencia: 'RC Assistência Técnica', logo_url: '',
    whatsapp: '', endereco: '', cnpj: '', termos_garantia: TERMOS_PADRAO,
    prazo_padrao_garantia: 90, cor_principal: '#2563eb',
    mostrar_valor_comprovante: false, criado_em: now, atualizado_em: now,
  };
}

function defaultDb() {
  const now = new Date().toISOString();
  return {
    users: [{ id: 1, nome: 'Administrador', email: 'admin@rcgarantia.com', senha_hash: hashPassword('123456'), criado_em: now }],
    config: defaultConfig(),
    garantias: [],
    counters: { garantia: 0, user: 1 },
  };
}

function ensure() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb(), null, 2), 'utf8');
}

function readDb() {
  ensure();
  try {
    const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    if (!db.config) db.config = defaultConfig();
    if (!db.garantias) db.garantias = [];
    if (!db.counters) db.counters = { garantia: db.garantias.length, user: 1 };
    return db;
  } catch {
    const fresh = defaultDb();
    fs.writeFileSync(DB_FILE, JSON.stringify(fresh, null, 2), 'utf8');
    return fresh;
  }
}

function writeDb(db) {
  ensure();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

export async function getUserByEmail(email) {
  const db = readDb();
  return db.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase()) || null;
}

export async function getUserById(id) {
  const db = readDb();
  return db.users.find((u) => String(u.id) === String(id)) || null;
}

export async function getConfig() {
  return readDb().config;
}

export async function updateConfig(patch) {
  const db = readDb();
  db.config = { ...db.config, ...patch, id: 1, atualizado_em: new Date().toISOString() };
  writeDb(db);
  return db.config;
}

export async function listGarantias() {
  return readDb().garantias.slice().sort((a, b) => (a.criado_em < b.criado_em ? 1 : -1));
}

export async function getGarantia(id) {
  return readDb().garantias.find((g) => String(g.id) === String(id)) || null;
}

export async function getGarantiaByCodigo(codigo) {
  return readDb().garantias.find((g) => g.codigo_garantia.toLowerCase() === String(codigo).trim().toLowerCase()) || null;
}

export async function createGarantia(data) {
  const db = readDb();
  const now = new Date().toISOString();
  db.counters.garantia = (db.counters.garantia || 0) + 1;
  const ano = new Date().getFullYear();
  const id = db.counters.garantia;
  const garantia = {
    id, codigo_garantia: `GAR-${ano}-${String(id).padStart(4, '0')}`,
    cliente_nome: data.cliente_nome, cliente_whatsapp: data.cliente_whatsapp,
    marca_celular: data.marca_celular, modelo_celular: data.modelo_celular,
    imei: data.imei || '', servico_realizado: data.servico_realizado,
    descricao_servico: data.descricao_servico || '',
    data_entrega: data.data_entrega,
    prazo_garantia_dias: Number(data.prazo_garantia_dias),
    data_final_garantia: data.data_final_garantia,
    valor_servico: data.valor_servico === '' || data.valor_servico == null ? null : Number(data.valor_servico),
    observacoes_internas: data.observacoes_internas || '',
    status: 'Ativa', criado_em: now, atualizado_em: now,
  };
  db.garantias.push(garantia);
  writeDb(db);
  return garantia;
}

export async function updateGarantia(id, patch) {
  const db = readDb();
  const idx = db.garantias.findIndex((g) => String(g.id) === String(id));
  if (idx === -1) return null;
  const atual = db.garantias[idx];
  const updated = {
    ...atual, ...patch, id: atual.id, codigo_garantia: atual.codigo_garantia, criado_em: atual.criado_em,
    prazo_garantia_dias: patch.prazo_garantia_dias != null ? Number(patch.prazo_garantia_dias) : atual.prazo_garantia_dias,
    valor_servico: patch.valor_servico === '' ? null : (patch.valor_servico != null ? Number(patch.valor_servico) : atual.valor_servico),
    atualizado_em: new Date().toISOString(),
  };
  db.garantias[idx] = updated;
  writeDb(db);
  return updated;
}

export async function setStatus(id, status) {
  return updateGarantia(id, { status });
}

export async function deleteGarantia(id) {
  const db = readDb();
  const before = db.garantias.length;
  db.garantias = db.garantias.filter((g) => String(g.id) !== String(id));
  writeDb(db);
  return db.garantias.length < before;
}
