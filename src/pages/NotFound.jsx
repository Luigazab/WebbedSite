import { useNavigate } from "react-router";

const NotFound = () => {
  const navigate = useNavigate();
  return <div className="flex flex-col h-screen items-center space-y-2 justify-center">
    <h1 className="font-bold text-9xl text-slate-700">404</h1>
    <h2 className="font-bold text-3xl text-slate-700">Page Not Found</h2>
    <p className="font-medium text-slate-500">It appears the page you're looking for does not exist</p>
    <button onClick={() => navigate("/")} className="px-2 py-2 border-2 rounded-md bg-purple-700 text-white border-black font-medium hover:bg-purple-800">Back to Home Page</button>
  </div>;
};

export default NotFound;
