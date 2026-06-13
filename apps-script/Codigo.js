// ══════════════════════════════════════════════════════════════════
//  RC Garantia — Google Apps Script
//
//  COMO USAR:
//  1. Abra sua planilha → Extensões → Apps Script
//  2. Apague todo o conteúdo e cole este código
//  3. Salve (Ctrl+S)
//  4. Clique em "Implantar" → "Nova implantação"
//  5. Tipo: App da Web
//     Executar como: Eu
//     Quem tem acesso: Qualquer pessoa
//  6. Clique em "Implantar" e copie a URL gerada
//  7. Coloque a URL no .env.local: GOOGLE_APPS_SCRIPT_URL=https://...
// ══════════════════════════════════════════════════════════════════

// ⚠️  TROQUE ESTA SENHA — use a mesma no .env.local (GOOGLE_APPS_SCRIPT_SECRET)
const SECRET = 'rc-garantia-2026';

const TERMOS = 'A garantia cobre exclusivamente o serviço realizado e as peças substituídas neste atendimento, dentro do prazo informado neste comprovante. A garantia não cobre danos causados por queda, contato com líquidos, mau uso, violação do aparelho por terceiros, uso de acessórios inadequados ou novos defeitos não relacionados ao serviço executado.';

const TABS = { USERS: 'Usuarios', CONFIG: 'Config', GARANTIAS: 'Garantias', META: 'Meta' };

const H = {
  U: ['id','nome','email','senha_hash','criado_em'],
  C: ['nome_assistencia','logo_url','whatsapp','endereco','cnpj','termos_garantia','prazo_padrao_garantia','cor_principal','mostrar_valor_comprovante','criado_em','atualizado_em'],
  G: ['id','codigo_garantia','cliente_nome','cliente_whatsapp','marca_celular','modelo_celular','imei','servico_realizado','descricao_servico','data_entrega','prazo_garantia_dias','data_final_garantia','valor_servico','observacoes_internas','status','criado_em','atualizado_em'],
  M: ['chave','valor']
};

// ─── Entrada principal ───────────────────────────────────────────

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.secret !== SECRET) return res({ error: 'Não autorizado' });

    ensureSetup();

    const { action, data } = body;
    switch (action) {
      case 'getUserByEmail':     return res(getUserByEmail(data.email));
      case 'getUserById':        return res(getUserById(data.id));
      case 'getConfig':          return res(getConfig());
      case 'updateConfig':       return res(updateConfig(data));
      case 'listGarantias':      return res(listGarantias());
      case 'getGarantia':        return res(getGarantia(data.id));
      case 'getGarantiaByCodigo': return res(getGarantiaByCodigo(data.codigo));
      case 'createGarantia':     return res(createGarantia(data));
      case 'updateGarantia':     return res(updateGarantia(data.id, data.patch));
      case 'setStatus':          return res(setStatus(data.id, data.status));
      case 'deleteGarantia':     return res(deleteGarantia(data.id));
      default: return res({ error: 'Ação desconhecida: ' + action });
    }
  } catch (err) {
    return res({ error: err.message });
  }
}

function res(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── Inicialização automática ────────────────────────────────────

function ensureSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const existentes = ss.getSheets().map(s => s.getName());

  Object.values(TABS).forEach(nome => {
    if (!existentes.includes(nome)) ss.insertSheet(nome);
  });

  const meta = getSheet(TABS.META);
  if (meta.getLastRow() < 2) {
    const now = new Date().toISOString();
    setHeadersIfEmpty(TABS.USERS, H.U);
    setHeadersIfEmpty(TABS.CONFIG, H.C);
    setHeadersIfEmpty(TABS.GARANTIAS, H.G);
    setHeadersIfEmpty(TABS.META, H.M);

    appendRow(TABS.USERS, [1, 'Administrador', 'admin@rcgarantia.com', hashPassword('123456'), now]);
    appendRow(TABS.CONFIG, ['RC Assistência Técnica','','','','', TERMOS,'90','#2563eb','false',now,now]);
    appendRow(TABS.META, ['garantia_counter','0']);
  }
}

function setHeadersIfEmpty(tabName, headers) {
  const sheet = getSheet(tabName);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

// ─── Planilha: helpers ───────────────────────────────────────────

function getSheet(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

function getAllRows(tabName, headers) {
  const sheet = getSheet(tabName);
  if (sheet.getLastRow() < 2) return [];
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();
  return values
    .map((row, i) => {
      const obj = { _row: i + 2 };
      headers.forEach((h, j) => { obj[h] = row[j]; });
      return obj;
    })
    .filter(obj => obj[headers[0]] !== '' && obj[headers[0]] !== null);
}

function appendRow(tabName, rowArr) {
  getSheet(tabName).appendRow(rowArr);
}

// ─── Senha (SHA-256 + UUID salt, prefixo "sha256:") ─────────────
// O Next.js reconhece este formato e verifica corretamente.

function hashPassword(senha) {
  const salt = Utilities.getUuid();
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + senha);
  const hash = bytes.map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2,'0')).join('');
  return 'sha256:' + salt + ':' + hash;
}

// ─── Usuários ────────────────────────────────────────────────────

function getUserByEmail(email) {
  const rows = getAllRows(TABS.USERS, H.U);
  const u = rows.find(r => String(r.email).toLowerCase() === String(email).toLowerCase());
  if (!u) return null;
  const { _row, ...rest } = u;
  return rest;
}

function getUserById(id) {
  const rows = getAllRows(TABS.USERS, H.U);
  const u = rows.find(r => String(r.id) === String(id));
  if (!u) return null;
  const { _row, ...rest } = u;
  return rest;
}

// ─── Config ──────────────────────────────────────────────────────

function getConfig() {
  const sheet = getSheet(TABS.CONFIG);
  if (sheet.getLastRow() < 2) return defaultConfig();
  const row = sheet.getRange(2, 1, 1, H.C.length).getValues()[0];
  const obj = { id: 1 };
  H.C.forEach((h, i) => { obj[h] = row[i]; });
  obj.prazo_padrao_garantia = Number(obj.prazo_padrao_garantia) || 90;
  obj.mostrar_valor_comprovante = obj.mostrar_valor_comprovante === 'true' || obj.mostrar_valor_comprovante === true;
  return obj;
}

function defaultConfig() {
  const now = new Date().toISOString();
  return { id:1, nome_assistencia:'RC Assistência Técnica', logo_url:'', whatsapp:'', endereco:'', cnpj:'', termos_garantia:TERMOS, prazo_padrao_garantia:90, cor_principal:'#2563eb', mostrar_valor_comprovante:false, criado_em:now, atualizado_em:now };
}

function updateConfig(patch) {
  const current = getConfig();
  const updated = Object.assign({}, current, patch, { id:1, atualizado_em: new Date().toISOString() });
  if (updated.logo_url && String(updated.logo_url).startsWith('data:') && updated.logo_url.length > 40000) {
    updated.logo_url = ''; // Sheets tem limite de 50k chars por célula
  }
  const row = H.C.map(h => {
    if (h === 'prazo_padrao_garantia') return String(updated[h]);
    if (h === 'mostrar_valor_comprovante') return String(updated[h]);
    return updated[h] === null || updated[h] === undefined ? '' : updated[h];
  });
  getSheet(TABS.CONFIG).getRange(2, 1, 1, row.length).setValues([row]);
  return updated;
}

// ─── Garantias ───────────────────────────────────────────────────

function parseGarantia(obj) {
  const { _row, ...g } = obj;
  return {
    ...g,
    id: Number(g.id) || 0,
    prazo_garantia_dias: Number(g.prazo_garantia_dias) || 0,
    valor_servico: (g.valor_servico === '' || g.valor_servico === null) ? null : Number(g.valor_servico) || null
  };
}

function listGarantias() {
  return getAllRows(TABS.GARANTIAS, H.G)
    .map(parseGarantia)
    .sort((a, b) => String(a.criado_em) < String(b.criado_em) ? 1 : -1);
}

function getGarantia(id) {
  const obj = getAllRows(TABS.GARANTIAS, H.G).find(o => String(o.id) === String(id));
  return obj ? parseGarantia(obj) : null;
}

function getGarantiaByCodigo(codigo) {
  const obj = getAllRows(TABS.GARANTIAS, H.G).find(o => String(o.codigo_garantia).toLowerCase() === String(codigo).toLowerCase());
  return obj ? parseGarantia(obj) : null;
}

function nextCounter() {
  const sheet = getSheet(TABS.META);
  const data = sheet.getDataRange().getValues();
  const idx = data.findIndex(r => r[0] === 'garantia_counter');
  if (idx < 0) return 1;
  const next = (parseInt(String(data[idx][1]), 10) || 0) + 1;
  sheet.getRange(idx + 1, 2).setValue(next);
  return next;
}

function createGarantia(data) {
  const id = nextCounter();
  const now = new Date().toISOString();
  const ano = new Date().getFullYear();
  const g = {
    id,
    codigo_garantia: 'GAR-' + ano + '-' + String(id).padStart(4, '0'),
    cliente_nome: data.cliente_nome || '',
    cliente_whatsapp: data.cliente_whatsapp || '',
    marca_celular: data.marca_celular || '',
    modelo_celular: data.modelo_celular || '',
    imei: data.imei || '',
    servico_realizado: data.servico_realizado || '',
    descricao_servico: data.descricao_servico || '',
    data_entrega: data.data_entrega || '',
    prazo_garantia_dias: Number(data.prazo_garantia_dias) || 0,
    data_final_garantia: data.data_final_garantia || '',
    valor_servico: (data.valor_servico === '' || data.valor_servico == null) ? '' : Number(data.valor_servico),
    observacoes_internas: data.observacoes_internas || '',
    status: 'Ativa',
    criado_em: now,
    atualizado_em: now
  };
  appendRow(TABS.GARANTIAS, H.G.map(h => g[h] === undefined ? '' : g[h]));
  return { ...g, valor_servico: g.valor_servico === '' ? null : Number(g.valor_servico) };
}

function updateGarantia(id, patch) {
  const rows = getAllRows(TABS.GARANTIAS, H.G);
  const found = rows.find(o => String(o.id) === String(id));
  if (!found) return null;
  const cur = parseGarantia(found);
  const up = Object.assign({}, cur, patch, {
    id: cur.id,
    codigo_garantia: cur.codigo_garantia,
    criado_em: cur.criado_em,
    prazo_garantia_dias: patch.prazo_garantia_dias != null ? Number(patch.prazo_garantia_dias) : cur.prazo_garantia_dias,
    valor_servico: patch.valor_servico === '' ? null : (patch.valor_servico != null ? Number(patch.valor_servico) : cur.valor_servico),
    atualizado_em: new Date().toISOString()
  });
  const row = H.G.map(h => (up[h] === null || up[h] === undefined) ? '' : up[h]);
  getSheet(TABS.GARANTIAS).getRange(found._row, 1, 1, row.length).setValues([row]);
  return up;
}

function setStatus(id, status) {
  return updateGarantia(id, { status: status });
}

function deleteGarantia(id) {
  const rows = getAllRows(TABS.GARANTIAS, H.G);
  const found = rows.find(o => String(o.id) === String(id));
  if (!found) return false;
  getSheet(TABS.GARANTIAS).deleteRow(found._row);
  return true;
}
