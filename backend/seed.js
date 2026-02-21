const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

try {
    const relatorio = await prisma.relatorio.create({
        data: {
            ad_account_id_facebook: "act_1555843605744369", // Insira a sua conta
            nome_cliente: "Cliente Teste Seed",
            kpi_principal: "ROAS"
        }
    });

    console.log("✅ Cliente de teste criado com sucesso!");
    console.log("Acesse em: http://localhost:3000/report/" + relatorio.id_unico);
} catch (e) {
    console.error(e);
    process.exit(1);
} finally {
    await prisma.$disconnect();
}
