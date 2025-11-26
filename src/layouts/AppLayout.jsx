import React from "react";
import SideNavbar from "../components/SideNavbar";
import { Outlet } from "react-router";

const AppLayout = () => {
  return ( 
    <div>
      {/* <div className="absolute inset-0 bg-white dark:bg-gray-950 overflow-hidden"> */}
      <div className="absolute inset-0 bg-white overflow-hidden">
      <svg    className="absolute inset-0 w-full h-full opacity-30 dark:opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none"  >
        <path fill="none" stroke="url(#gradient1)" strokeWidth="0.5" d="M0,50 C20,60 40,40 60,50 C80,60 100,40 100,50 L100,100 L0,100 Z"/>
        <path fill="none" stroke="url(#gradient2)" strokeWidth="0.5" d="M0,60 C30,70 70,30 100,60 L100,100 L0,100 Z" />
        <path fill="none" stroke="url(#gradient3)" strokeWidth="0.5"
          d="M0,70 C20,80 80,20 100,70 L100,100 L0,100 Z" />
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
      {/* <div className="absolute inset-0 bg-gradient-to-b from-white via-white/0 to-white dark:from-gray-950 dark:via-gray-950/0 dark:to-gray-950" /></div> */}
      <div className="absolute inset-0 bg-linear-to-b from-white via-white/0 to-white" /></div>
        <div className="relative h-screen flex min-w-screen">
          <div className="fixed left-0 top-0 h-screen w-25 bg-gray-200 border-r-4 border-gray-900 flex flex-col items-center justify-between">
            <SideNavbar/>
          </div>
          <div className="flex-1 ml-25 flex items-center justfy-center">
            <Outlet/>
          </div>
        </div>
    </div>
  );
};

export default AppLayout;
