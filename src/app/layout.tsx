import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/shared/Toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudySmarter - Datenbasierte Klausurvorbereitung",
  description:
    "Lade deine Vorlesungsunterlagen hoch und erhalte KI-gestützte Analysen, Trainingsaufgaben, Lernpläne und Karteikarten für deine MINT-Prüfungen.",
  keywords: [
    "Klausurvorbereitung",
    "MINT",
    "Studium",
    "Lernplan",
    "Karteikarten",
    "KI",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="flex min-h-screen flex-col antialiased">
        <ToastProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
