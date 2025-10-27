'use client';

import React, { useEffect, useState } from 'react';
import { Users, Search, User as UserIcon, Store, Shield, UserCheck, RefreshCw, Mail } from 'lucide-react';
import { useSuperAdminStore } from '@/lib/stores/superAdminStore';

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

  // Solo mostrar loader si está cargando Y no hay datos
  if (usersLoading && users.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {usersError}
        </div>
      </div>
    );
  }

  const getUserRoleBadge = (role: string) => {
    const badges = {
      'SUPER_ADMIN': { bg: 'bg-purple-100', text: 'text-purple-700', icon: Shield, label: 'Super Admin' },
      'ADMIN': { bg: 'bg-blue-100', text: 'text-blue-700', icon: Store, label: 'Admin' },
      'CUSTOMER': { bg: 'bg-green-100', text: 'text-green-700', icon: UserCheck, label: 'Cliente' },
  };
    return badges[role as keyof typeof badges] || badges['CUSTOMER'];
  };

  const roleCounts = {
    total: users.length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    customers: users.filter(u => u.role === 'CUSTOMER').length,
    superAdmins: users.filter(u => u.role === 'SUPER_ADMIN').length,
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-2">Administra todos los usuarios de la plataforma</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refreshAll()}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 w-full md:w-64"
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xl font-bold text-gray-900">{roleCounts.total}</p>
              <p className="text-xs text-gray-600">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-xl font-bold text-gray-900">{roleCounts.superAdmins}</p>
              <p className="text-xs text-gray-600">Super Admins</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-2">
            <Store className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-xl font-bold text-gray-900">{roleCounts.admins}</p>
              <p className="text-xs text-gray-600">Admins</p>
            </div>
          </div>
        </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-xl font-bold text-gray-900">{roleCounts.customers}</p>
              <p className="text-xs text-gray-600">Clientes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {['ALL', 'SUPER_ADMIN', 'ADMIN', 'CUSTOMER'].map((role) => (
          <button
            key={role}
            onClick={() => setFilterRole(role as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterRole === role
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {role === 'ALL' ? 'Todos' : role === 'SUPER_ADMIN' ? 'Super Admin' : role === 'ADMIN' ? 'Admins' : 'Clientes'}
          </button>
        ))}
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No se encontraron usuarios</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tienda</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const badge = getUserRoleBadge(user.role);
                  const BadgeIcon = badge.icon;
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                            <UserIcon className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{user.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 text-gray-400 mr-2" />
                          <p className="text-gray-700">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                          <BadgeIcon className="w-3 h-3 mr-1" />
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.storeName ? (
                          <div>
                            <p className="text-gray-900 font-medium">{user.storeName}</p>
                            <p className="text-xs text-gray-500">{user.storeSlug}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
