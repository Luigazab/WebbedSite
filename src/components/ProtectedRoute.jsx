import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Navigate } from "react-router";

const ProtectedRoute = ({ children, requireAdmin }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    
    if (session) {
      await fetchUserRole(session.user.id);
    }
    
    setLoading(false);
  };

  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserRole(data?.role || 'user');
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('user');
    }
  };

  if (loading) {
    return(
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  if (requireAdmin && userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }
  if (!requireAdmin && userRole === 'admin' && window.location.pathname === '/') {
    return <Navigate to="/overview" replace />;
  }
  return children;
};

export default ProtectedRoute;
