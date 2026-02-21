const bizSdk = require('facebook-nodejs-business-sdk');
const AdAccount = bizSdk.AdAccount;

// Inicializa o SDK silenciosamente para evitar logs desnecessários, a menos que haja erro grave
let api = null;
if (process.env.FB_ACCESS_TOKEN) {
    api = bizSdk.FacebookAdsApi.init(process.env.FB_ACCESS_TOKEN);
    api.setDebug(false);
}

const getCreativeDetails = async (adJson) => {
    if (!adJson.creative?.id) return null;

    try {
        const creative = new bizSdk.AdCreative(adJson.creative.id);
        const creativeData = await creative.get([
            'image_url',
            'thumbnail_url',
            'title',
            'body',
            'object_story_spec',
            'asset_feed_spec'
        ]);
        return creativeData._data;
    } catch (e) {
        console.warn(`Aviso: Falha ao buscar detalhes do criativo ${adJson.creative.id}`, e.message);
        return null;
    }
};

const formatMetrics = (adJson) => {
    let metrics = { spend: 0, cpc: 0, ctr: 0, clicks: 0, roas: 0, cpa: 0 };

    if (adJson.insights?.data?.length > 0) {
        const insight = adJson.insights.data[0];
        metrics.spend = Number.parseFloat(insight.spend) || 0;
        metrics.cpc = Number.parseFloat(insight.cpc) || 0;
        metrics.ctr = Number.parseFloat(insight.ctr) || 0;
        metrics.clicks = Number.parseInt(insight.clicks, 10) || 0;

        if (insight.purchase_roas?.length > 0) {
            metrics.roas = Number.parseFloat(insight.purchase_roas[0].value) || 0;
        }

        if (insight.actions) {
            const action = insight.actions.find(a => a.action_type === 'purchase') ||
                insight.actions.find(a => a.action_type === 'lead') ||
                insight.actions.find(a => a.action_type === 'onsite_web_lead');

            if (action && metrics.spend > 0) {
                const conversions = Number.parseInt(action.value, 10);
                if (conversions > 0) {
                    metrics.cpa = metrics.spend / conversions;
                }
            }
        }
    }
    return metrics;
};

const extractCreativeData = (creativeDetails, fallbackName) => {
    let imageUrl = null;
    let videoUrl = null;
    let copyPrincipal = null;
    let title = null;

    if (creativeDetails) {
        imageUrl = creativeDetails.image_url || creativeDetails.thumbnail_url;
        title = creativeDetails.title;
        copyPrincipal = creativeDetails.body;

        const spec = creativeDetails.object_story_spec;
        if (spec?.link_data) {
            copyPrincipal = copyPrincipal || spec.link_data.message;
            title = title || spec.link_data.name;
        } else if (spec?.video_data) {
            copyPrincipal = copyPrincipal || spec.video_data.message;
            title = title || spec.video_data.title;
        }
    }

    return { imageUrl, videoUrl, copyPrincipal, title: title || fallbackName };
};

/**
 * Busca todos os anúncios ativos e suas métricas e criativos
 * @param {string} adAccountId O ID da conta (incluindo o prefixo 'act_')
 */
const fetchAdData = async (adAccountId) => {
    if (!process.env.FB_ACCESS_TOKEN || process.env.FB_ACCESS_TOKEN === 'SEU_TOKEN_DE_ACESSO_AQUI') {
        throw new Error("Token de acesso do Facebook não configurado no servidor.");
    }

    const account = new AdAccount(adAccountId);

    try {
        const ads = await account.getAds(
            ['name', 'status', 'creative', 'insights.date_preset(maximum){spend,cpc,ctr,clicks,action_values,actions,purchase_roas}'],
            { limit: 50, effective_status: ['ACTIVE'] }
        );

        const adsData = [];

        for (let ad of ads) {
            const adJson = ad._data;

            const creativeDetails = await getCreativeDetails(adJson);
            const metrics = formatMetrics(adJson);
            const { imageUrl, videoUrl, copyPrincipal, title } = extractCreativeData(creativeDetails, adJson.name);

            adsData.push({
                id: adJson.id,
                nome_anuncio: adJson.name,
                status: adJson.status,
                imagem: imageUrl,
                video: videoUrl, // placeholder para vídeo
                titulo: title,
                copy_principal: copyPrincipal,
                metricas: metrics
            });
        }

        return adsData;
    } catch (error) {
        console.error("Erro na integração com Facebook API:", error.message);
        throw error;
    }
};

module.exports = {
    fetchAdData
};
