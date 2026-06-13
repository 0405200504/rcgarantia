# Configurar Google Sheets como banco de dados

## Passo 1 — Criar projeto no Google Cloud
1. Acesse https://console.cloud.google.com
2. Crie um novo projeto (ex: "rc-garantia")
3. No menu, vá em **APIs e serviços → Biblioteca**
4. Pesquise **Google Sheets API** e clique em **Ativar**

## Passo 2 — Criar Service Account
1. Vá em **APIs e serviços → Credenciais**
2. Clique em **+ Criar credenciais → Conta de serviço**
3. Nome: `rc-garantia` → Clique em **Criar**
4. Role para baixo → Clique em **Chaves → Adicionar chave → JSON**
5. O arquivo `.json` será baixado automaticamente

## Passo 3 — Criar a planilha
1. Acesse https://sheets.google.com
2. Crie uma nova planilha em branco
3. Copie o ID da URL:
   `https://docs.google.com/spreadsheets/d/**SEU_ID_AQUI**/edit`

## Passo 4 — Compartilhar com o Service Account
1. Abra a planilha → clique em **Compartilhar**
2. Cole o e-mail do service account (ex: `rc-garantia@projeto.iam.gserviceaccount.com`)
3. Permissão: **Editor** → Confirmar

## Passo 5 — Configurar o .env.local
Crie o arquivo `.env.local` na raiz do projeto:

```env
GOOGLE_SHEETS_SPREADSHEET_ID=cole_o_id_aqui

GOOGLE_SERVICE_ACCOUNT_EMAIL=rc-garantia@projeto.iam.gserviceaccount.com

# Abra o JSON baixado, copie o campo "private_key" inteiro (com as \n)
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n
```

## Passo 6 — Reiniciar o servidor
```bash
npm run dev
```

O sistema vai criar automaticamente as abas **Usuarios**, **Config**, **Garantias** e **Meta** na planilha na primeira requisição.

---

**Observação:** Para a logo da empresa, use uma URL de imagem hospedada (ex: Google Drive público, Imgur) em vez de upload de arquivo, pois o Google Sheets tem limite de 50.000 caracteres por célula.
