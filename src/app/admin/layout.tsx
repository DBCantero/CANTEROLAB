import type { Metadata } from "next";

import "./admin.css";

export const metadata: Metadata = {
  title: { absolute: "Painel editorial | CanteroLab" },
  description: "Administração privada do CanteroLab.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="admin-app">{children}</div>;
}
