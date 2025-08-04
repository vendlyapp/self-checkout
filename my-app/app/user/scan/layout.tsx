// app/user/scan/layout.tsx
import { ReactNode } from 'react';

export default function ScanLayout({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Full-screen scanner container */}
      <main className="h-full w-full">
        {children}
      </main>
    </div>
  );
}