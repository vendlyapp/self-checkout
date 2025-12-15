// app/user/scan/layout.tsx
import { ReactNode } from "react";

export default function ScanLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-full w-full overflow-hidden bg-background-cream flex flex-col items-center justify-center">
      <main>{children}</main>
    </div>
  );
}
