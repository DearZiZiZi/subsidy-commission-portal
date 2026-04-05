import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/providers/app-providers";
import { ShellLayout } from "@/components/layout/ShellLayout";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Дашборд · ИС Субсидий МСХ РК",
    template: "%s · ИС Субсидий",
  },
  description:
    "Портал комиссии: скоринг заявок на субсидирование животноводства Республики Казахстан",
  icons: {
    icon: "/gerb.jpg",
    apple: "/gerb.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${inter.variable} min-h-screen font-sans antialiased`}
      >
        <AppProviders>
          <ShellLayout>{children}</ShellLayout>
        </AppProviders>
      </body>
    </html>
  );
}
