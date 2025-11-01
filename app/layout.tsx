import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppHeader } from "../components/AppHeader";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinCafé | Coffee farm administration",
  description: "Control panel to manage users and operations for coffee farms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-stone-100 text-stone-900 antialiased">
        <Providers>
          <AppHeader />
          <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
