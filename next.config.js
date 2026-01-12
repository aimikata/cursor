/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Vercelデプロイ時の最適化設定
  swcMinify: true,
  // 画像最適化の設定
  images: {
    domains: [],
  },
  // 環境変数の設定（クライアント側で使用する場合はNEXT_PUBLIC_プレフィックスが必要）
  env: {
    // 必要に応じて環境変数を追加
  },
}

module.exports = nextConfig
