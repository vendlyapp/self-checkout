import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SelfCheckout",
  description: "Digital checkout for Swiss farm shops",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SelfCheckout",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#F2EDE8",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className="h-mobile">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="apple-touch-fullscreen" content="yes" />
      </head>
      <body className={`${inter.className} h-mobile antialiased tap-highlight-transparent`}>
        {/* Container principal para móviles iPhone */}
        <div className="mx-auto h-mobile w-full max-w-[430px] relative bg-[#F2EDE8] shadow-xl sm:border-x sm:border-gray-200 overflow-hidden safe-area-top safe-area-bottom">
          {/* Contenedor interno optimizado para iOS Safari */}
          <div className="h-mobile w-full overflow-y-auto overflow-x-hidden no-scrollbar">
            {children}
          </div>
        </div>

        {/* Toast notifications optimizadas para móvil */}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              maxWidth: "380px",
              fontSize: "14px",
              marginTop: "env(safe-area-inset-top, 0px)",
            },
          }}
        />
      </body>
    </html>
  );
}
