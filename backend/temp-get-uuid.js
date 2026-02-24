require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
try {
    await p.relatorio.delete({
        where: { id_unico: '4a43c720-932e-4cff-ba58-73197f0dbd9c' }
    });
    console.log('Registro placeholder removido!');
} catch (e) {
    console.error(e);
} finally {
    await p.$disconnect();
}
