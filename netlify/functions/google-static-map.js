const crypto = require('crypto');
const MAX_SIZE = 640;

function json(statusCode, payload) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(payload),
  };
}

function finiteNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Use POST.' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid JSON request.' });
  }

  const lat = finiteNumber(payload.lat);
  const lon = finiteNumber(payload.lon);
  const zoom = Math.round(finiteNumber(payload.zoom) ?? -1);
  const width = Math.round(finiteNumber(payload.width) ?? 0);
  const height = Math.round(finiteNumber(payload.height) ?? 0);
  const scale = Number(payload.scale) === 1 ? 1 : 2;
  const allowedMapTypes = new Set(['roadmap', 'satellite', 'hybrid', 'terrain']);
  const mapType = allowedMapTypes.has(payload.mapType) ? payload.mapType : 'roadmap';

  if (lat === null || lat < -85.05112878 || lat > 85.05112878) {
    return json(400, { error: 'Invalid map center latitude.' });
  }
  if (lon === null || lon < -180 || lon > 180) {
    return json(400, { error: 'Invalid map center longitude.' });
  }
  if (zoom < 0 || zoom > 21) {
    return json(400, { error: 'Invalid Google Maps zoom.' });
  }
  if (width < 180 || height < 180 || width > MAX_SIZE || height > MAX_SIZE) {
    return json(400, { error: `Google Static Maps logical size must be 180-${MAX_SIZE}px per side.` });
  }

  // Production: configure GOOGLE_MAPS_API_KEY in Netlify Environment Variables.
  // Testing fallback: a key can be supplied from the page; it is not stored by this project.
  const apiKey = String(process.env.GOOGLE_MAPS_API_KEY || payload.apiKey || '').trim();
  if (!apiKey) {
    return json(400, {
      error: 'Google Maps API key is not configured. Set GOOGLE_MAPS_API_KEY in Netlify or enter a key in the page for testing.',
    });
  }

  const url = new URL('https://maps.googleapis.com/maps/api/staticmap');
  url.searchParams.set('center', `${lat.toFixed(8)},${lon.toFixed(8)}`);
  url.searchParams.set('zoom', String(zoom));
  url.searchParams.set('size', `${width}x${height}`);
  url.searchParams.set('scale', String(scale));
  url.searchParams.set('maptype', mapType);
  url.searchParams.set('format', 'png32');
  url.searchParams.set('language', 'en');
  url.searchParams.set('region', 'in');
  url.searchParams.set('key', apiKey);

  // Optional but recommended: configure GOOGLE_MAPS_URL_SIGNING_SECRET in Netlify.
  // The secret stays server-side and is never sent to the browser.
  const signingSecret = String(process.env.GOOGLE_MAPS_URL_SIGNING_SECRET || '').trim();
  if (signingSecret) {
    try {
      const pathAndQuery = `${url.pathname}?${url.searchParams.toString()}`;
      const decodedSecret = Buffer.from(signingSecret, 'base64url');
      const signature = crypto.createHmac('sha1', decodedSecret).update(pathAndQuery).digest('base64url');
      url.searchParams.set('signature', signature);
    } catch (error) {
      return json(500, { error: `Google Maps URL signing failed: ${error.message || String(error)}` });
    }
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Adinn-OOH-Google-Map-Tool/2.0',
      },
    });

    if (!response.ok) {
      const body = (await response.text()).slice(0, 500);
      return json(response.status, {
        error: `Google Maps request failed (${response.status}). ${body || 'Check API access, key restrictions, billing, and quota.'}`,
      });
    }

    const bytes = Buffer.from(await response.arrayBuffer());
    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'image/png',
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*',
        'X-Google-Staticmap-Warning': response.headers.get('x-staticmap-api-warning') || '',
      },
      body: bytes.toString('base64'),
    };
  } catch (error) {
    return json(502, { error: `Unable to reach Google Maps: ${error.message || String(error)}` });
  }
};
