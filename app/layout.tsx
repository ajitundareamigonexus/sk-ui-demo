import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingButtons from '@/components/FloatingButtons';
import { Toaster } from "sonner";
import { Caveat } from 'next/font/google';

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-caveat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Shree Krushna Travels',
    default: 'Shree Krushna Travels - Premium Cab & Car Rental Services',
  },
  description: 'Book premium, safe, and reliable cab rental services across Mumbai, Pune, Nashik and major cities. Best rates for airport transfers, one-way trips, outstation, and local rides.',
  keywords: ['car rental', 'cab booking', 'mumbai to pune cab', 'pune to mumbai cab', 'outstation cab', 'airport taxi mumbai', 'airport taxi pune', 'Shree Krushna Travels'],
  authors: [{ name: 'Shree Krushna Travels' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Shree Krushna Travels - Premium Cab & Car Rental Services',
    description: 'Book premium, safe, and reliable cab rental services across Mumbai, Pune, Nashik and major cities.',
    url: 'http://localhost:3000',
    siteName: 'Shree Krushna Travels',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Shree Krushna Travels Premium Fleet',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shree Krushna Travels - Premium Cab & Car Rental Services',
    description: 'Book premium, safe, and reliable cab rental services across Mumbai, Pune, Nashik and major cities.',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`h-full antialiased ${caveat.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  if (saved === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full bg-background text-foreground overflow-x-hidden">
        <Toaster
          position="top-right"
          richColors
          closeButton
        />
        <Navbar />
        {children}
        <Footer />
        <FloatingButtons />
      </body>
    </html>
  );
}
