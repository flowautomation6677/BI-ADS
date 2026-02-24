require('dotenv').config();
const bizSdk = require('facebook-nodejs-business-sdk');
const AdAccount = bizSdk.AdAccount;
const fs = require('node:fs');

const access_token = process.env.FB_ACCESS_TOKEN;
const api = bizSdk.FacebookAdsApi.init(access_token);
api.setDebug(false);

const adAccountId = 'act_1555843605744369';

try {
    const account = new AdAccount(adAccountId);
    const ads = await account.getAds(
        ['name', 'insights.date_preset(last_30d){video_15_sec_watched_actions,video_p100_watched_actions,video_p50_watched_actions,video_avg_time_watched_actions}'],
        { limit: 2 }
    );

    let out = '';
    for (let ad of ads) {
        const insights = ad._data.insights?.data?.[0];
        if (insights) {
            out += '--- ' + ad._data.name + '\n';
            out += '15s: ' + insights.video_15_sec_watched_actions?.find(a => a.action_type === 'video_view')?.value + '\n';
            out += 'p100: ' + insights.video_p100_watched_actions?.find(a => a.action_type === 'video_view')?.value + '\n';
            out += 'p50: ' + insights.video_p50_watched_actions?.find(a => a.action_type === 'video_view')?.value + '\n';
            out += '\n';
        }
    }
    fs.writeFileSync('temp-video-out2.txt', out);
} catch (e) {
    fs.writeFileSync('temp-video-out2.txt', JSON.stringify(e?.response?.error || e.message));
}
