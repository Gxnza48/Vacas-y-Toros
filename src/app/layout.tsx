import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vacas y Toros",
  description: "Un juego multijugador minimalista de estrategia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={`${outfit.className} h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col m-0 p-0 overflow-x-hidden">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
