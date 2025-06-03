import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { SessionTimeoutWarning } from "@/components/providers/SessionTimeoutWarning";
import { Toaster } from "sonner";

// Optimize font loading with display swap for better performance
const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "Random Name Finder – Instantly Generate Unique Names",
    template: "%s | Random Name Finder"
  },
  description: "Generate AI-powered names for brands, pets, fantasy characters, and more with just one click. Free name generation tools for every need.",
  keywords: ["name generator", "random names", "brand names", "business names", "pet names", "fantasy names", "AI names"],
  authors: [{ name: "Random Name Finder Team" }],
  creator: "Random Name Finder",
  publisher: "Random Name Finder",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://randomnamefinder.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Random Name Finder – Instantly Generate Unique Names",
    description: "Generate AI-powered names for brands, pets, fantasy characters, and more with just one click.",
    url: "https://randomnamefinder.com",
    siteName: "Random Name Finder",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://randomnamefinder.com/api/og?title=Random%20Name%20Finder&subtitle=Generate%20AI-powered%20names%20instantly",
        width: 1200,
        height: 630,
        alt: "Random Name Finder - AI-powered name generation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Random Name Finder",
    description: "Find the perfect name for anything in seconds with AI.",
    images: ["https://randomnamefinder.com/api/og?title=Random%20Name%20Finder&subtitle=Generate%20AI-powered%20names%20instantly"],
    creator: "@randomnamefinder",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  other: {
    "msapplication-config": "/browserconfig.xml",
    // Google Site Verification
    "google-site-verification": "A_mmg6zHmq9LBmDtyPBwNR4YP50Wc3Agp13886wdlXc",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Organization JSON-LD structured data
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Random Name Finder",
    "url": "https://randomnamefinder.com",
    "logo": "https://randomnamefinder.com/favicon-32x32.png",
    "description": "AI-powered name generation tools for brands, pets, fantasy characters, and more",
    "foundingDate": "2024",
    "sameAs": [
      "https://twitter.com/randomnamefinder"
    ]
  };

  // Website JSON-LD structured data
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Random Name Finder",
    "url": "https://randomnamefinder.com",
    "description": "Generate AI-powered names for brands, pets, fantasy characters, and more with just one click",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://randomnamefinder.com/tools?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Preconnect to Google Analytics and AdSense domains */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://googleads.g.doubleclick.net" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://adtrafficquality.google" />
        
        {/* DNS prefetch for additional performance */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* Additional favicon references */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        {/* Theme color for browsers */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        {/* Skip to content link for screen readers */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Skip to content
        </a>
        
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main id="main-content" className="flex-grow pt-16">{children}</main>
            <Footer />
            <Toaster richColors position="top-right" />
            <SessionTimeoutWarning />
          </AuthProvider>
        </ThemeProvider>

        {/* Google Analytics - Load early for better data collection */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-RZQV3VEZ6N"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-RZQV3VEZ6N', {
              page_title: document.title,
              page_location: window.location.href,
            });
          `}
        </Script>

        {/* Google AdSense - Load with lazy strategy for performance */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8899111851490905"
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
      </body>
    </html>
  );
}
