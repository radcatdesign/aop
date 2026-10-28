export function securityHeaders({ development = false } = {}) {
  return {
    'Content-Security-Policy': [
      "default-src 'none'", "script-src 'self'", "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:", "font-src 'self'", "object-src 'none'",
      "base-uri 'none'", "form-action 'none'", "frame-ancestors 'none'",
      `connect-src 'self'${development ? ' ws://127.0.0.1:* ws://localhost:*' : ''}`,
    ].join('; '),
    'Cache-Control': 'no-store',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
    ...(development ? {} : { 'Strict-Transport-Security': 'max-age=31536000' }),
  };
}

export function protect(response) {
  const result = new Response(response.body, response);
  for (const [name, value] of Object.entries(securityHeaders())) result.headers.set(name, value);
  return result;
}
