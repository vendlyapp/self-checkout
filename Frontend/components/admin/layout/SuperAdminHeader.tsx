"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSidebar } from "@/lib/contexts/SidebarContext";
import { useRouter } from "next/navigation";
import { LogOut, Bell, Search, Sun, Moon, Settings } from "lucide-react";
import { Dropdown } from "../ui/Dropdown";
import { DropdownItem } from "../ui/DropdownItem";
import { useTheme } from "@/lib/contexts/ThemeContext";
import { useAuth } from "@/lib/auth/AuthContext";
import { useUser } from "@/lib/contexts/UserContext";
import { toast } from "sonner";
import { clearAllSessionData } from "@/lib/utils/sessionUtils";

const SuperAdminHeader: React.FC = () => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const { signOut: signOutAuth } = useAuth();
  const { signOut: signOutUser, profile } = useUser();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    setIsUserMenuOpen(false);
    
    try {
      // Usar la utilidad centralizada para limpiar toda la sesión
      await clearAllSessionData();
      
      // También cerrar sesión en los contextos (por si acaso)
      try {
        await Promise.all([
          signOutAuth(),
          signOutUser()
        ]);
      } catch (contextError) {
        // Ignorar errores de contextos, ya que clearAllSessionData ya limpió todo
        console.warn('Error en contextos de logout (puede ignorarse):', contextError);
      }
      
      toast.success('Sesión cerrada correctamente');
      
      // Redirigir al login
      setTimeout(() => {
        router.push('/login');
        // Forzar recarga para asegurar limpieza completa
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }, 300);
      
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión. Redirigiendo...');
      
      // Forzar limpieza básica en caso de error
      try {
        await clearAllSessionData();
      } catch (clearError) {
        console.error('Error al forzar limpieza:', clearError);
        // Limpieza de emergencia
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
        }
      }
      
      // Redirigir de todas formas
      setTimeout(() => {
        window.location.href = '/login';
      }, 500);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const userName = profile?.name || (typeof window !== 'undefined' ? localStorage.getItem('userName') || 'Admin' : 'Admin');
  const userEmail = profile?.email || (typeof window !== 'undefined' ? localStorage.getItem('userEmail') || 'admin@vendly.com' : 'admin@vendly.com');

  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-99999 dark:border-gray-800 dark:bg-gray-900 lg:border-b">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          <button
            className="items-center justify-center w-10 h-10 text-gray-500 border-gray-200 rounded-lg z-99999 dark:border-gray-800 lg:flex dark:text-gray-400 lg:h-11 lg:w-11 lg:border cursor-pointer"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg
                width="16"
                height="12"
                viewBox="0 0 16 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>

          <div className="hidden lg:block">
            <form>
              <div className="relative">
                <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Buscar o presiona Cmd+K..."
                  className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400"
                >
                  <span>⌘</span>
                  <span>K</span>
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="flex items-center justify-between w-full gap-4 px-5 py-4 lg:flex lg:justify-end lg:px-0">
          <div className="flex items-center gap-2 2xsm:gap-3">
            <button
              onClick={toggleTheme}
              className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-900 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            <div className="relative">
              <button
                className="relative dropdown-toggle flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <Bell className="w-5 h-5" />
              </button>
              <Dropdown
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                className="absolute -right-[240px] mt-[17px] flex h-[400px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-800 dark:bg-gray-900 sm:w-[361px] lg:right-0"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
                  <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Notificaciones
                  </h5>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No hay notificaciones nuevas
                  </p>
                </div>
              </Dropdown>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center text-gray-700 dark:text-gray-400 dropdown-toggle cursor-pointer"
            >
              <span className="mr-3 overflow-hidden rounded-full h-10 w-10 bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
                <span className="text-brand-600 dark:text-brand-300 font-semibold text-base">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </span>
              <span className="hidden sm:block mr-1 font-medium text-sm text-gray-700 dark:text-gray-300">{userName}</span>
              <svg
                className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
                  isUserMenuOpen ? "rotate-180" : ""
                }`}
                width="18"
                height="20"
                viewBox="0 0 18 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <Dropdown
              isOpen={isUserMenuOpen}
              onClose={() => setIsUserMenuOpen(false)}
              className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-800 dark:bg-gray-900"
            >
              <div>
                <span className="block font-medium text-gray-700 text-sm dark:text-gray-400">
                  {userName}
                </span>
                <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                  {userEmail}
                </span>
              </div>

              <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
                <li>
                  <DropdownItem
                    onItemClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg text-sm hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 cursor-pointer"
                  >
                    <Settings className="w-5 h-5" />
                    Configuración
                  </DropdownItem>
                </li>
              </ul>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-red-600 rounded-lg text-sm hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoggingOut ? (
                  <>
                    <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Cerrando sesión...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-5 h-5" />
                    <span>Cerrar Sesión</span>
                  </>
                )}
              </button>
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SuperAdminHeader;

