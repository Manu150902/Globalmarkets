exports.handler = async function(event, context) {
  const FMP_KEY = 'cmKauSWfbednARsd24EaZ5zIpBoixLwZ';

  const symbols = [
    '^DJI','^IXIC','^FTSE','^FCHI','^FTSEMIB.MI','^GDAXI','^GSPTSE',
    '^N225','^HSI','000001.SS','399001.SZ','^AXJO','^BSESN','^STI',
    '^KS11','^SSMI','IMOEX.ME','^BVSP','^J200.JO','^TASI.SR','^DFMGI','^TWII'
  ];

  const results = [];

  for (const sym of symbols) {
    try {
      const url = `https://financialmodelingprep.com/stable/quote?symbol=${encodeURIComponent(sym)}&apikey=${FMP_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      const item = Array.isArray(data) ? data[0] : data;
      if (item && item.price) {
        results.push({ symbol: sym, price: item.price, changePercentage: item.changePercentage || 0 });
      }
    } catch(e) {}
  }

  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
    body: JSON.stringify(results)
  };
};
