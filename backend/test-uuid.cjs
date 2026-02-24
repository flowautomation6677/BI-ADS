const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.relatorio.findFirst()
    .then(r => require('fs').writeFileSync('uuid.txt', r.id_unico))
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
