import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'License Management System',
  description: 'Google Sheets APIを使用したライセンス管理システム',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
