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
  applicationName: "SelfCheckout",
  title: {
    default: "SelfCheckout",
    template: "%s · SelfCheckout",
  },
  description: "Digital checkout for Swiss farm shops",
  manifest: "/manifest.json",
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SelfCheckout",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
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
    <html lang="de" className="h-responsive min-h-0" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="theme-color" content="#25D076" />
      </head>
      <body
        className={`${inter.className} h-responsive flex flex-col min-h-0 antialiased tap-highlight-transparent`}
        suppressHydrationWarning
      >
        <QueryProvider>
          <AuthProvider>
            <UserProvider>
              {/* Un solo flex column bajo body: evita hermanos sueltos y asegura flex-1 */}
              <div className="flex flex-1 flex-col min-h-0 w-full">
                <SessionTimeoutManager />
                {/* Sin overflow-y global: scroll en main (AdminLayout / store) o layouts dedicados */}
                <div className="flex flex-1 flex-col min-h-0 w-full fixed inset-0 bg-[#25D076] overflow-hidden">
                  <div
                    className="flex flex-1 flex-col min-h-0 w-full overflow-hidden bg-[#F2EDE8]"
                    style={{
                      paddingTop: "env(safe-area-inset-top, 0px)",
                      paddingBottom: "env(safe-area-inset-bottom, 0px)",
                      paddingLeft: "env(safe-area-inset-left, 0px)",
                      paddingRight: "env(safe-area-inset-right, 0px)",
                    }}
                  >
                    {children}
                  </div>
                </div>
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
              </div>
            </UserProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
