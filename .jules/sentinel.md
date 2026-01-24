## 2026-01-24 - [Add Security Headers in Next.js]
**Vulnerability:** Missing standard HTTP security headers (X-Frame-Options, HSTS, etc.) exposed the app to clickjacking and other client-side attacks.
**Learning:** Next.js requires explicit configuration in `next.config.ts` to set these headers. `remotePatterns` handling for images also needs careful typing.
**Prevention:** Always include a `headers()` async function in `next.config.ts` returning security headers for `/:path*`.
