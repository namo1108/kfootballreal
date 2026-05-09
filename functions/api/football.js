// Cloudflare Pages Function
// 파일 위치: functions/api/football.js
// 이 파일을 GitHub 리포에 추가하면 자동으로 API endpoint가 생성됩니다

const FD_BASE = 'https://api.football-data.org/v4';
const KL_BASE = 'https://v3.football.api-sports.io';
const FD_KEY  = 'b00e3059f51741b7add3fcaab7eaadf0';
const KL_KEY  = '421bb1da924d4946cbd3bab1313cc926';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
};

export async function onRequest(context) {
  const { request } = context;
  
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  const url  = new URL(request.url);
  const type = url.searchParams.get('type') || 'fd';
  const path = url.searchParams.get('path') || '';

  const extra = new URLSearchParams();
  for (const [k, v] of url.searchParams.entries()) {
    if (k !== 'type' && k !== 'path') extra.set(k, v);
  }
  const qs = extra.toString();
  const sep = path.includes('?') ? '&' : (qs ? '?' : '');
  const suffix = qs ? sep + qs : '';

  try {
    if (type === 'fd') {
      const res = await fetch(`${FD_BASE}${path}${suffix}`, {
        headers: { 'X-Auth-Token': FD_KEY },
      });
      const text = await res.text();
      return new Response(text, { status: 200, headers: CORS });
    }

    if (type === 'kl') {
      const res = await fetch(`${KL_BASE}${path}${suffix}`, {
        headers: { 'x-apisports-key': KL_KEY },
      });
      const text = await res.text();
      return new Response(text, { status: 200, headers: CORS });
    }

    return new Response(JSON.stringify({ error: 'Unknown type' }), {
      status: 400, headers: CORS,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: CORS,
    });
  }
}
