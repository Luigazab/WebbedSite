import { Link } from "react-router";

const HomeCard = ({text, link, className}) => {
  return <Link to={link} className={`px-2 py-2 text-2xl md:px-4 md:py-4 md:text-4xl lg:px-6 lg:py-6 lg:text-6xl flex justify-center items-center m-1 min-w-auto border-4 border-black rounded-lg md:rounded-2xl lg:rounded-3xl drop-shadow-[-2px_2px_0px_rgba(0,0,0,1)] font-bold hover:translate-x-1 hover:-translate-y-1 hover:drop-shadow-[-6px_6px_0px_rgba(0,0,0,1)] transition-all cursor-pointer ${className}`}>
    {text}
  </Link>;
};

export default HomeCard;
