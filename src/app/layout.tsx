import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Money Playground — see your wealth, for fun",
  description:
    "Track your stock portfolio and see your net worth as piles of gold, diamonds, supercars — and how you stack up against your age and country.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
