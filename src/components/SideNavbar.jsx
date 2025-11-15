import { Atom } from "lucide-react";
import { NavLink, useNavigate} from "react-router";
import { supabase } from "../supabaseClient";

const SideNavbar = () => {
  const navigate = useNavigate();
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error){
      console.error("Error signing out:", error.message);
    }else{
      navigate("/login");
    }
  }
  return <div className="max-w-25 min-w-25 bg-gray-200 border-r-4 border-gray-900 flex flex-col items-center justify-between">
    <div className="flex flex-col items-center mt-8">
      <Atom className="size-10 mb-8" />
      <nav className="flex flex-col font-bold font-mono text-base-content space-y-8 items-center rounded-4xl ">
        <NavLink to="/home">
          <button className="hover:font-semibold">Home</button>
        </NavLink>
        <NavLink to="/projects" >
          <button className="hover:font-semibold text-sm px-1">Projects</button>
        </NavLink>
        <NavLink to="/gallery">
          <button className="hover:font-semibold">Gallery</button>
        </NavLink>
        <NavLink to="/blocks">
          <button className="hover:font-semibold">Blocks</button>
        </NavLink>
      </nav>
    </div>
    <button onClick={handleSignOut} className="px-2 py-2 mb-8 bg-fuchsia-900 text-red-200 border-3 border-black rounded-lg drop-shadow-[-2px_2px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:translate-x-1 hover:drop-shadow-[-4px_4px_0px_rgba(0,0,0,1)] hover:bg-fuschia-950 hover:scale-105 transition-transform cursor-pointer">Logout</button>
  </div>;
};

export default SideNavbar;
