const { PrismaClient } = require('@prisma/client');
const fs = require('node:fs');
const prisma = new PrismaClient();

async function main() {
    try {
        const relatorios = await prisma.relatorio.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        let output = "";
        if (relatorios.length === 0) {
            output = "Nenhum relatório encontrado no banco de dados.\n";
        } else {
            output += "=== Últimos Relatórios Criados ===\n";
            relatorios.forEach((r, i) => {
                output += `[${i + 1}] Cliente: ${r.nome_cliente} | Conta: ${r.ad_account_id_facebook}\n`;
                output += `👉 Link: http://localhost:3000/report/${r.id_unico}\n`;
                output += "----------------------------------\n";
            });
        }

        fs.writeFileSync('links-utf8.txt', output, 'utf-8');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
