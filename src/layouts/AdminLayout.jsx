import { Outlet } from "react-router";
import AdminNavbar from "../components/AdminNavbar";
import { RefreshCw } from "lucide-react";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="pt-20 lg:pt-8 lg:ml-64 p-4 lg:p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
