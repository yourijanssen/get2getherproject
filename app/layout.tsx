import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Get2Gether",
  description: "Μια βασική ιστοσελίδα Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="el">
      <body>{children}</body>
    </html>
  );
}
