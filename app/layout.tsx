"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import "@/app/globals.css"; // Adjust based on your global styles

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}