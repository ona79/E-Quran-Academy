/** @type {import('next').NextConfig} */
const prochaineConfig = {
  reactStrictMode: true,
  // Le backend tourne sur un autre port/hôte (Render/Railway/Fly.io ≥ 2 instances).
  async rewrites() {
    const urlBackend = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
    return [
      { source: '/api-backend/:path*', destination: `${urlBackend}/:path*` },
    ];
  },
};

export default prochaineConfig;
