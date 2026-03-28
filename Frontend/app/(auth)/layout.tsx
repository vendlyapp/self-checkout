import type { ReactNode } from "react";

/** Scroll propio: el layout raíz ya no hace overflow-y en toda la app (headers fijos en dashboard/store). */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col min-h-0 w-full overflow-y-auto overflow-x-hidden">
      {children}
    </div>
  );
}
