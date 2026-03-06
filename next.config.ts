import type { NextConfig } from 'next';
import path from 'path';


const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  turbopack: {
    resolveAlias: {
      '@opentelemetry/exporter-jaeger': path.resolve(process.cwd(), 'empty-module.js'),
      '@opentelemetry/exporter-zipkin': path.resolve(process.cwd(), 'empty-module.js'),
    },
  },

  serverExternalPackages: [
    '@opentelemetry/sdk-node',
    'genkit',
    '@genkit-ai/core',
    '@genkit-ai/next',
    '@genkit-ai/googleai'
  ],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Use alias to replace the missing module with an empty one
      config.resolve.alias = {
        ...config.resolve.alias,
        '@opentelemetry/exporter-jaeger': path.resolve(process.cwd(), 'empty-module.js'),
        '@opentelemetry/exporter-zipkin': path.resolve(process.cwd(), 'empty-module.js'),
      };
      // Ignore optional OpenTelemetry exporter that is not installed
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@opentelemetry/exporter-jaeger': false,
        '@opentelemetry/exporter-zipkin': false,
      };
      // Also suppress it as an externals warning
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        { module: /@opentelemetry\/exporter-jaeger/ },
        { module: /@opentelemetry\/exporter-zipkin/ },
      ];
    }
    return config;
  },

};

export default nextConfig;
