import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Alert from "../utils/Alert";
import { useNavigate, useOutletContext, Link } from "react-router";
import { User, Mail, Lock } from "lucide-react";
const Register = () => {
  const navigate = useNavigate();
  const { setPageTitle, setPageSubtitle } = useOutletContext();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() =>{
    setPageTitle('Create Account')
    setPageSubtitle('Sign up to get started');
  }, [setPageTitle, setPageSubtitle])

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);
    if (!formData.email || !formData.password || !formData.confirmPassword){
      setAlert({type:"error", message:"Please fill in all fields"});
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setAlert({type:"error", message:"Passwords do not match!"});
      return;
    }
    if (formData.password.length < 6){
      setAlert({type: "error", message:"Password must be at least 6 characters"});
      return;
    }
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        // Handle specific error cases
        if (error.message.includes('already registered')) {
          setAlert({ type: "error", message: "An account with this email already exists" });
        } else if (error.message.includes('Database error')) {
          setAlert({ type: "error", message: "Unable to create account. Please check your database setup or try again later." });
        } else {
          setAlert({ type: "error", message: error.message });
        }
        console.error('Signup error:', error);
      } else if (data?.user) {
        // Check if user already exists (Supabase returns user even if already registered)
        if (data.user.identities && data.user.identities.length === 0) {
          setAlert({ type: "error", message: "An account with this email already exists" });
        } else {
          // Check if email confirmation is required
          if (data.session) {
            setAlert({ type: 'success', message: 'Account created successfully!' });
          } else {
            setAlert({ type: 'success', message: 'Account created! Please check your email to verify your account.' });
          }
          
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      }
    }catch(error){
      console.error('Unexpected error:', error);
      setAlert({ type: 'error', message: 'An unexpected error occurred' });
    }finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return <div className="space-y-4">
    {alert && <Alert type={alert.type} message={alert.message} />}
    
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={loading}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
          placeholder="email@example.com"/>
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="password" name="password" value={formData.password} onChange={handleChange} disabled={loading}
          className="w-full pl-10 pr-2 mr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
          placeholder="••••••••"/>
        
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} disabled={loading}
          className="w-full pl-10 pr-2 mr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
          placeholder="••••••••"/>
      </div>
    </div>

    <button onClick={handleSubmit} disabled={loading}
      className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 shadow-lg cursor-pointer hover:shadow-xl disabled:bg-indigo-400 disabled:cursor-not-allowed">
      {loading ? 'Creating Account...' : 'Create Account'}
    </button>

    <div className="text-center mt-6">
      <p className="text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700">
          Sign In
        </Link>
      </p>
    </div>
  </div>;
};

export default Register;
