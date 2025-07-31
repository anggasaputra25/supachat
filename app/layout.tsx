import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import { Urbanist } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Supachat",
  description: "Chatting App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${urbanist.className} antialiased`}
      >
        <NextTopLoader showSpinner={false} />
        {children}
      </body>
    </html>
  );
}
