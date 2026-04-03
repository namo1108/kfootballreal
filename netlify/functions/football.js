// netlify/functions/football.js
// football-data.org 프록시 (유럽 리그 무료 현재시즌)
// + api-sports 프록시 (K리그 - 무료플랜 2022~2024만, 데모로 대체)

const FD_BASE = 'https://api.football-data.org/v4';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const apiKey = process.env.FOOTBALL_API_KEY;
  if (!apiKey) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'No API key' }) };
  }

  const params = { ...(event.queryStringParameters || {}) };
  const path = params.path || '/competitions';
  delete params.path;

  const qs = new URLSearchParams(params).toString();
  const url = `${FD_BASE}${path}${qs ? '?' + qs : ''}`;

  try {
    const res = await fetch(url, {
      headers: { 'X-Auth-Token': apiKey }
    });
    const data = await res.json();
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: err.message }) };
  }
};
