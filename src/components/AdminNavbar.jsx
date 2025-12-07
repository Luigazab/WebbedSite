import { Award, BlocksIcon, BookOpen, FileText, Menu, TrendingUp, Users, X } from "lucide-react";
import { useState } from "react";
import {NavLink, useNavigate} from "react-router";
import { supabase } from "../supabaseClient";

const navItems = [
  { to: "/overview", icon: TrendingUp, label: "Overview" },
  { to: "/users", icon: Users, label: "Users" },
  { to: "/projects-manage", icon: FileText, label: "Projects" },
  { to: "/tutorials-manage", icon: BookOpen, label: "Tutorials" },
  { to: "/badges-manage", icon: Award, label: "Badges" },
  { to: "/blocks-manage", icon: BlocksIcon, label: "Blocks" },
];

const AdminNavbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error){
      console.error("Error signing out:", error.message);
    }else{
      navigate("/");
    }
  };


  return (
    <>
    <div className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-10">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-blue-600">WebbedSite</h1>
        <p className="text-sm text-gray-600">Admin Dashboard</p>
      </div>
      <nav className="p-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 adminButton">
                <item.icon size={20}/>
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
          <li><button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 adminButton">Sign Out</button></li>
        </ul>
      </nav>
    </div>
    <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white shadow-md z-20 flex items-center justify-between px-4">
      <h1 className="text-xl font-bold text-blue-600">WebbedSite</h1>
      <button onClick={toggleMenu} className="p-2">
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </header>
    {isMenuOpen && (
        <nav className="lg:hidden fixed top-16 left-0 right-0 bottom-0 bg-white shadow-xl z-10 p-4 overflow-y-auto">
          <ul>
            {navItems.map((item) => (
              <li key={item.to} onClick={toggleMenu}>
                <NavLink
                  to={item.to}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 text-gray-700 hover:bg-gray-100"
                >
                  <item.icon size={20} />
                  <span className="font-medium text-lg">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
};

export default AdminNavbar;
