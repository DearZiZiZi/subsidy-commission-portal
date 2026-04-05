import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Оценка заявки",
};

export default function EvaluateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
