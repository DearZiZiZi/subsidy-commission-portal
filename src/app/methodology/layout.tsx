import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Методология",
};

export default function MethodologyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
