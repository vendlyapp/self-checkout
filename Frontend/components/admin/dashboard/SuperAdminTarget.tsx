"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { MoreVertical, TrendingUp, TrendingDown } from "lucide-react";
import { DropdownItem } from "@/components/admin/ui/DropdownItem";
import { useState } from "react";
import { Dropdown } from "@/components/admin/ui/Dropdown";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface SuperAdminTargetProps {
  targetPercentage?: number;
  currentRevenue?: number;
  targetRevenue?: number;
  growth?: number;
}

export default function SuperAdminTarget({
  targetPercentage = 75.55,
  currentRevenue = 15000,
  targetRevenue = 20000,
  growth = 10,
}: SuperAdminTargetProps) {
  const series = [targetPercentage];
  const isPositive = growth >= 0;

  const options: ApexOptions = {
    colors: ["#25d076"], // Brand verde para SuperAdmin
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: {
          size: "80%",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: function (val) {
              return parseFloat(val.toFixed(2)) + "%";
            },
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: ["#25d076"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Fortschritt"],
  };

  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  return (
    <div className="h-full flex flex-col rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex-1 flex flex-col px-5 pt-5 pb-6 bg-white shadow-sm rounded-2xl dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Monatliches Ziel
            </h3>
            <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
              Umsatzziel für diesen Monat
            </p>
          </div>
          <div className="relative inline-block">
            <button onClick={toggleDropdown} className="dropdown-toggle cursor-pointer">
              <MoreVertical className="w-5 h-5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
            </button>
            <Dropdown
              isOpen={isOpen}
              onClose={closeDropdown}
              className="w-40 p-2"
            >
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Mehr anzeigen
              </DropdownItem>
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Konfigurieren
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
        <div className="relative flex-1 flex items-center justify-center">
          <div className="w-full max-h-[330px]">
            <ReactApexChart
              options={options}
              series={series}
              type="radialBar"
              height={330}
            />
          </div>

          <span
            className={`absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full px-3 py-1 text-xs font-medium ${
              isPositive
                ? "bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-500"
                : "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-500"
            }`}
          >
            {isPositive ? "+" : ""}
            {typeof growth === 'number' ? parseFloat(growth.toFixed(2)) : growth}%
          </span>
        </div>
        <p className="mx-auto mt-8 w-full max-w-[380px] text-center text-sm text-gray-500 dark:text-gray-400 sm:text-base">
          Sie haben CHF {currentRevenue.toLocaleString()} diesen Monat verdient,{" "}
          {isPositive ? "höher" : "niedriger"} als im Vormonat.{" "}
          {isPositive ? "Weiter so!" : "Lass uns verbessern!"}
        </p>
      </div>

      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5 flex-shrink-0">
        <div>
          <p className="mb-1 text-center text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            Ziel
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            CHF {targetRevenue.toLocaleString()}
          </p>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            Aktuell
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            CHF {currentRevenue.toLocaleString()}
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
          </p>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            Wachstum
          </p>
          <p
            className={`flex items-center justify-center gap-1 text-base font-semibold sm:text-lg ${
              isPositive
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {isPositive ? "+" : ""}
            {typeof growth === 'number' ? parseFloat(growth.toFixed(2)) : growth}%
          </p>
        </div>
      </div>
    </div>
  );
}

