import { Outlet } from "react-router";
import AdminNavbar from "../components/AdminNavbar";
import { RefreshCw } from "lucide-react";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="pt-20 lg:pt-8 lg:ml-64 p-4 lg:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            {/* ... your header content ... */}
            <h2 className="text-3xl font-bold text-gray-900 capitalize">Overview</h2>
            <p className="text-gray-600 mt-1">Manage this</p>
          </div>
          <button onClick={() => window.location.reload()} 
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
