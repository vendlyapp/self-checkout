// app/user/scan/layout.tsx
import { ReactNode } from 'react';

export default function ScanLayout({ children }: { children: ReactNode }) {
  return (
    <div className="z-10 fixed inset-0 bg-black overflow-hidden">
      {/* Full-screen scanner container */}
      <main className="h-full w-full z-10">
        {children}
      </main>
    </div>
  );
}