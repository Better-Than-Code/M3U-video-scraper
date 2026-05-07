/**
 * Taskmaster Stealth Mesh v12.0
 * Optimized for high-concurrency broadcast streams.
 */

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request, env) {
    const { method, url: requestUrl } = request;
    const url = new URL(requestUrl);
    const targetUrl = url.searchParams.get('url');

    // Handle preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: HEADERS });
    }

    if (!targetUrl) {
      return new Response('Target missing', { status: 400 });
    }

    try {
      const target = new URL(targetUrl);
      
      // High-Reputation Identity Spoofing
      const proxyHeaders = new Headers();
      proxyHeaders.set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1');
      proxyHeaders.set('Accept', '*/*');
      proxyHeaders.set('Referer', target.origin + '/');
      proxyHeaders.set('Origin', target.origin);

      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: proxyHeaders,
        redirect: 'follow'
      });

      // Cleanup and Polish Headers
      const outHeaders = new Headers(response.headers);
      Object.entries(HEADERS).forEach(([key, val]) => outHeaders.set(key, val));
      
      // Remove blocking security headers from the source
      outHeaders.delete('content-security-policy');
      outHeaders.delete('x-frame-options');
      outHeaders.delete('set-cookie');
      
      // Force correct MIME type for HLS compliance
      if (targetUrl.includes('.m3u8')) {
        outHeaders.set('Content-Type', 'application/vnd.apple.mpegurl');
      }

      return new Response(response.body, {
        status: response.status,
        headers: outHeaders
      });

    } catch (err) {
      return new Response(`Mesh Bridge Fault: ${err.message}`, { 
        status: 500, 
        headers: HEADERS 
      });
    }
  }
};
