const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const facebookService = require('../services/facebookService');

/**
 * Endpoint: GET /api/relatorio/:uuid
 * Busca as informações do cliente no banco, depois busca os dados no FB
 * e aplica a lógica de rankeamento baseada no KPI Principal.
 */
const getReport = async (req, res) => {
    const { uuid } = req.params;

    try {
        // 1. Buscar o cliente no Banco de Dados
        const relatorio = await prisma.relatorio.findUnique({
            where: { id_unico: uuid }
        });

        if (!relatorio) {
            return res.status(404).json({ error: "Relatório não encontrado ou link inválido." });
        }

        const adAccountId = relatorio.ad_account_id_facebook;
        const kpi = relatorio.kpi_principal.toLowerCase(); // roas, cpa, ctr...

        // 2. Buscar dados brutos do Facebook
        const adsData = await facebookService.fetchAdData(`act_${adAccountId.replace('act_', '')}`);

        if (!adsData || adsData.length === 0) {
            return res.json({
                cliente: relatorio.nome_cliente,
                kpi_analisado: kpi,
                anuncios: []
            });
        }

        // 3. Aplicar Lógica de Classificação (Scoring)
        adsData.sort((a, b) => {
            let valA = 0;
            let valB = 0;

            // Definir qual métrica comparar baseado no KPI principal escolhido
            switch (kpi) {
                case 'roas':
                    valA = a.metricas.roas; valB = b.metricas.roas;
                    return valB - valA; // Maior ROAS vence
                case 'cpa':
                    valA = a.metricas.cpa; valB = b.metricas.cpa;
                    // Se CPA for 0, joga pro final
                    if (valA === 0) return 1;
                    if (valB === 0) return -1;
                    return valA - valB; // Menor CPA vence
                case 'ctr':
                    valA = a.metricas.ctr; valB = b.metricas.ctr;
                    return valB - valA; // Maior CTR vence
                case 'cliques':
                    valA = a.metricas.clicks; valB = b.metricas.clicks;
                    return valB - valA; // Mais cliques vence
                default:
                    valA = a.metricas.spend; valB = b.metricas.spend;
                    return valB - valA; // Fallback: Quem gastou mais fica no topo
            }
        });

        // 4. Marcar o Vencedor (O primeiro da lista ordenada)
        adsData.forEach((ad, index) => {
            ad.score_interno = adsData.length - index; // pontuação baseada na posição
            ad.is_winner = index === 0; // O Índice 0 é o melhor
        });

        // 5. Retornar JSON limpo para o Frontend
        return res.json({
            cliente: relatorio.nome_cliente,
            kpi_analisado: kpi.toUpperCase(),
            anuncios: adsData
        });

    } catch (error) {
        console.error("Erro no Report Controller:", error);
        return res.status(500).json({
            error: "Erro na comunicação com o Facebook.",
            details: error.message || error.toString()
        });
    }
};

module.exports = {
    getReport
};
