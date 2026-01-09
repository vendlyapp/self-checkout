import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { UserProvider } from "@/lib/contexts/UserContext";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { SessionTimeoutManager } from "@/components/auth/SessionTimeoutManager";

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
  themeColor: "#25D076",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className="h-responsive" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="theme-color" content="#25D076" />
      </head>
      <body className={`${inter.className} h-responsive antialiased tap-highlight-transparent`} suppressHydrationWarning>
        <QueryProvider>
          <AuthProvider>
            <UserProvider>
              <SessionTimeoutManager />
              {/* Container principal responsive - fondo verde visible en safe areas de iPhone */}
              <div className="h-responsive w-full relative bg-[#25D076] overflow-hidden">
                {/* Contenedor interno responsive - fondo claro para el contenido con padding para safe areas */}
                <div 
                  className="h-responsive w-full overflow-y-auto overflow-x-hidden no-scrollbar bg-[#F2EDE8]" 
                  style={{
                    paddingTop: 'env(safe-area-inset-top, 0px)',
                    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                    paddingLeft: 'env(safe-area-inset-left, 0px)',
                    paddingRight: 'env(safe-area-inset-right, 0px)',
                  }}
                >
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
            </UserProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
