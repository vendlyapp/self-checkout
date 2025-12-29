"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/News/table";
import Badge from "@/components/admin/ui/Badge";
import { Store, Package } from "lucide-react";
import Link from "next/link";

interface Order {
  id: string;
  storeName: string;
  total: number;
  items: number;
  status: "completed" | "pending" | "cancelled";
  date: string;
}

interface SuperAdminRecentOrdersProps {
  orders?: Order[];
}

export default function SuperAdminRecentOrders({ orders }: SuperAdminRecentOrdersProps) {
  // Beispieldaten wenn keine echten Bestellungen vorhanden sind
  const defaultOrders: Order[] = [
    {
      id: "1",
      storeName: "Beispielgeschäft 1",
      total: 1250.50,
      items: 5,
      status: "completed",
      date: "2024-01-15",
    },
    {
      id: "2",
      storeName: "Beispielgeschäft 2",
      total: 890.25,
      items: 3,
      status: "pending",
      date: "2024-01-14",
    },
    {
      id: "3",
      storeName: "Beispielgeschäft 3",
      total: 2340.75,
      items: 8,
      status: "completed",
      date: "2024-01-13",
    },
    {
      id: "4",
      storeName: "Beispielgeschäft 4",
      total: 567.00,
      items: 2,
      status: "cancelled",
      date: "2024-01-12",
    },
    {
      id: "5",
      storeName: "Beispielgeschäft 5",
      total: 1890.00,
      items: 12,
      status: "completed",
      date: "2024-01-11",
    },
  ];

  const displayOrders = orders && orders.length > 0 ? orders : defaultOrders;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge color="success">Abgeschlossen</Badge>;
      case "pending":
        return <Badge color="warning">Ausstehend</Badge>;
      case "cancelled":
        return <Badge color="error">Storniert</Badge>;
      default:
        return <Badge color="light">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("de-CH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Letzte Bestellungen
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Letzte Transaktionen der Plattform
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/super-admin/analytics"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 cursor-pointer"
          >
            Alle anzeigen
          </Link>
        </div>
      </div>

      <div className="flex-1 max-w-full overflow-x-auto overflow-y-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                Geschäft
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                Produkte
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                Gesamt
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                Datum
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {displayOrders.map((order) => (
              <TableRow key={order.id} className="">
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-brand-100 dark:bg-brand-500/20 rounded-lg flex items-center justify-center">
                      <Store className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm dark:text-white/90">
                        {order.storeName}
                      </p>
                      <span className="text-gray-500 text-xs dark:text-gray-400">
                        ID: {order.id}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-800 text-sm dark:text-gray-300">
                      {order.items}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-gray-800 text-sm font-medium dark:text-white/90">
                  CHF {order.total.toFixed(2)}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                  {formatDate(order.date)}
                </TableCell>
                <TableCell className="py-3">
                  {getStatusBadge(order.status)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

