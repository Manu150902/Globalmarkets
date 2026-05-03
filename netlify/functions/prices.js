exports.handler = async function(event, context) {
  const FMP_KEY = 'cmKauSWfbednARsd24EaZ5zIpBoixLwZ';
  const AV_KEY = 'J6KPD4CLR4XEPWTG';

  const symbols = [
    { id:'nyse',     fmp:'^DJI',        av:'DJI' },
    { id:'nasdaq',   fmp:'^IXIC',       av:'COMP' },
    { id:'lse',      fmp:'^FTSE',       av:'FTSE' },
    { id:'enx',      fmp:'^FCHI',       av:'PX1' },
    { id:'bit',      fmp:'^FTSEMIB.MI', av:'FTSEMIB' },
    { id:'fra',      fmp:'^GDAXI',      av:'DAX' },
    { id:'tsx',      fmp:'^GSPTSE',     av:'GSPTSE' },
    { id:'tse',      fmp:'^N225',       av:'N225' },
    { id:'hkex',     fmp:'^HSI',        av:'HSI' },
    { id:'sse',      fmp:'000001.SS',   av:'000001.SHH' },
    { id:'szse',     fmp:'399001.SZ',   av:'399001.SHZ' },
    { id:'asx',      fmp:'^AXJO',       av:'AXJO' },
    { id:'bse',      fmp:'^BSESN',      av:'BSESN' },
    { id:'sgx',      fmp:'^STI',        av:'STI' },
    { id:'krx',      fmp:'^KS11',       av:'KS11' },
    { id:'six',      fmp:'^SSMI',       av:'SSMI' },
    { id:'moex',     fmp:'IMOEX.ME',    av:'IMOEX' },
    { id:'b3',       fmp:'^BVSP',       av:'BVSP' },
    { id:'jse',      fmp:'^J200.JO',    av:'J200' },
    { id:'tadawul',  fmp:'^TASI.SR',    av:'TASI' },
    { id:'dfm',      fmp:'^DFMGI',      av:'DFMGI' },
    { id:'twse',     fmp:'^TWII',       av:'TWII' },
  ];

  const results = [];
  const fmpWorked = new Set();

  // Step 1: FMP
  for (const s of symbols) {
    try {
      const url = `https://financialmodelingprep.com/stable/quote?symbol=${encodeURIComponent(s.fmp)}&apikey=${FMP_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      const item = Array.isArray(data) ? data[0] : data;
      if (item && item.price) {
        results.push({ symbol: s.fmp, price: item.price, changePercentage: item.changePercentage || 0 });
        fmpWorked.add(s.fmp);
      }
    } catch(e) {}
  }

  // Step 2: Alpha Vantage for missing symbols
  const missing = symbols.filter(s => !fmpWorked.has(s.fmp));
  for (const s of missing) {
    try {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${s.av}&apikey=${AV_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      const q = data['Global Quote'];
      if (q && q['05. price']) {
        const price = parseFloat(q['05. price']);
        const chg = parseFloat(q['10. change percent']?.replace('%','') || '0');
        results.push({ symbol: s.fmp, price, changePercentage: chg });
      }
    } catch(e) {}
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
