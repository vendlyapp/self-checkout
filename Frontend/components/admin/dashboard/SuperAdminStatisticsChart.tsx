"use client";
import React from "react";
import { ApexOptions } from "apexcharts";
import ChartTab from "./ChartTab";
import dynamic from "next/dynamic";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface SuperAdminStatisticsChartProps {
  salesData?: number[];
  revenueData?: number[];
}

export default function SuperAdminStatisticsChart({ 
  salesData, 
  revenueData 
}: SuperAdminStatisticsChartProps) {
  // Standarddaten
  const defaultSalesData = [180, 190, 170, 160, 175, 165, 170, 205, 230, 210, 240, 235];
  const defaultRevenueData = [40, 30, 50, 40, 55, 40, 70, 100, 110, 120, 150, 140];
  
  const sales = salesData || defaultSalesData;
  const revenue = revenueData || defaultRevenueData;

  const options: ApexOptions = {
    legend: {
      show: false,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#25d076", "#22c57f"], // Brand verde tones para SuperAdmin
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line",
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "straight",
      width: [2, 2],
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      x: {
        format: "dd MMM yyyy",
      },
      y: {
        formatter: (val: number) => `CHF ${val}`,
      },
    },
    xaxis: {
      type: "category",
      categories: [
        "Jan",
        "Feb",
        "Mär",
        "Apr",
        "Mai",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Okt",
        "Nov",
        "Dez",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
        formatter: (val: number) => `CHF ${val}`,
      },
      title: {
        text: "",
        style: {
          fontSize: "0px",
        },
      },
    },
  };

  const series = [
    {
      name: "Verkäufe",
      data: sales,
    },
    {
      name: "Umsatz",
      data: revenue,
    },
  ];

  return (
    <div className="h-full flex flex-col rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:justify-between sm:mb-5">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Plattformstatistiken
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Trends für monatliche Verkäufe und Umsatz
          </p>
        </div>
        <div className="flex items-start gap-3 sm:justify-end">
          <ChartTab />
        </div>
      </div>

      <div className="flex-1 flex items-center max-w-full overflow-x-auto custom-scrollbar pb-5">
        <div className="min-w-[1000px] xl:min-w-full w-full">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={310}
          />
        </div>
      </div>
    </div>
  );
}

