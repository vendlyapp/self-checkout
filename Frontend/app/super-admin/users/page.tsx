'use client';

import React, { useEffect, useState } from 'react';
import { Users, Search, User as UserIcon, Store, Shield, UserCheck, RefreshCw, Mail, Calendar, MapPin } from 'lucide-react';
import { useSuperAdminStore } from '@/lib/stores/superAdminStore';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/News/table";

export default function SuperAdminUsers() {
  const { 
    users, 
    usersLoading, 
    usersError, 
    fetchUsers,
    refreshAll
  } = useSuperAdminStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'ADMIN' | 'CUSTOMER' | 'SUPER_ADMIN'>('ALL');

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users
    .filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = filterRole === 'ALL' || user.role === filterRole;
      
      return matchesSearch && matchesRole;
    });

  // Nur Loader anzeigen, wenn geladen wird UND keine Daten vorhanden sind
  if (usersLoading && users.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-500 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Benutzer werden geladen...</p>
        </div>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl dark:bg-red-500/15 dark:border-red-500/50 dark:text-red-400">
          {usersError}
        </div>
      </div>
    );
  }

  const getUserRoleBadge = (role: string) => {
    const badges = {
      'SUPER_ADMIN': { bg: 'bg-brand-50 dark:bg-brand-500/15', text: 'text-brand-700 dark:text-brand-400', icon: Shield, label: 'Super Admin' },
      'ADMIN': { bg: 'bg-blue-50 dark:bg-blue-500/15', text: 'text-blue-700 dark:text-blue-400', icon: Store, label: 'Admin' },
      'CUSTOMER': { bg: 'bg-green-50 dark:bg-green-500/15', text: 'text-green-700 dark:text-green-400', icon: UserCheck, label: 'Kunde' },
    };
    return badges[role as keyof typeof badges] || badges['CUSTOMER'];
  };

  const roleCounts = {
    total: users.length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    customers: users.filter(u => u.role === 'CUSTOMER').length,
    superAdmins: users.filter(u => u.role === 'SUPER_ADMIN').length,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-CH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white/90">Benutzerverwaltung</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Verwalten Sie alle Benutzer der Plattform</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Benutzer suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 w-full sm:w-64 dark:bg-gray-900 dark:border-gray-800 dark:text-white/90 dark:placeholder:text-gray-500"
            />
          </div>
          <button
            onClick={() => refreshAll()}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            title="Daten aktualisieren"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ============================================ */}
      {/* METRIKEN */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Benutzer insgesamt</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white/90">{roleCounts.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/15 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Super Admins</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white/90">{roleCounts.superAdmins}</p>
            </div>
            <div className="w-12 h-12 bg-brand-50 dark:bg-brand-500/15 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Admins</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white/90">{roleCounts.admins}</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 dark:bg-orange-500/15 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Kunden</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white/90">{roleCounts.customers}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 dark:bg-green-500/15 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* FILTER */}
      {/* ============================================ */}
      <div className="flex flex-wrap gap-2">
        {['ALL', 'SUPER_ADMIN', 'ADMIN', 'CUSTOMER'].map((role) => (
          <button
            key={role}
            onClick={() => setFilterRole(role as 'ALL' | 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              filterRole === role
                ? 'bg-brand-600 text-white dark:bg-brand-500 dark:text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
          >
            {role === 'ALL' ? 'Alle' : role === 'SUPER_ADMIN' ? 'Super Admin' : role === 'ADMIN' ? 'Admins' : 'Kunden'}
          </button>
        ))}
      </div>

      {/* ============================================ */}
      {/* BENUTZERTABELLE */}
      {/* ============================================ */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
          <Users className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Keine Benutzer gefunden</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            {searchTerm || filterRole !== 'ALL' ? 'Versuchen Sie andere Filter' : 'Keine Benutzer registriert'}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y bg-gray-50 dark:bg-gray-900/50">
                <TableRow>
                  <TableCell
                    isHeader
                    className="py-3 px-6 font-medium text-gray-700 dark:text-gray-300 text-start text-xs"
                  >
                    Benutzer
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 px-6 font-medium text-gray-700 dark:text-gray-300 text-start text-xs"
                  >
                    E-Mail
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 px-6 font-medium text-gray-700 dark:text-gray-300 text-start text-xs"
                  >
                    Rolle
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 px-6 font-medium text-gray-700 dark:text-gray-300 text-start text-xs"
                  >
                    Geschäft
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 px-6 font-medium text-gray-700 dark:text-gray-300 text-start text-xs"
                  >
                    Registrierungsdatum
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredUsers.map((user) => {
                  const badge = getUserRoleBadge(user.role);
                  const BadgeIcon = badge.icon;
                  return (
                    <TableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-brand-50 dark:bg-brand-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <UserIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white/90 text-sm">{user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">ID: {user.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300 text-sm">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                          <BadgeIcon className="w-3 h-3 mr-1.5" />
                          {badge.label}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        {user.storeName ? (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-gray-900 dark:text-white/90 font-medium text-sm">{user.storeName}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{user.storeSlug}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400 text-sm">{formatDate(user.createdAt)}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
