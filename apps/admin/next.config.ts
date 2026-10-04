import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Les paquets du monorepo sont publiés en TypeScript source.
  transpilePackages: ['@ayurmonie/core', '@ayurmonie/supabase'],
};

export default nextConfig;
