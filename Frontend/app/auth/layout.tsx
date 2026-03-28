import type { ReactNode } from "react";

/** Scroll propio para /auth/* (p. ej. callback) — mismo patrón que (auth)/login. */
export default function AuthCallbackLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col min-h-0 w-full overflow-y-auto overflow-x-hidden">
      {children}
    </div>
  );
}
