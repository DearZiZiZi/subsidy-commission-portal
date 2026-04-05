import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Шортлист комиссии",
};

export default function ShortlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
