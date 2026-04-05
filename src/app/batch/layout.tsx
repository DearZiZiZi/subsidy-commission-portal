import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Пакетная обработка",
};

export default function BatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
