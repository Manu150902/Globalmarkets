exports.handler = async function(event, context) {
  const API_KEY = 'cmKauSWfbednARsd24EaZ5zIpBoixLwZ';

  // Symbols to fetch - FMP first, Yahoo as fallback
  const allSymbols = [
    '^DJI','^IXIC','^FTSE','^FCHI','^FTSEMIB.MI','^GDAXI','^GSPTSE',
    '^N225','^HSI','000001.SS','399001.SZ','^AXJO','^BSESN','^STI',
    '^KS11','^SSMI','IMOEX.ME','^BVSP','^J200.JO','^TASI.SR','^DFMGI','^TWII'
  ];

  const results = [];
  const fmpWorked = new Set();

  // Step 1: Try FMP for all symbols
  for (const sym of allSymbols) {
    try {
      const url = `https://financialmodelingprep.com/stable/quote?symbol=${encodeURIComponent(sym)}&apikey=${API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      const item = Array.isArray(data) ? data[0] : data;
      if (item && item.price) {
        results.push({ symbol: sym, price: item.price, changePercentage: item.changePercentage || 0 });
        fmpWorked.add(sym);
      }
    } catch(e) {}
  }

  // Step 2: Yahoo Finance for symbols FMP didn't return
  const missing = allSymbols.filter(s => !fmpWorked.has(s));
  if (missing.length > 0) {
    try {
      const joinedSymbols = missing.map(s => encodeURIComponent(s)).join('%2C');
      const yahooUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${joinedSymbols}&fields=regularMarketPrice,regularMarketChangePercent`;
      const res = await fetch(yahooUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const data = await res.json();
      const quotes = data?.quoteResponse?.result || [];
      for (const q of quotes) {
        if (q.regularMarketPrice) {
          results.push({
            symbol: q.symbol,
            price: q.regularMarketPrice,
            changePercentage: q.regularMarketChangePercent || 0
          });
        }
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
