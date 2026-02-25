const bizSdk = require('facebook-nodejs-business-sdk');
const AdAccount = bizSdk.AdAccount;

// Inicializa o SDK silenciosamente para evitar logs desnecessários, a menos que haja erro grave
let api = null;
if (process.env.FB_ACCESS_TOKEN) {
    api = bizSdk.FacebookAdsApi.init(process.env.FB_ACCESS_TOKEN);
    api.setDebug(false);
}

const mapDateRangeToPreset = (range) => {
    switch (range) {
        case 'today': return 'today';
        case 'yesterday': return 'yesterday';
        case '7d': return 'last_7d';
        case '14d': return 'last_14d';
        case '30d': return 'last_30d';
        case 'this_month': return 'this_month';
        case 'last_month': return 'last_month';
        case 'maximum': return 'maximum';
        default: return 'last_30d';
    }
};

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

const extractBaseMetrics = (insight) => ({
    spend: Number.parseFloat(insight.spend) || 0,
    cpc: Number.parseFloat(insight.cpc) || 0,
    ctr: Number.parseFloat(insight.inline_link_click_ctr) || Number.parseFloat(insight.ctr) || 0,
    clicks: Number.parseInt(insight.inline_link_clicks, 10) || Number.parseInt(insight.clicks, 10) || 0,
    cpm: Number.parseFloat(insight.cpm) || 0,
    frequency: Number.parseFloat(insight.frequency) || 0,
    impressions: Number.parseInt(insight.impressions, 10) || 0,
    reach: Number.parseInt(insight.reach, 10) || 0,
});

const extractVideoViewAction = (actionsArray, actionType = 'video_view') => {
    if (!actionsArray || !Array.isArray(actionsArray)) return 0;
    const action = actionsArray.find(a => a.action_type === actionType);
    return action ? (Number.parseInt(action.value, 10) || 0) : 0;
};

const calculateVideoMetrics = (insight, impressions) => {
    const views3s = extractVideoViewAction(insight.actions);
    const views25pct = extractVideoViewAction(insight.video_p25_watched_actions);
    const views50pct = extractVideoViewAction(insight.video_p50_watched_actions);
    const views75pct = extractVideoViewAction(insight.video_p75_watched_actions);
    const views95pct = extractVideoViewAction(insight.video_p95_watched_actions);
    const views100pct = extractVideoViewAction(insight.video_p100_watched_actions);

    const hook_rate = (impressions > 0 && views3s > 0) ? (views3s / impressions) * 100 : 0;
    const hold_rate = (impressions > 0 && views75pct > 0) ? (views75pct / impressions) * 100 : 0;

    return { hook_rate, hold_rate, views25pct, views50pct, views75pct, views95pct, views100pct };
};

const extractActionMetrics = (insight, spend) => {
    let roas = 0;
    let cpa = 0;

    if (insight.purchase_roas?.length > 0) {
        roas = Number.parseFloat(insight.purchase_roas[0].value) || 0;
    }

    if (insight.actions) {
        const action = insight.actions.find(a =>
            a.action_type === 'purchase' ||
            a.action_type === 'lead' ||
            a.action_type === 'onsite_web_lead'
        );

        if (action && spend > 0) {
            const conversions = Number.parseInt(action.value, 10);
            if (conversions > 0) {
                cpa = spend / conversions;
            }
        }
    }

    return { roas, cpa };
};

const formatMetrics = (adJson) => {
    const defaultMetrics = { spend: 0, cpc: 0, ctr: 0, clicks: 0, roas: 0, cpa: 0, cpm: 0, frequency: 0, impressions: 0, reach: 0, hook_rate: 0, hold_rate: 0, views25pct: 0, views50pct: 0, views75pct: 0, views95pct: 0, views100pct: 0, fatigue: false };

    if (!adJson.insights?.data?.length) {
        return defaultMetrics;
    }

    const insight = adJson.insights.data[0];
    const baseMetrics = extractBaseMetrics(insight);
    const videoMetrics = calculateVideoMetrics(insight, baseMetrics.impressions);
    const actionMetrics = extractActionMetrics(insight, baseMetrics.spend);
    const fatigue = baseMetrics.frequency > 3 && actionMetrics.cpa > 0;

    return {
        ...baseMetrics,
        ...videoMetrics,
        ...actionMetrics,
        fatigue
    };
};

const extractCreativeData = (creativeDetails, fallbackName) => {
    let imageUrl = null;
    let videoUrl = null;
    let copyPrincipal = null;
    let title = null;
    let isVideo = false;

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
            videoUrl = spec.video_data.video_url || null;
            isVideo = true;
        }
    }

    return { imageUrl, videoUrl, copyPrincipal, title: title || fallbackName, isVideo };
};

/**
 * Busca todos os anúncios e suas métricas e criativos
 * @param {string} adAccountId O ID da conta (incluindo o prefixo 'act_')
 * @param {object} filters Filtros opcionais de data e status
 */
const fetchAdData = async (adAccountId, filters = {}) => {
    if (!process.env.FB_ACCESS_TOKEN || process.env.FB_ACCESS_TOKEN === 'SEU_TOKEN_DE_ACESSO_AQUI') {
        throw new Error("Token de acesso do Facebook não configurado no servidor.");
    }

    const account = new AdAccount(adAccountId);

    try {
        let options = { limit: 500 };
        if (filters.status) {
            options.effective_status = [filters.status];
        }
        let insightsParams;
        if (filters.startDate && filters.endDate) {
            options.time_range = { since: filters.startDate, until: filters.endDate };
            insightsParams = `insights.time_range({"since":"${filters.startDate}","until":"${filters.endDate}"})`;
        } else if (filters.dateRange) {
            const preset = mapDateRangeToPreset(filters.dateRange);
            insightsParams = `insights.date_preset(${preset})`;
        } else {
            insightsParams = 'insights.date_preset(maximum)';
        }

        const ads = await account.getAds(
            ['name', 'status', 'effective_status', 'creative', 'campaign{id,name,effective_status}', 'adset{id,name,effective_status}', 'campaign_id', 'campaign_name', 'adset_id', 'adset_name', `${insightsParams}{spend,cpc,ctr,inline_link_click_ctr,clicks,inline_link_clicks,action_values,actions,purchase_roas,cpm,frequency,impressions,reach,video_15_sec_watched_actions,video_p25_watched_actions,video_p50_watched_actions,video_p75_watched_actions,video_p95_watched_actions,video_p100_watched_actions}`],
            options
        );

        const adsData = [];

        for (let ad of ads) {
            const adJson = ad._data;

            const creativeDetails = await getCreativeDetails(adJson);
            const metrics = formatMetrics(adJson);
            const { imageUrl, videoUrl, copyPrincipal, title, isVideo } = extractCreativeData(creativeDetails, adJson.name);

            adsData.push({
                id: adJson.id,
                nome_anuncio: adJson.name,
                campaign_id: adJson.campaign?.id || adJson.campaign_id,
                campaign_name: adJson.campaign?.name || adJson.campaign_name,
                campaign_effective_status: adJson.campaign?.effective_status || 'PAUSED',
                adset_id: adJson.adset?.id || adJson.adset_id,
                adset_name: adJson.adset?.name || adJson.adset_name,
                adset_effective_status: adJson.adset?.effective_status || 'PAUSED',
                status: adJson.status,
                effective_status: adJson.effective_status || adJson.status,
                imagem: imageUrl,
                video: videoUrl, // url para player (pode ser null)
                is_video: isVideo, // flag indicadora
                titulo: title,
                copy_principal: copyPrincipal,
                metricas: metrics
            });
        }

        return adsData;
    } catch (error) {
        console.error("Erro na integração com Facebook API (Ads):", error.message);
        throw error;
    }
};

/**
 * Busca os dados diários da conta inteira para montar o gráfico de tendência
 */
const fetchAccountTrendData = async (adAccountId, filters = {}) => {
    if (!process.env.FB_ACCESS_TOKEN) return [];

    const account = new AdAccount(adAccountId);

    try {
        let options = { level: 'account', time_increment: 1 };

        if (filters.startDate && filters.endDate) {
            options.time_range = { since: filters.startDate, until: filters.endDate };
        } else if (filters.dateRange) {
            options.date_preset = mapDateRangeToPreset(filters.dateRange);
        } else {
            options.date_preset = 'maximum';
        }

        const insights = await account.getInsights(
            ['spend', 'clicks', 'inline_link_clicks', 'impressions', 'cpm', 'ctr', 'inline_link_click_ctr', 'actions', 'action_values'],
            options
        );

        return insights.map(item => {
            const data = item._data;
            const spend = Number.parseFloat(data.spend) || 0;
            const impressions = Number.parseInt(data.impressions, 10) || 0;
            const clicks = Number.parseInt(data.inline_link_clicks, 10) || Number.parseInt(data.clicks, 10) || 0;
            const cpm = Number.parseFloat(data.cpm) || 0;
            const ctr = Number.parseFloat(data.inline_link_click_ctr) || Number.parseFloat(data.ctr) || 0;

            let revenue = 0;
            if (data.action_values) {
                const purchaseValue = data.action_values.find(a => a.action_type === 'purchase');
                if (purchaseValue) revenue = Number.parseFloat(purchaseValue.value) || 0;
            }

            let cpa = 0;
            let conversoes = 0;
            if (data.actions) {
                const action = data.actions.find(a => a.action_type === 'purchase') ||
                    data.actions.find(a => a.action_type === 'lead') ||
                    data.actions.find(a => a.action_type === 'onsite_web_lead');

                if (action && spend > 0) {
                    conversoes = Number.parseInt(action.value, 10);
                    if (conversoes > 0) {
                        cpa = spend / conversoes;
                    }
                }
            }

            return {
                date: data.date_start,
                spend,
                impressions,
                clicks,
                cpm,
                ctr,
                revenue,
                conversoes,
                cpa,
                roas: spend > 0 && revenue > 0 ? revenue / spend : 0,
            };
        });

    } catch (error) {
        console.error("Erro na integração com Facebook API (Trend):", error.message);
        return [];
    }
};

module.exports = {
    fetchAdData,
    fetchAccountTrendData
};
