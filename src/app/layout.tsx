import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/query-provider";
import { HotkeysProviders } from "@/components/hot-key-provider";
import { ConsoleSanitizerProvider } from "@/components/console-sanitizer-provider";
import db from "@/lib/db";


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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let isMaintenanceMode = false;
  try {
    const settings = await db.systemSettings.findUnique({
      where: { id: "global" }
    });
    isMaintenanceMode = settings?.maintenanceMode ?? false;
  } catch (error) {
    console.error("Failed to check maintenance mode:", error);
  }

  if (isMaintenanceMode) {
    return (
      <html lang="en">
        <body className={`${inter.variable} ${inter.className} antialiased bg-black text-white flex items-center justify-center min-h-screen`}>
          <div className="text-center p-8 max-w-md w-full border border-white/10 rounded-xl bg-[#0a0a0a] shadow-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-6 text-zinc-500">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <h1 className="text-2xl font-semibold tracking-tight mb-2">Under Maintenance</h1>
            <p className="text-sm text-zinc-400 mb-6">
              We are currently performing scheduled maintenance to improve our systems. We'll be back shortly.
            </p>
          </div>
        </body>
      </html>
    );
  }

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
        suppressHydrationWarning
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `if (window.__TAURI_INTERNALS__ || window.__TAURI__) document.body.classList.add('tauri-glass');`
          }}
        />
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