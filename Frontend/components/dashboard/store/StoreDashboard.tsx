import StoreHeaderCard from "@/components/dashboard/store/StoreHeaderCard";
import PlanCard from "@/components/dashboard/store/PlanCard";
import ServiceCard from "@/components/dashboard/store/ServiceCard";
import SystemSettingsList from "@/components/dashboard/store/SystemSettingsList";
import ContactCard from "@/components/dashboard/store/ContactCard";
import { SearchInput } from "@/components/ui/search-input";
import { User, Percent, QrCode, CreditCard, Store, ChevronRight } from "lucide-react";
import Link from "next/link";

const services = [
  {
    icon: <User className="w-6 h-6" />,
    title: "Kunden",
    subtitle: "verwalten",
    href: "/store/customers",
  },
  {
    icon: <Percent className="w-6 h-6" />,
    title: "Rabatte & Codes",
    subtitle: "verwalten",
    href: "/store/discounts",
  },
  {
    icon: <QrCode className="w-6 h-6" />,
    title: "QR- & Barcodes",
    subtitle: "verwalten",
    href: "/my-qr",
  },
  {
    icon: <CreditCard className="w-6 h-6" />,
    title: "Zahlungsarten",
    subtitle: "verwalten",
    href: "/store/payment-methods",
  },
];

const StoreDashboard = () => (
  <div className="w-full">
    {/* ===== MÓVIL (< 768px) ===== */}
    <div className="block md:hidden min-w-0">
      <div className="p-4 space-y-6">
        <StoreHeaderCard />

        <div className="w-full min-w-0">
          <SearchInput placeholder="Einstellungen durchsuchen..." esHome={false} className="w-full h-12 min-h-12" />
        </div>

        <Link href="/store/settings" className="block">
          <div className="bg-card rounded-2xl p-4 shadow-sm border border-border hover:shadow-md transition-ios">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-foreground mb-0.5">Mein Geschäft</h3>
                <p className="text-xs text-muted-foreground leading-snug">Personalisieren Sie die Informationen Ihres Geschäfts</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" aria-hidden />
            </div>
          </div>
        </Link>

        {/* Plan Card */}
        <PlanCard />

        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Dienste</h2>
          <div className="grid grid-cols-2 gap-3">
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

        <p className="text-xs text-muted-foreground text-center pt-4">
          Version 1.02.2 • Self-Checkout • 29.6.2025
        </p>
      </div>
    </div>

    {/* ===== TABLET + DESKTOP (≥ 768px) ===== */}
    <div className="hidden md:block min-w-0">
      <div className="p-4 md:px-6 md:pt-10 md:pb-6 lg:p-6 xl:p-8 space-y-5 md:space-y-6 lg:space-y-8 xl:space-y-10 max-w-[1600px]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-5 lg:gap-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl md:text-xl lg:text-2xl font-bold text-foreground tracking-tight">Geschäftseinstellungen</h1>
            <p className="text-muted-foreground mt-0.5 text-xs md:text-xs lg:text-sm">Verwalten Sie Ihre Geschäftseinstellungen und Services</p>
          </div>
          <div className="w-full md:w-[200px] lg:w-[280px] xl:w-[340px] flex-shrink-0">
            <SearchInput
              placeholder="Einstellungen durchsuchen..."
              esHome={false}
              className="w-full h-9 min-h-9 md:h-9 lg:h-11 lg:min-h-11"
              inputClassName="text-xs md:text-xs lg:text-sm placeholder:text-xs md:placeholder:text-xs lg:placeholder:text-sm"
            />
          </div>
        </div>

        <Link href="/store/settings" className="block">
          <div className="bg-card rounded-2xl p-4 shadow-sm border border-border hover:shadow-md transition-ios lg:p-5">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Store className="w-6 h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base lg:text-lg font-semibold text-foreground mb-0.5">Mein Geschäft</h3>
                <p className="text-xs lg:text-sm text-muted-foreground leading-snug">Personalisieren Sie die Informationen Ihres Geschäfts</p>
              </div>
              <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-muted-foreground flex-shrink-0" aria-hidden />
            </div>
          </div>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
          <StoreHeaderCard />
          <PlanCard />
        </div>

        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border lg:p-5">
          <h2 className="text-base lg:text-lg font-semibold text-foreground mb-3 lg:mb-4">Dienste</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-3 lg:gap-4">
            {services.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border lg:p-5">
          <h2 className="text-base lg:text-lg font-semibold text-foreground mb-3 lg:mb-4">Systemeinstellungen</h2>
          <SystemSettingsList />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
          <ContactCard />
          <div className="bg-card rounded-2xl p-4 shadow-sm border border-border flex items-center justify-center lg:p-5">
            <div className="text-center">
              <h3 className="text-sm lg:text-base font-semibold text-foreground mb-1 lg:mb-1.5">Systeminformationen</h3>
              <p className="text-[11px] lg:text-xs text-muted-foreground mb-0.5">Version 1.02.2</p>
              <p className="text-[11px] lg:text-xs text-muted-foreground mb-0.5">Self-Checkout</p>
              <p className="text-[11px] lg:text-xs text-muted-foreground">29.6.2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default StoreDashboard;
