import type { Metadata } from "next";
import { headers } from "next/headers";
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
  metadataBase: new URL("https://devshift.dev"),
  title: {
    template: "%s | DevShift — Free Developer Tools",
    default:
      "DevShift — Free Online Developer Converter Tools | JS to TS, JSON to Zod, CSS to Tailwind & More",
  },
  description:
    "Free developer tools to convert code instantly. JS/JSX to TypeScript, JSON to Zod schemas, CSS to Tailwind, HTML to JSX, and 13+ more converters. No signup required.",
  authors: [{ name: "DevShift" }],
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
    siteName: "DevShift",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "DevShift — Free Online Developer Converter Tools",
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
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%23d4a844'/><text x='16' y='22' text-anchor='middle' fill='%230c0f14' font-family='monospace' font-weight='bold' font-size='16'>D</text></svg>",
        type: "image/svg+xml",
      },
    ],
  },
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
        {/* Theme initialization — prevents flash of wrong theme */}
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('devshift-theme');if(!t){t=localStorage.getItem('typeshift-theme');if(t){localStorage.setItem('devshift-theme',t);localStorage.removeItem('typeshift-theme');}}if(t==='light')document.documentElement.classList.remove('dark');else if(t==='dark'||!t)document.documentElement.classList.add('dark');else if(window.matchMedia('(prefers-color-scheme:light)').matches)document.documentElement.classList.remove('dark');}catch(e){}`,
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
        <ThemeProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
