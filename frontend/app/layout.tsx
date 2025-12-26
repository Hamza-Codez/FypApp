import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Alexander.Ai - AI-Powered Hiring Platform",
  description: "Streamline your hiring process with AI precision. Connect exceptional talent with forward-thinking companies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
