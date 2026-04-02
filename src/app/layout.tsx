import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/providers/app-providers";
import { ShellLayout } from "@/components/layout/ShellLayout";

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ИС скоринга субсидий животноводства — Merit v2",
  description:
    "Портал комиссии: скоринг заявок на субсидирование животноводства Республики Казахстан",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${dmMono.variable} min-w-[1280px] font-sans antialiased`}
      >
        <AppProviders>
          <ShellLayout>{children}</ShellLayout>
        </AppProviders>
      </body>
    </html>
  );
}
