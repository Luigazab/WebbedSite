import { useNavigate, NavLink } from "react-router";
import { Atom } from "lucide-react";
import { Divider } from "./Divider";

const TopNavbar = () => {
  const navigate = useNavigate();

  return( 
  <div>
    <div className="sticky top-0 z-50 flex items-center justify-between mx-4 py-3 shadow-md">
      <div className="flex items-center">
        <img src="/logo.png" alt="Logo" className="w-15" />
        <h1 className="text-2xl font-bold">WebbedSite</h1>
      </div>
      <div className="flex-1 w-full text-slate-700 bg-slate-200 rounded-full mx-64 shadow-[inset_4px_2px_4px_rgba(0,0,0,0.1)]">
        <ul className="flex font-bold text-xl">
          <li className="flex-1"><NavLink className="topActive hover:text-slate-950 flex items-center justify-center hover:shadow-lg hover:bg-white rounded-full px-4 py-2 transition-all duration-300" to="/guest/editor">Try Now</NavLink></li>
          <li className="flex-1"><NavLink className="topActive hover:text-slate-950 flex items-center justify-center hover:shadow-lg hover:bg-white rounded-full px-4 py-2 transition-all duration-300" to="/guest/blocks">Blocks</NavLink></li>
          <li className="flex-1"><NavLink className="topActive hover:text-slate-950 flex items-center justify-center hover:shadow-lg hover:bg-white rounded-full px-4 py-2 transition-all duration-300" to="/guest/gallery">Gallery</NavLink></li>
        </ul>
      </div>
      <div className="flex gap-2">
        <button onClick={()=> navigate('/register', {replace:true})} className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition bg-sky-600 text-white hover:bg-sky-700 border-2 border-black drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">Sign Up</button>
        <button onClick={()=> navigate('', {replace:true})} className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition bg-orange-600 text-white hover:bg-orange-700 border-2 border-black drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">Log In</button>
      </div>
    </div>
    <div className="-translate-y-5">
      <Divider/>
    </div>
  </div>);
};

export default TopNavbar;
