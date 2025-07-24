import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Proxima-1 Features",
  description: "AI-Powered Health Intelligence Platform - Feature Testing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}