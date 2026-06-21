import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/query-provider";
import { HotkeysProviders } from "@/components/hot-key-provider";
import { ConsoleSanitizerProvider } from "@/components/console-sanitizer-provider";



const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

export const metadata: Metadata = {
  metadataBase: new URL('https://httply.qzz.io'),
  title: "Httply — API Client",
  description: "A professional API client for developers. Test, debug, and automate REST APIs easily.",
  keywords: ["API client", "REST API", "developer tools", "Httply", "API testing", "Postman alternative"],
  openGraph: {
    title: "Httply — API Client",
    description: "A professional API client for developers. Test, debug, and automate REST APIs easily.",
    url: 'https://httply.qzz.io',
    siteName: 'Httply',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Httply Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Httply — API Client",
    description: "A professional API client for developers.",
    images: ['/twitter-image.png'],
  },
  alternates: {
    canonical: '/',
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                name: "Httply",
                applicationCategory: "DeveloperApplication",
                operatingSystem: "Any",
                url: "https://httply.qzz.io",
                description: "A professional API client for developers. Test, debug, and automate REST APIs easily."
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Httply",
                url: "https://httply.qzz.io/"
              }
            ])
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${inter.className} antialiased`}
      >
        <ConsoleSanitizerProvider>
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
        </ConsoleSanitizerProvider>

      </body>
    </html>
  );
}