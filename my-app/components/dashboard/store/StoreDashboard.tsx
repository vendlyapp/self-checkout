import StoreHeaderCard from "@/components/dashboard/store/StoreHeaderCard";
import PlanCard from "@/components/dashboard/store/PlanCard";
import ServiceCard from "@/components/dashboard/store/ServiceCard";
import SystemSettingsList from "@/components/dashboard/store/SystemSettingsList";
import ContactCard from "@/components/dashboard/store/ContactCard";
import { SearchInput } from "@/components/ui/search-input";
import { User, Percent, QrCode, CreditCard } from "lucide-react";

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
    <div className="p-4 space-y-6">
      {/* Header Card */}
      <StoreHeaderCard />

      {/* Search Bar */}
      <div>
        <SearchInput placeholder="Einstellungen durchsuchen..." esHome={false} />
      </div>

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
);

export default StoreDashboard;
