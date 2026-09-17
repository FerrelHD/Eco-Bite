import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EcoBite — Campus Food Rescue Platform",
  description: "Platform penyelamatan pangan surplus kampus berdiskon 50%-70% dengan dampak lingkungan nyata.",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-surface-canvas text-text-primary antialiased selection:bg-brand-secondary selection:text-white">
        {children}
      </body>
    </html>
  );
}
