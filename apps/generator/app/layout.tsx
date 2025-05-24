import './globals.css';

import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import Content from '@/components/Content';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pepe Generator',
  description: 'Generate Pepes',
};








export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Content>{children}</Content>
        </body>
      </html>
    </ClerkProvider>
  );
}
