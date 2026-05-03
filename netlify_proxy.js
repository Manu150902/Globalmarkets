exports.handler = async function(event, context) {
  const API_KEY = 'cmKauSWfbednARsd24EaZ5zIpBoixLwZ';
  const url = `https://financialmodelingprep.com/api/v3/quotes/index?apikey=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
