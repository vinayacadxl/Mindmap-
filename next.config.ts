import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
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
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignore optional OpenTelemetry exporter that is not installed
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@opentelemetry/exporter-jaeger': false,
      };
      // Also suppress it as an externals warning
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        { module: /@opentelemetry\/exporter-jaeger/ },
      ];
    }
    return config;
  },
};

export default nextConfig;
