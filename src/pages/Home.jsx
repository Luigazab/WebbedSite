import React from "react";
import HomeCard from "../components/HomeCard";

const Home = () => {
  return <div className="p-2 rounded-lg flex flex-col space-y-4 items-center justify-center w-full h-full">
    <h1 className="font-bold text-9xl min-w-4xl">WebbedSite</h1>
    <div className="flex items-center justify-evenly">
      <HomeCard className="bg-green-900 text-white" text="Create" link="/editor"/>
      <HomeCard className="bg-sky-700 text-slate-50" text="Learn" link="/learn"/>
      <HomeCard className="bg-orange-600 text-amber-100" text="Blocks" link="/editor"/>
      <HomeCard className="bg-indigo-700 text-white" text="Gallery" link="/gallery"/>
    </div>
  </div>;
};

export default Home;
