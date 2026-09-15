import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Build ra bản tự chứa (server.js + node_modules tối thiểu) cho Docker.
  output: 'standalone',
  experimental: {
    // Monorepo: trace file từ root để bản standalone gom đủ package workspace.
    outputFileTracingRoot: join(appDir, '../..'),
  },
  transpilePackages: ['@lang/shared', '@lang/exam-core'],
  // Gọi API cùng origin: /api/* -> lang-api. Rewrite bị cố định lúc build
  // (Next standalone không đọc lại lúc runtime): local mặc định 127.0.0.1:3101,
  // Docker truyền BACKEND_INTERNAL_URL=http://127.0.0.1:3002 khi build.
  async rewrites() {
    const backend = process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:3101';
    return [
      {
        source: '/api/:path*',
        destination: `${backend}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
