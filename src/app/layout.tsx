import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ensemble",
  description: "Ensemble event management and attendance tracking",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
