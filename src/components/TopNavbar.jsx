import { useNavigate, NavLink } from "react-router";
import { Atom } from "lucide-react";

const TopNavbar = () => {
  const navigate = useNavigate();

  return <div className="sticky top-0 z-10 flex items-center justify-between p-4 shadow-md">
    <div className="flex items-center">
      <Atom className="size-5"/>
      <h1 className="text-2xl">WebbedSite</h1>
    </div>
    <div>
      <ul className="flex gap-6 py-2 px-4">
        <li><NavLink to="/">Home</NavLink></li>
        <li><NavLink to="/about">About</NavLink></li>
        <li><NavLink to="/projects">Build</NavLink></li>
        <li><NavLink to="/gallery">Gallery</NavLink></li>
        <li><NavLink to="/">Documentation</NavLink></li>
      </ul>
    </div>
    <div className="flex gap-2">
      <button onClick={()=> navigate('/register', {replace:true})} className="bg-blue-500 py-2 px-4 font-semibold rounded-2xl text-amber-100 cursor-pointer">Sign Up</button>
      <button onClick={()=> navigate('/login', {replace:true})} className="bg-blue-500 py-2 px-4 font-semibold rounded-2xl text-amber-100 cursor-pointer">Log In</button>
    </div>
  </div>;;
};

export default TopNavbar;
