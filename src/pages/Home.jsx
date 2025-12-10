import React from "react";
import HomeCard from "../components/HomeCard";

const Home = () => {
  return <div className="m-2 p-2 rounded-lg flex flex-col space-y-4 items-center justify-center w-full h-full">
    <div className="items-center justify-center grid grid-cols-4 grid-rows-2">
      <h1 className="font-bold text-4xl md:text-7xl lg:text-9xl col-span-3">WebbedSite</h1>
      <img src="/logo-cropped.PNG" alt="" className="w-50 p-0"  />
      <HomeCard className="hover:bg-orange-500 bg-orange-600 text-white" text="Create" link="/editor"/>
      <HomeCard className="hover:bg-fuchsia-600 bg-fuchsia-700 text-white" text="Learn" link="/learn"/>
      <HomeCard className="hover:bg-green-500 bg-green-700 text-white" text="Blocks" link="/blocks"/>
      <HomeCard className="hover:bg-sky-600 bg-sky-700 text-slate-50" text="Gallery" link="/gallery"/>
    </div>
  </div>;
};

export default Home;
