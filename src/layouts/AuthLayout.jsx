import { Outlet } from "react-router";
import TopNavbar from "../components/TopNavbar"
import { useState } from "react";

const AuthLayout = () => {
  const [pageTitle, setPageTitle] = useState('Welcome');
  const [pageSubtitle, setPageSubtitle] = useState('Please sign in');
  return <div className="relative h-screen flex flex-col">
    <div className="absolute inset-0">
      <div className="absolute top-0 -z-10 h-full w-full bg-white [&>div]:absolute [&>div]:bottom-auto [&>div]:left-auto [&>div]:right-0 [&>div]:top-0 [&>div]:h-[500px] [&>div]:w-[500px] [&>div]:-translate-x-[30%] [&>div]:translate-y-[20%] [&>div]:rounded-full [&>div]:bg-[rgba(109,244,173,0.5)] [&>div]:opacity-50 [&>div]:blur-[80px]">
        <div></div>
      </div>
    </div>
    {/* <TopNavbar/> */}
    <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
      <div className="max-w-md">
        <div className="px-6 py-3 bg-white border-4 border-black rounded-lg drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] font-bold text-black hover:translate-x-1 hover:translate-y-1 hover:drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-transform">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{pageTitle}</h1>
              <p className="text-gray-600">{pageSubtitle}</p>
            </div>
            <Outlet context={{setPageTitle, setPageSubtitle}}/>
        </div>
      </div>
    </div>
  </div>;
};

export default AuthLayout;
