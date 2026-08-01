/** @type {import('next').NextConfig} */
const prochaineConfig = {
  reactStrictMode: true,
  // Le backend tourne sur un autre port/hôte (Render/Railway/Fly.io ≥ 2 instances).
  async rewrites() {
    const urlBackend = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
    const urlWsBackend = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3002';
    return [
      { source: '/api-backend/:path*', destination: `${urlBackend}/:path*` },
      { source: '/ws-backend/:path*', destination: `${urlWsBackend}/:path*` },
    ];
  },
};

export default prochaineConfig;
