import {
  Building2,
  Printer,
  User,
  Download,
  Bell,
  HelpCircle,
  QrCode,
} from "lucide-react";
import NavigationItem from "@/components/ui/NavigationItem";

const settings = [
  {
    icon: <QrCode className="w-5 h-5" />,
    title: "Mein QR-Code",
    subtitle: "QR verwalten & teilen",
    href: "/my-qr",
  },
  {
    icon: <Building2 className="w-5 h-5" />,
    title: "Geschäftsdaten",
    subtitle: "bearbeiten",
    href: "/store/settings",
  },
  {
    icon: <Printer className="w-5 h-5" />,
    title: "POS-Drucker",
    subtitle: "einrichten",
    href: "/store/printer",
  },
  {
    icon: <User className="w-5 h-5" />,
    title: "Mein Profil",
    subtitle: "Einstellungen",
    href: "/store/profile",
  },
  {
    icon: <Download className="w-5 h-5" />,
    title: "Backups",
    subtitle: "Sicherheitskopien verwalten",
    href: "/store/backups",
  },
  {
    icon: <Bell className="w-5 h-5" />,
    title: "Benachrichtigungen",
    subtitle: "System-Alerts",
    href: "/store/notifications",
  },
  {
    icon: <HelpCircle className="w-5 h-5" />,
    title: "Hilfe & FAQ",
    subtitle: "Support und Tutorials",
    href: "/store/help",
  },
];

const SystemSettingsList = () => (
  <div className="w-full">
    {/* Mobile Layout */}
    <div className="block lg:hidden">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 pt-4 pb-4 mb-5">
        <h3 className="font-semibold text-gray-900 mb-3">System-Einstellungen</h3>
        <ul className="divide-y divide-gray-100">
          {settings.map((item) => (
            <li key={item.title}>
              <NavigationItem
                icon={item.icon}
                title={item.title}
                subtitle={item.subtitle}
                showArrow
                href={item.href}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>

    {/* Desktop Layout - Grid de 2 columnas */}
    <div className="hidden lg:block">
      <h3 className="font-semibold text-gray-900 mb-4 lg:mb-6 text-lg lg:text-xl">System-Einstellungen</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {settings.map((item) => (
          <div key={item.title} className="bg-white rounded-xl p-4 lg:p-5 shadow-sm border border-gray-200 hover:shadow-md transition-ios">
            <NavigationItem
              icon={item.icon}
              title={item.title}
              subtitle={item.subtitle}
              showArrow
              href={item.href}
            />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default SystemSettingsList;
