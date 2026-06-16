import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/query-provider";



const poppins = Poppins({
  subsets:["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700" , "800", "900"],
})

export const metadata: Metadata = {
  title: "PostBoy",
  description: "A modern API client for developers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.className} antialiased`}
      >
        <QueryProvider>
          <ThemeProvider
           attribute={"class"} 
           defaultTheme="dark"
            enableSystem>
              <Toaster />
              {children}
          </ThemeProvider>
        </QueryProvider>

      </body>
    </html>
  );
}