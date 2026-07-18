import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import siteConfig from "@/site.config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.baseUrl),
  title: {
    default: `${siteConfig.siteName} — ${siteConfig.city}吃喝玩乐实地指南`,
    template: `%s | ${siteConfig.siteName}`,
  },
  description: siteConfig.siteDescription,
  other: {
    'baidu-site-verification': 'codeva-MAU8dgWrwl',
  },
  alternates: {
    canonical: siteConfig.baseUrl,
  },
  openGraph: {
    title: siteConfig.siteName,
    description: siteConfig.siteDescription,
    type: "website",
    locale: "zh_CN",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
