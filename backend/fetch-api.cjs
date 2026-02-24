const http = require('http');
const fs = require('fs');

http.get('http://localhost:3001/api/relatorio/9fffb133-893d-4735-b37a-6a4b143fe805?dateRange=last_30d', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        fs.writeFileSync('api-resp.json', JSON.stringify(JSON.parse(data), null, 2));
        console.log('Saved to api-resp.json');
    });
}).on('error', (e) => console.error(e));
