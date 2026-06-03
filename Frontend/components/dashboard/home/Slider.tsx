"use client";

import Link from "next/link";
import {
  Users,
  Flame,
  Receipt,
  Tag,
  Calculator,
  ShoppingCart,
  BarChart3,
  Settings,
  Package,
  TrendingUp,
} from "lucide-react";

const sliderData = [
  { icon: Users,       text: "Kunden",       description: "Kundenverwaltung",    route: "/store/customers" },
  { icon: Flame,       text: "Bestseller",   description: "Top Produkte",         route: "/sales/bestseller" },
  { icon: Receipt,     text: "Verkäufe",     description: "Verkaufsübersicht",    route: "/sales/verkaufe" },
  { icon: Tag,         text: "Rabatte",      description: "Aktionen & Rabatte",   route: "/store/discounts" },
  { icon: Calculator,  text: "Rechner",      description: "Preisrechner",         route: "/charge" },
  { icon: ShoppingCart,text: "Warenkorb",    description: "Kassenverwaltung",     route: "/charge" },
  { icon: BarChart3,   text: "Analytics",    description: "Datenanalyse",         route: "/sales" },
  { icon: Settings,    text: "Einstellungen",description: "Systemeinstellungen",  route: "/store/settings" },
  { icon: Package,     text: "Produkte",     description: "Produktverwaltung",    route: "/products" },
  { icon: TrendingUp,  text: "Berichte",     description: "Verkaufsberichte",     route: "/sales/invoices" },
];

export default function Slider() {
  return (
    <div className="w-full">
      {/* Móvil: scroll horizontal sin JS */}
      <div className="block md:hidden">
        <div
          className="flex gap-1 overflow-x-auto no-scrollbar snap-x snap-mandatory"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {sliderData.map((item) => (
            <Link
              key={item.route + item.text}
              href={item.route}
              prefetch
              className="dashboard-tap-target snap-start flex-shrink-0 bg-white rounded-2xl p-3 transition-transform active:scale-95 w-[87px] h-[112px] relative z-[1]"
              aria-label={`Navigiere zu ${item.text}`}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className="bg-brand-500 p-2 rounded-xl shadow-sm w-[48px] h-[48px] flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-[11px] font-normal text-gray-900 text-center leading-tight">
                  {item.text}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Tablet + Desktop: grid */}
      <div className="hidden md:block">
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {sliderData.map((item) => (
            <Link
              key={item.route + item.text}
              href={item.route}
              prefetch
              className="dashboard-tap-target group bg-white rounded-xl p-3 md:p-4 hover:shadow-md hover:scale-[1.02] active:scale-95 border border-gray-100 hover:border-gray-200 transition-transform duration-100 relative z-[1]"
              aria-label={`Navigiere zu ${item.text}`}
            >
              <div className="flex items-start gap-3">
                <div className="bg-brand-500 p-2.5 rounded-lg shadow-sm flex-shrink-0 group-hover:shadow-md transition-shadow">
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm group-hover:text-gray-700 transition-colors">
                    {item.text}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
