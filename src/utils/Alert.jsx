import { AlertCircle, CheckCircle } from "lucide-react";
const Alert = ({type, message}) => {
  const isError = type === 'error';
  return <div className={`flex items-start gap-3 p-4 rounded-lg ${isError ? 'bg-red-100 text-red-800 border-red-800 border-2' : 'bg-green-100 text-green-800 border-2 border-green-800'}`}>
    {isError ? <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" /> : <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />}
    <p className="text-sm">{message}</p>
  </div>;
};

export default Alert;
