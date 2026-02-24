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
    const { startDate, endDate, status, dateRange, kpi: queryKpi } = req.query;

    try {
        const relatorio = await prisma.relatorio.findUnique({
            where: { id_unico: uuid }
        });

        if (!relatorio) {
            return res.status(404).json({ error: "Relatório não encontrado ou link inválido." });
        }

        const adAccountId = relatorio.ad_account_id_facebook;
        const kpi = (queryKpi || relatorio.kpi_principal || "ROAS").toLowerCase();

        const actId = `act_${adAccountId.replace('act_', '')}`;

        // Parse custom date range (e.g. "2026-01-15,2026-02-15")
        let resolvedStartDate = startDate;
        let resolvedEndDate = endDate;
        let resolvedDateRange = dateRange;

        if (dateRange?.includes(',')) {
            const [customStart, customEnd] = dateRange.split(',');
            resolvedStartDate = customStart;
            resolvedEndDate = customEnd;
            resolvedDateRange = undefined;
        }

        const filters = { startDate: resolvedStartDate, endDate: resolvedEndDate, status, dateRange: resolvedDateRange };

        // Buscas em paralelo: Anúncios detalhados e Tendência global
        const [adsData, trendData] = await Promise.all([
            facebookService.fetchAdData(actId, filters),
            facebookService.fetchAccountTrendData(actId, filters)
        ]);

        if (!adsData || adsData.length === 0) {
            return res.json({
                cliente: relatorio.nome_cliente,
                kpi_analisado: kpi,
                trend_data: trendData,
                campanhas: [], // Antes era anuncios
                overview: { spend: 0, roas: 0, cpa: 0, conversoes: 0 }
            });
        }

        // 1. Agrupar em Campanhas > Conjuntos > Anúncios e somar globais
        let overview = { spend: 0, clicks: 0, conversoes: 0, impressions: 0, reach: 0 };
        let roasSum = 0; let roasCount = 0;

        const campaignMap = {};

        adsData.forEach(ad => {
            // Conta as métricas globais
            overview.spend += ad.metricas.spend || 0;
            overview.clicks += ad.metricas.clicks || 0;
            overview.impressions += ad.metricas.impressions || 0;
            overview.reach += ad.metricas.reach || 0;
            if (ad.metricas.roas > 0) { roasSum += ad.metricas.roas; roasCount++; }
            if (ad.metricas.cpa > 0 && ad.metricas.spend > 0) {
                overview.conversoes += (ad.metricas.spend / ad.metricas.cpa);
            }

            const cId = ad.campaign_id || 'sem_campanha';
            if (!campaignMap[cId]) {
                campaignMap[cId] = {
                    campaign_id: cId,
                    campaign_name: ad.campaign_name || 'Desconhecida',
                    status: ad.status,
                    metricas: { spend: 0, clicks: 0, conversoes: 0, roasSum: 0, roasCount: 0, impressions: 0, reach: 0 },
                    conjuntos: {}
                };
            }

            const aId = ad.adset_id || 'sem_conjunto';
            if (!campaignMap[cId].conjuntos[aId]) {
                campaignMap[cId].conjuntos[aId] = {
                    adset_id: aId,
                    adset_name: ad.adset_name || 'Desconhecido',
                    status: ad.status,
                    metricas: { spend: 0, clicks: 0, conversoes: 0, roasSum: 0, roasCount: 0, impressions: 0, reach: 0, totalAds: 0 },
                    anuncios: []
                };
            }

            // Soma Campanha
            campaignMap[cId].metricas.spend += ad.metricas.spend;
            campaignMap[cId].metricas.clicks += ad.metricas.clicks;
            campaignMap[cId].metricas.impressions += ad.metricas.impressions || 0;
            campaignMap[cId].metricas.reach += ad.metricas.reach || 0;
            if (ad.metricas.roas > 0) { campaignMap[cId].metricas.roasSum += ad.metricas.roas; campaignMap[cId].metricas.roasCount++; }
            if (ad.metricas.cpa > 0) campaignMap[cId].metricas.conversoes += (ad.metricas.spend / ad.metricas.cpa);

            // Soma Conjunto
            campaignMap[cId].conjuntos[aId].metricas.spend += ad.metricas.spend;
            campaignMap[cId].conjuntos[aId].metricas.clicks += ad.metricas.clicks;
            campaignMap[cId].conjuntos[aId].metricas.impressions += ad.metricas.impressions || 0;
            campaignMap[cId].conjuntos[aId].metricas.reach += ad.metricas.reach || 0;
            campaignMap[cId].conjuntos[aId].metricas.totalAds += 1;
            if (ad.metricas.roas > 0) { campaignMap[cId].conjuntos[aId].metricas.roasSum += ad.metricas.roas; campaignMap[cId].conjuntos[aId].metricas.roasCount++; }
            if (ad.metricas.cpa > 0) campaignMap[cId].conjuntos[aId].metricas.conversoes += (ad.metricas.spend / ad.metricas.cpa);

            // Adiciona anuncio
            campaignMap[cId].conjuntos[aId].anuncios.push(ad);
        });

        // 2. Finalizar médias e transformar map em arrays ordenados
        overview.roas = roasCount > 0 ? roasSum / roasCount : 0;
        overview.cpa = overview.conversoes > 0 ? overview.spend / overview.conversoes : 0;
        overview.ctr = overview.impressions > 0 ? (overview.clicks / overview.impressions) * 100 : 0;
        overview.cpm = overview.impressions > 0 ? (overview.spend / overview.impressions) * 1000 : 0;
        overview.conversoes = Math.round(overview.conversoes);

        const campanhas = Object.values(campaignMap).map(camp => {
            camp.metricas.roas = camp.metricas.roasCount > 0 ? camp.metricas.roasSum / camp.metricas.roasCount : 0;
            camp.metricas.cpa = camp.metricas.conversoes > 0 ? camp.metricas.spend / camp.metricas.conversoes : 0;
            camp.metricas.ctr = camp.metricas.impressions > 0 ? (camp.metricas.clicks / camp.metricas.impressions) * 100 : 0;
            camp.metricas.cpm = camp.metricas.impressions > 0 ? (camp.metricas.spend / camp.metricas.impressions) * 1000 : 0;
            camp.metricas.frequency = camp.metricas.reach > 0 ? (camp.metricas.impressions / camp.metricas.reach) : 0;
            camp.metricas.conversoes = Math.round(camp.metricas.conversoes);
            delete camp.metricas.roasSum; delete camp.metricas.roasCount;

            camp.conjuntos = Object.values(camp.conjuntos).map(conj => {
                conj.metricas.roas = conj.metricas.roasCount > 0 ? conj.metricas.roasSum / conj.metricas.roasCount : 0;
                conj.metricas.cpa = conj.metricas.conversoes > 0 ? conj.metricas.spend / conj.metricas.conversoes : 0;
                conj.metricas.ctr = conj.metricas.impressions > 0 ? (conj.metricas.clicks / conj.metricas.impressions) * 100 : 0;
                conj.metricas.cpm = conj.metricas.impressions > 0 ? (conj.metricas.spend / conj.metricas.impressions) * 1000 : 0;
                conj.metricas.frequency = conj.metricas.reach > 0 ? (conj.metricas.impressions / conj.metricas.reach) : 0;
                conj.metricas.conversoes = Math.round(conj.metricas.conversoes);
                delete conj.metricas.roasSum; delete conj.metricas.roasCount; delete conj.metricas.totalAds;

                // Ordena os conjuntos pelo maior gasto por padrão
                conj.anuncios.sort((a, b) => b.metricas.spend - a.metricas.spend);
                return conj;
            }).sort((a, b) => b.metricas.spend - a.metricas.spend);

            return camp;
        }).sort((a, b) => b.metricas.spend - a.metricas.spend);


        // 5. Retornar JSON limpo para o Frontend
        const payload = {
            cliente: relatorio.nome_cliente,
            kpi_analisado: kpi.toUpperCase(),
            overview: overview,
            trend_data: trendData,
            campanhas: campanhas
        };
        console.log("DEBUG PAYLOAD CAMPANHAS[0] METRICAS:", JSON.stringify(campanhas[0]?.metricas));
        return res.json(payload);

    } catch (error) {
        console.error("Erro no Report Controller:", error);
        return res.status(500).json({
            error: "Erro na comunicação com o Facebook.",
            details: error.message || error.toString()
        });
    }
};

const createReport = async (req, res) => {
    try {
        const { nome_cliente, ad_account_id_facebook, kpi_principal } = req.body;

        if (!nome_cliente || !ad_account_id_facebook) {
            return res.status(400).json({ error: "Nome do cliente e ID da Conta de Anúncios são obrigatórios." });
        }

        const novoRelatorio = await prisma.relatorio.create({
            data: {
                nome_cliente,
                ad_account_id_facebook,
                kpi_principal: kpi_principal || "ROAS"
            }
        });

        return res.status(201).json(novoRelatorio);
    } catch (error) {
        console.error("Erro ao criar relatório:", error);
        return res.status(500).json({ error: "Erro ao criar o relatório no banco de dados." });
    }
};

module.exports = {
    getReport,
    createReport
};
