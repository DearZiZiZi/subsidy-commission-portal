import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API для разработчиков",
};

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
