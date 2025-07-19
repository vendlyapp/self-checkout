import DashboardProductsList from "@/components/dashboard/products_list/DashboardProductsList";

export default function Products() {
  return (
    <div className="p-4 space-y-4">
      {/* Otros componentes del dashboard */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Bienvenido al panel de administración</p>
      </div>
      
      {/* Componente de productos con scroll interno */}
      <DashboardProductsList 
        maxHeight="500px"
        className="h-[500px]"
      />
      
      {/* Otros componentes que permanecen fijos */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Estadísticas</h2>
        <p className="text-gray-600 mt-2">Información adicional del dashboard</p>
      </div>
    </div>
  );
}
  