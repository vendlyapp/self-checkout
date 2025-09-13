import {
  Building2,
  Printer,
  User,
  Download,
  Bell,
  HelpCircle,
} from "lucide-react";
import NavigationItem from "@/components/ui/NavigationItem";

const settings = [
  {
    icon: <Building2 className="w-5 h-5" />,
    title: "Geschäftsdaten",
    subtitle: "bearbeiten",
  },
  {
    icon: <Printer className="w-5 h-5" />,
    title: "POS-Drucker",
    subtitle: "einrichten",
  },
  {
    icon: <User className="w-5 h-5" />,
    title: "Mein Profil",
    subtitle: "Einstellungen",
  },
  {
    icon: <Download className="w-5 h-5" />,
    title: "Backups",
    subtitle: "Sicherheitskopien verwalten",
  },
  {
    icon: <Bell className="w-5 h-5" />,
    title: "Benachrichtigungen",
    subtitle: "System-Alerts",
  },
  {
    icon: <HelpCircle className="w-5 h-5" />,
    title: "Hilfe & FAQ",
    subtitle: "Support und Tutorials",
  },
];

const SystemSettingsList = () => (
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
          />
        </li>
      ))}
    </ul>
  </div>
);

export default SystemSettingsList;
