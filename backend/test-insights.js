const bizSdk = require('facebook-nodejs-business-sdk');
const AdAccount = bizSdk.AdAccount;
require('dotenv').config();

const api = bizSdk.FacebookAdsApi.init(process.env.FB_ACCESS_TOKEN);

try {
    const account = new AdAccount('act_1555843605744369');
    const ads = await account.getAds(
        ['name', 'status', 'creative', 'insights.date_preset(maximum){spend,cpc,ctr,clicks,action_values,actions,purchase_roas}'],
        { limit: 2, effective_status: ['ACTIVE'] }
    );
    if (ads && ads.length > 0) {
        require('node:fs').writeFileSync('ad-data.json', JSON.stringify(ads[0]._data, null, 2));
    } else {
        console.log("Nenhum anúncio encontrado.");
    }
} catch (e) { console.error(e.message); }
