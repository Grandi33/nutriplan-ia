/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // El SDK de Google GenAI solo se usa en rutas de servidor (app/api/*).
  // Lo marcamos como externo para que no se intente empaquetar en el cliente.
  experimental: {
    serverComponentsExternalPackages: ['@google/genai'],
  },
};

export default nextConfig;
