// app/user/scan/layout.tsx
import { ReactNode } from 'react';

export default function ScanLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-full w-full overflow-hidden bg-[#191F2D]">
      {/* Full-screen scanner container */}
      <main className="h-full w-full relative">
        {children}
      </main>
    </div>
  );
}