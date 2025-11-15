import { Link } from "react-router";

const HomeCard = ({text, link, className}) => {
  return <Link to={link} className={`px-6 py-6 m-1 min-w-auto border-4 border-black rounded-3xl drop-shadow-[-2px_2px_0px_rgba(0,0,0,1)] font-bold text-6xl hover:translate-x-1 hover:-translate-y-1 hover:drop-shadow-[-6px_6px_0px_rgba(0,0,0,1)] transition-transform cursor-pointer ${className}`}>
    {text}
  </Link>;
};

export default HomeCard;
