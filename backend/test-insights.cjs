const bizSdk = require('facebook-nodejs-business-sdk');
const AdAccount = bizSdk.AdAccount;
require('dotenv').config();

const api = bizSdk.FacebookAdsApi.init(process.env.FB_ACCESS_TOKEN);

(async function () {
    try {
        const account = new AdAccount('act_1555843605744369');
        const ads = await account.getAds(
            ['name', 'insights.time_range({"since":"2026-02-05","until":"2026-02-06"}){impressions,video_play_actions,video_15_sec_watched_actions,video_30_sec_watched_actions,video_p25_watched_actions}'],
            { limit: 5 }
        );
        if (ads && ads.length > 0) {
            require('node:fs').writeFileSync('test-insights-date.json', JSON.stringify(ads.map(a => a._data), null, 2));
        } else {
            console.log("Nenhum anúncio encontrado.");
        }
    } catch (e) { console.error(e.message); }
})();
