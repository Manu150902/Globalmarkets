exports.handler = async function(event, context) {
  const FMP_KEY = 'cmKauSWfbednARsd24EaZ5zIpBoixLwZ';
  const AV_KEY = 'J6KPD4CLR4XEPWTG';

  // Alpha Vantage symbols for all indices
  const avSymbols = [
    { fmp:'^DJI',        av:'DJI' },
    { fmp:'^IXIC',       av:'COMP' },
    { fmp:'^FTSE',       av:'FTSE' },
    { fmp:'^FCHI',       av:'PX1' },
    { fmp:'^FTSEMIB.MI', av:'FTSEMIB' },
    { fmp:'^GDAXI',      av:'DAX' },
    { fmp:'^GSPTSE',     av:'GSPTSE' },
    { fmp:'^N225',       av:'N225' },
    { fmp:'^HSI',        av:'HSI' },
    { fmp:'000001.SS',   av:'000001.SHH' },
    { fmp:'399001.SZ',   av:'399001.SHZ' },
    { fmp:'^AXJO',       av:'AXJO' },
    { fmp:'^BSESN',      av:'BSESN' },
    { fmp:'^STI',        av:'STI' },
    { fmp:'^KS11',       av:'KS11' },
    { fmp:'^SSMI',       av:'SSMI' },
    { fmp:'IMOEX.ME',    av:'IMOEX' },
    { fmp:'^BVSP',       av:'BVSP' },
    { fmp:'^J200.JO',    av:'J200' },
    { fmp:'^TASI.SR',    av:'TASI' },
    { fmp:'^DFMGI',      av:'DFMGI' },
    { fmp:'^TWII',       av:'TWII' },
  ];

  const results = [];

  // Use Alpha Vantage for everything - fetch in parallel batches of 5
  const batchSize = 5;
  for (let i = 0; i < avSymbols.length; i += batchSize) {
    const batch = avSymbols.slice(i, i + batchSize);
    const promises = batch.map(async s => {
      try {
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${s.av}&apikey=${AV_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        const q = data['Global Quote'];
        if (q && q['05. price'] && parseFloat(q['05. price']) > 0) {
          return {
            symbol: s.fmp,
            price: parseFloat(q['05. price']),
            changePercentage: parseFloat(q['10. change percent']?.replace('%','') || '0')
          };
        }
      } catch(e) {}
      return null;
    });
    const batchResults = await Promise.all(promises);
    batchResults.forEach(r => { if (r) results.push(r); });
  }

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(results)
  };
};
