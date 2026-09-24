import type { Metadata } from "next";
import { Instrument_Serif, Fraunces, Literata } from "next/font/google";
import "./globals.css";

const instrument = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});
const brand = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
  variable: "--font-brand",
  display: "swap",
});
const greekSerif = Literata({
  subsets: ["greek", "greek-ext", "latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
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
      className={`${instrument.variable} ${brand.variable} ${greekSerif.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
