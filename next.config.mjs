/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // El SDK de Anthropic solo se usa en rutas de servidor (app/api/*).
  // Lo marcamos como externo para que no se intente empaquetar en el cliente.
  experimental: {
    serverComponentsExternalPackages: ['@anthropic-ai/sdk'],
  },
};

export default nextConfig;
