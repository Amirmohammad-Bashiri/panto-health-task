import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Panto Task",
  description: "Panto Task - D3 Chart Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
