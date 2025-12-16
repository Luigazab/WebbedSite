import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router";
import { supabase } from "../supabaseClient";
import Alert from "../utils/Alert";
import {Mail, Lock, Eye, EyeOff} from 'lucide-react';

const Login = () => {
  const { setPageTitle, setPageSubtitle} = useOutletContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(false);

  useEffect(() =>{
    setPageTitle('Welcome Back');
    setPageSubtitle('Sign in to your account');
  }, [setPageTitle, setPageSubtitle]);
  const handleSubmit = async () => {
    setAlert(null);

    if (!formData.email || !formData.password){
      setAlert({type: 'error', message: 'Please fill in all fields'});
      return;
    }
    setLoading(true);

    try{
      const { error} = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if(error){
        setAlert({type: 'error', message: error.message});
      }else{
        setAlert({ type: 'success', message: 'Successfully signed in!'});

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        }
        setTimeout(() => {
          // Redirect based on role
          if (profile?.role === 'admin') {
            navigate('/admin/overview');
          } else {
            navigate('/');
          }
        }, 1000);
      }
    }catch (error) {
      console.error('Login error:', error);
      setAlert({type: 'error', message: 'An unexpected error occurred'});
    }finally{
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit();
    }
  };

  return (
    <>
    <div className="space-y-4">
       {alert && <Alert type={alert.type} message={alert.message} />}
       <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="email" name="email" value={formData.email} onKeyPress={handleKeyPress} onChange={handleChange} disabled={loading} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-100" placeholder="email@example.com" />
        </div>
       </div>
       <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type='password' name="password" value={formData.password} onKeyPress={handleKeyPress} onChange={handleChange} disabled={loading} className="w-full pl-10 px-2 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent  transition disabled:bg-gray-100" placeholder="••••••••"/>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} disabled={loading}className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/>
            <span className="ml-2 text-sm text-gray-700">Remember me</span>
          </label>
          <button type="button" disabled={loading} className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold disabled:text-indigo-400">
            Forgot password?
          </button>
        </div>
        <button onClick={handleSubmit} disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 shadow-lg hover:shadow-xl disabled:bg-indigo-400 disabled:cursor-not-allowed">
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
        <div className="text-center mt-6">
          <p className="text-gray-600">Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 font-semibold hover:text-indigo-700">
              Sign Up</Link>
          </p>
        </div>
    </div>
</>
  );
};

export default Login;
