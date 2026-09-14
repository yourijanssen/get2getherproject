import type { Metadata } from "next";
import { Instrument_Serif, Inter, Noto_Serif } from "next/font/google";
import "./globals.css";

const instrument = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin", "greek"],
  variable: "--font-inter",
  display: "swap",
});
const greekSerif = Noto_Serif({
  subsets: ["greek"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-greek-serif",
  display: "swap",
});
export const metadata: Metadata = {
  title: "Get2Gether",
  description: "Δημιουργικές εμπειρίες που μας φέρνουν κοντά.",
};

// Shares self-hosted typography across both language variants.
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="el"
      className={`${instrument.variable} ${inter.variable} ${greekSerif.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
