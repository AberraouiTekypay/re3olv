import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RE3OLV",
  description: "B2B Debt Management & Advocacy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-right" />
        <footer className="mt-auto py-6 border-t border-slate-100 bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 flex justify-between items-center text-sm font-bold text-slate-500">
            <p>&copy; 2026 RE3OLV Infrastructure</p>
            <div className="flex gap-6 items-center">
              <a href="/agent/dashboard" className="hover:text-indigo-600 transition-colors">Agent Dashboard</a>
              <a href="/alpha" className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">Alpha Launchpad</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
