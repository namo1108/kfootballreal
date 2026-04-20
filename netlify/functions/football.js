const FD  = 'https://api.football-data.org/v4';
const KL  = 'https://v3.football.api-sports.io';
const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };

  const q    = event.queryStringParameters || {};
  const type = q.type || 'fd';
  const path = q.path || '';               // e.g. /competitions/PL/standings

  // Extra params (everything except type/path)
  const extra = {};
  for (const [k, v] of Object.entries(q)) {
    if (k !== 'type' && k !== 'path') extra[k] = v;
  }
  const qs  = new URLSearchParams(extra).toString();
  const sep = path.includes('?') ? (qs ? '&' : '') : (qs ? '?' : '');
  const url_suffix = qs ? sep + qs : '';

  try {
    if (type === 'fd') {
      const key = process.env.FOOTBALL_API_KEY || 'b00e3059f51741b7add3fcaab7eaadf0';
      const url = `${FD}${path}${url_suffix}`;
      console.log('[FD]', url);
      const r   = await fetch(url, {
        headers: { 'X-Auth-Token': key },
        signal: AbortSignal.timeout(10000),
      });
      const txt  = await r.text();
      let   data;
      try { data = JSON.parse(txt); } catch { data = { error: txt }; }
      console.log('[FD] status', r.status, 'errorCode', data?.errorCode);
      return { statusCode: 200, headers: CORS, body: JSON.stringify(data) };
    }

    if (type === 'kl') {
      const key = process.env.APIFOOTBALL_KEY || '421bb1da924d4946cbd3bab1313cc926';
      const url = `${KL}${path}${url_suffix}`;
      console.log('[KL]', url);
      const r   = await fetch(url, {
        headers: { 'x-apisports-key': key },
        signal: AbortSignal.timeout(10000),
      });
      const data = await r.json();
      return { statusCode: 200, headers: CORS, body: JSON.stringify(data) };
    }

    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Unknown type' }) };
  } catch (e) {
    console.error('[ERR]', e.message);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e.message }) };
  }
};
