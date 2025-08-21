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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        {/* Container principal adaptativo */}
        <div className="mx-auto h-full w-full max-w-[430px] min-h-screen relative bg-[#F2EDE8] shadow-xl sm:border-x sm:border-gray-200 overflow-hidden">
          {/* Contenedor interno con scroll controlado */}
          <div className="h-full w-full overflow-y-auto overflow-x-hidden">
            {children}
          </div>
        </div>

        {/* Toast notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              maxWidth: "380px",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
