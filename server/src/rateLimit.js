// Fixed-window-per-IP limiter held in memory. On Vercel each function instance
// keeps its own counts, so this is a best-effort guard, not a global quota.
export function createRateLimiter({ limit, windowMs }) {
  const hits = new Map(); // ip -> timestamps (ms) within the window

  return function allow(ip, now = Date.now()) {
    const recent = (hits.get(ip) || []).filter((t) => now - t < windowMs);
    if (recent.length >= limit) {
      hits.set(ip, recent);
      return { ok: false, retryAfter: Math.ceil((windowMs - (now - recent[0])) / 1000) };
    }
    recent.push(now);
    hits.set(ip, recent);
    if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
    return { ok: true };
  };
}

/** Client IP as seen behind Vercel / a proxy, falling back to the socket. */
export function clientIp(req) {
  const real = req.headers['x-real-ip'];
  if (typeof real === 'string' && real) return real.trim();
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd) return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}
