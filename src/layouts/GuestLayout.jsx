import { Outlet } from "react-router";
import TopNavbar from "../components/TopNavbar"

const GuestLayout = () => {
  return <div className="relative h-screen flex flex-col">
    <TopNavbar/>
    <Outlet/>
  </div>;
};

export default GuestLayout;
