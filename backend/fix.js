const fs = require('node:fs');
fs.writeFileSync('.env', 'PORT=3001\nDATABASE_URL="file:./dev.db"\nFB_ACCESS_TOKEN="SUA_CHAVE"\n');
fs.writeFileSync('prisma/schema.prisma', 'generator client {\n  provider = "prisma-client-js"\n}\n\ndatasource db {\n  provider = "sqlite"\n  url      = env("DATABASE_URL")\n}\n\nmodel Relatorio {\n  id                     String   @id @default(uuid())\n  id_unico               String   @unique @default(uuid())\n  ad_account_id_facebook String\n  nome_cliente           String\n  kpi_principal          String   @default("ROAS") // ROAS, CPA, CTR\n  createdAt              DateTime @default(now())\n  updatedAt              DateTime @updatedAt\n}\n');
console.log("Arquivos corrigidos via Node.js");
