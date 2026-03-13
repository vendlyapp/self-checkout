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
    <div className="block lg:hidden bg-card rounded-2xl shadow-sm border border-border overflow-hidden p-4">
      <ul className="divide-y divide-border">
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

    <div className="hidden lg:block">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {settings.map((item) => (
          <div key={item.title} className="bg-muted/30 rounded-xl p-4 lg:p-5 border border-border hover:bg-muted/50 transition-ios">
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
