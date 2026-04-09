import type { Metadata } from "next";
import { headers } from "next/headers";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://snipshift.dev"),
  title: {
    template: "%s | SnipShift  Free Developer Tools",
    default:
      "SnipShift  Free Online Developer Converter Tools | JS to TS, JSON to Zod, CSS to Tailwind & More",
  },
  description:
    "Free developer tools to convert code instantly. JS/JSX to TypeScript, JSON to Zod schemas, CSS to Tailwind, HTML to JSX, and 13+ more converters. No signup required.",
  authors: [{ name: "SnipShift" }],
  keywords: [
    "developer tools",
    "code converter",
    "javascript to typescript",
    "json to zod",
    "css to tailwind",
    "html to jsx",
    "online converter",
    "free developer tools",
  ],
  openGraph: {
    type: "website",
    siteName: "SnipShift",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "SnipShift  Free Online Developer Converter Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head>
        {/* Theme initialization  prevents flash of wrong theme */}
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('snipshift-theme');if(!t){t=localStorage.getItem('devshift-theme')||localStorage.getItem('typeshift-theme');if(t){localStorage.setItem('snipshift-theme',t);localStorage.removeItem('devshift-theme');localStorage.removeItem('typeshift-theme');}}if(t==='light')document.documentElement.classList.remove('dark');else if(t==='dark'||!t)document.documentElement.classList.add('dark');else if(window.matchMedia('(prefers-color-scheme:light)').matches)document.documentElement.classList.remove('dark');}catch(e){}`,
          }}
        />
      </head>
      <body
        className="min-h-full flex flex-col"
        style={{
          background: 'var(--background)',
          color: 'var(--foreground)',
        }}
      >
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8R0CX5P7NB"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-8R0CX5P7NB');
          `}
        </Script>
        <ThemeProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
