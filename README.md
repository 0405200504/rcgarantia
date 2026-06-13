# RC Garantia — Gestão de Garantias para Assistência Técnica

Sistema web completo para registrar serviços feitos em celulares e controlar o período de garantia de cada atendimento. Design minimalista, responsivo, paleta azul.

## Como rodar

```bash
npm install
npm run dev
```

Acesse: **http://localhost:3000**

### Acesso ao painel (padrão)
- **E-mail:** `admin@rcgarantia.com`
- **Senha:** `123456`

### Consulta pública (cliente, sem login)
- **http://localhost:3000/consulta**

## Funcionalidades

- **Login** seguro (senha com scrypt, sessão por cookie assinado HMAC).
- **Dashboard** com cards (total, ativas, vencidas, vencendo em 7 dias), serviços mais realizados e tabela de garantias recentes.
- **Cadastro de garantia** com cálculo automático da data final (entrega + dias) e **código único** (`GAR-2026-0001`).
- **Lista de garantias** com filtros (cliente, WhatsApp, código, modelo, serviço, status, período de entrega/vencimento) e ações: ver, editar, cancelar, excluir, comprovante.
- **Detalhes** com todos os dados, status calculado, copiar link e envio por WhatsApp.
- **Comprovante** profissional com logo, termos e botões de imprimir / baixar PDF / WhatsApp.
- **Consulta pública** por código ou WhatsApp — não expõe observações internas nem valor.
- **Configurações** da assistência (nome, logo, WhatsApp, endereço, CNPJ, termos, prazo padrão, cor principal).

## Status automáticos
- **Ativa** (verde) · **Vencendo** ≤ 7 dias (amarelo) · **Vencida** (vermelho) · **Cancelada** (cinza).

## Stack
- Next.js 14 (App Router) + React 18
- Tailwind CSS (paleta azul minimalista)
- Persistência local em `data/db.json` (sem serviços externos — roda direto no localhost)
- PDF via impressão do navegador (Salvar como PDF)

> Para produção com Supabase/PostgreSQL, a camada de dados está isolada em `src/lib/db.js` — basta substituir as funções por chamadas ao Supabase mantendo as mesmas assinaturas.

## Estrutura de dados (`data/db.json`)
- **users**: id, nome, email, senha_hash, criado_em
- **config**: nome_assistencia, logo_url, whatsapp, endereco, cnpj, termos_garantia, prazo_padrao_garantia, cor_principal, ...
- **garantias**: id, codigo_garantia, cliente_nome, cliente_whatsapp, marca_celular, modelo_celular, imei, servico_realizado, descricao_servico, data_entrega, prazo_garantia_dias, data_final_garantia, valor_servico, observacoes_internas, status, criado_em, atualizado_em
