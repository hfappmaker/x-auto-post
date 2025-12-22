import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'X Auto Post Bot',
  description: 'Vercel Cronで定期的にツイートを自動投稿',
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
