const bizSdk = require('facebook-nodejs-business-sdk');
const AdAccount = bizSdk.AdAccount;
require('dotenv').config();

const api = bizSdk.FacebookAdsApi.init(process.env.FB_ACCESS_TOKEN);

async function run() {
    try {
        const actId = 'act_904332998495034';
        const account = new AdAccount(actId);
        let options = { level: 'account', time_increment: 1, date_preset: 'last_7d' };
        const insights = await account.getInsights(
            ['spend', 'clicks', 'impressions'],
            options
        );
        console.log("Trend 0:", insights[0] ? insights[0]._data : "No data");
    } catch(err) {
        console.error("API ERROR:", err.message);
    }
}
run();
