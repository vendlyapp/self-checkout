// app/user/scan/layout.tsx
import { ReactNode } from 'react';

export default function ScanLayout({ children }: { children: ReactNode }) {
  return (
    <div >
      {/* Full-screen scanner container */}
      <main >
        {children}
      </main>
    </div>
  );
}