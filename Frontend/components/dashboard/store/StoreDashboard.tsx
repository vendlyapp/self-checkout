import StoreHeaderCard from "@/components/dashboard/store/StoreHeaderCard";
import PlanCard from "@/components/dashboard/store/PlanCard";
import ServiceCard from "@/components/dashboard/store/ServiceCard";
import SystemSettingsList from "@/components/dashboard/store/SystemSettingsList";
import ContactCard from "@/components/dashboard/store/ContactCard";
import { SearchInput } from "@/components/ui/search-input";
import { User, Percent, QrCode, CreditCard, Store } from "lucide-react";
import Link from "next/link";

const services = [
  {
    icon: <User className="w-6 h-6" />,
    title: "Kunden",
    subtitle: "verwalten",
  },
  {
    icon: <Percent className="w-6 h-6" />,
    title: "Rabatte & Codes",
    subtitle: "verwalten",
  },
  {
    icon: <QrCode className="w-6 h-6" />,
    title: "QR- & Barcodes",
    subtitle: "verwalten",
  },
  {
    icon: <CreditCard className="w-6 h-6" />,
    title: "Zahlungsarten",
    subtitle: "verwalten",
  },
];

const StoreDashboard = () => (
  <div className="w-full">
    {/* ===== MOBILE LAYOUT ===== */}
    <div className="block lg:hidden">
      <div className="p-4 space-y-6">
       

        {/* Header Card */}
        <StoreHeaderCard />

        {/* Search Bar */}
        <div>
          <SearchInput placeholder="Einstellungen durchsuchen..." esHome={false} />
        </div>

         {/* Mi Tienda Card */}
         <Link href="/store/settings" className="block">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                <Store className="w-8 h-8 text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Mi Tienda</h3>
                <p className="text-sm text-gray-500">Personaliza la información de tu tienda</p>
              </div>
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>

        {/* Plan Card */}
        <PlanCard />

        {/* Services */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3">Services:</h2>
          <div className="grid grid-cols-2 gap-4">
            {services.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </div>
        </div>

        {/* System Settings List */}
        <div>
          <SystemSettingsList />
        </div>

        {/* Contact Card */}
        <ContactCard />

        {/* Footer */}
        <p className="text-[12px] font-regular text-[#6E7996] text-center pt-4">
          Version 1.02.2 • Self-Checkout • 29.6.2025
        </p>
      </div>
    </div>

    {/* ===== DESKTOP LAYOUT ===== */}
    <div className="hidden lg:block">
      <div className="p-6 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Geschäftseinstellungen</h1>
            <p className="text-gray-600 mt-1">Verwalten Sie Ihre Geschäftseinstellungen und Services</p>
          </div>
          <div className="w-full lg:w-[500px]">
            <SearchInput placeholder="Einstellungen durchsuchen..." esHome={false} />
          </div>
        </div>

        {/* Mi Tienda Card */}
        <Link href="/store/settings" className="block">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                <Store className="w-10 h-10 text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">Mi Tienda</h3>
                <p className="text-base text-gray-500">Personaliza la información de tu tienda</p>
              </div>
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>

        {/* Top Row: Header Card & Plan Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <StoreHeaderCard />
          </div>
          <div className="rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <PlanCard />
          </div>
        </div>

        {/* Services Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Services</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Systemeinstellungen</h2>
          <SystemSettingsList />
        </div>

        {/* Contact & Footer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white rounded-xl p-6 shadow-sm border border-gray-200">

            <ContactCard />
          <div className="flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">System Information</h3>
              <p className="text-sm text-gray-600 mb-2">Version 1.02.2</p>
              <p className="text-sm text-gray-600 mb-2">Self-Checkout</p>
              <p className="text-sm text-gray-600">29.6.2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default StoreDashboard;
