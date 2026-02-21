require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const token = process.env.FB_ACCESS_TOKEN;
if (!token) {
    console.error("Token não encontrado no .env!");
    process.exit(1);
}

try {
    console.log("Buscando contas de anúncios reais no Facebook...");
    const res = await fetch(`https://graph.facebook.com/v19.0/me/adaccounts?access_token=${token}`);
    const data = await res.json();

    if (data.error) {
        console.error("Erro do Facebook:", data.error.message);
        process.exit(1);
    }

    if (!data.data || data.data.length === 0) {
        console.log("Nenhuma conta de anúncios encontrada para este token.");
        process.exit(0);
    }

    const contas = data.data;
    console.log(`Encontradas ${contas.length} contas:`, contas.map(c => c.id).join(', '));

    const primeiraConta = contas[0].id;

    console.log(`\nCriando relatório de teste para a conta: ${primeiraConta} ...`);

    const relatorio = await prisma.relatorio.create({
        data: {
            ad_account_id_facebook: primeiraConta,
            nome_cliente: "Cliente Real (Auto-Detectado)",
            kpi_principal: "ROAS"
        }
    });

    console.log("==================================================");
    console.log("✅ RELATÓRIO CRIADO COM SUCESSO!");
    console.log(`👉 Link para acessar: http://localhost:3000/report/${relatorio.id_unico}`);
    console.log("==================================================");

} catch (err) {
    console.error("Erro na execução:", err);
} finally {
    await prisma.$disconnect();
}
