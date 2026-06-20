import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/query-provider";
import { HotkeysProviders } from "@/components/hot-key-provider";



const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

export const metadata: Metadata = {
  title: "EndPoint — API Client",
  description: "A professional API client for developers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${inter.className} antialiased`}
      >
        <QueryProvider>
          <ThemeProvider
            attribute={"class"}
            defaultTheme="dark"
            enableSystem={false}
            forcedTheme="dark">
            <HotkeysProviders>
              <Toaster
                theme="dark"
                toastOptions={{
                  classNames: {
                    toast: "bg-[#1a1a1e] border border-white/[0.08] text-zinc-200 text-xs",
                    description: "text-zinc-500",
                  }
                }}
              />
              {children}
            </HotkeysProviders>
          </ThemeProvider>
        </QueryProvider>

      </body>
    </html>
  );
}