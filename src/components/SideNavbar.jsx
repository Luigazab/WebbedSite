import { Atom, Bell, Heart, MessageCircleMore, User } from "lucide-react";
import { NavLink, useNavigate} from "react-router";
import { supabase } from "../supabaseClient";
import { useEffect, useState } from "react";

const SideNavbar = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadCurrentUser();
    loadNotifications();
  },[]);

  useEffect(() => {
    if(!currentUser?.id) return;
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUser?.id}`
        },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id]);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setCurrentUser(profile);
    }
  };

  const loadNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select(`*, profiles!notifications_from_user_id_fkey(username)`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  };

  const markAsRead = async (notificationId) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    setNotifications(prev => prev.map(n => ({...n, is_read: true})));
    setUnreadCount(0);
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.project_id) {
      setShowNotifications(false);
      navigate(`/gallery`);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error){
      console.error("Error signing out:", error.message);
    }else{
      navigate("/");
    }
  };

  const getInitial = (username) => {
    return username ? username.charAt(0).toUpperCase() : '?';
  };
  
  const formatNotificationTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like': return <Heart className="text-red-500" fill="currentColor"/>
      case 'comment': return <MessageCircleMore className="text-blue-500" fill="currentColor"/>
      case 'follow': return <User className="text-purple-500" fill="currentColor"/>
      default: return <Bell className="text-yellow-500" fill="currentColor"/>
    }
  }
  return <div className="max-w-25 min-w-25 z-50 h-screen bg-gray-200 border-r-4 border-gray-900 flex flex-col items-center justify-between">
    <div className="flex flex-col items-center mt-8">
      <Atom className="size-10 mb-8" />
      <nav className="flex flex-col font-bold font-mono text-base-content space-y-8 items-center rounded-4xl ">
        <NavLink to="/">
          <button className="hover:font-semibold">Home</button>
        </NavLink>
        <NavLink to="/projects" >
          <button className="hover:font-semibold text-sm px-1">Projects</button>
        </NavLink>
        <NavLink to="/gallery">
          <button className="hover:font-semibold">Gallery</button>
        </NavLink>
        <NavLink to="/blocks">
          <button className="hover:font-semibold">Blocks</button>
        </NavLink>
      </nav>
      <div className="w-16 h-px border border-border rounded-full border-slate-800 my-6"/>

      <div className="relative mb-4">
        <button onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-3 rounded-full hover:bg-gray-300 transition">
          <Bell size={24} className="text-gray-800"/>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <>
            <div className="fixed inset-0 z-50" onClick={() => setShowNotifications(false)} />
            <div className="absolute left-full ml-4 top-0 z-50 w-80 bg-white rounded-lg shadow-2xl border border-grayr-200 max-h-96 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-700">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell size={32} className="mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification.id} onClick={() => handleNotificationClick(notification)}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition ${
                        !notification.is_read ? 'bg-blue-50' : ''
                      }`}>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{notification.content}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatNotificationTime(notification.created_at)}</p>
                        </div>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0 mt-1" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <NavLink to="/profile" className="mb-4">
        <button className="relative group">
          {currentUser?.avatar_url ? (
            <img src={currentUser.avatar_url} alt={currentUser.username} className="w-12 h-12 rounded-full object-cover border-2 border-gray-400 group-hover:border-gray-600 transition"/>
          ) : (
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg border-2 border-gray-400 group-hover:border-gray-600 transition">
              {getInitial(currentUser?.username)}
            </div>
          )}
        </button>
      </NavLink>
    </div>
    <button onClick={handleSignOut} className="px-2 py-2 mb-8 bg-fuchsia-900 text-red-200 border-3 border-black rounded-lg drop-shadow-[-2px_2px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:translate-x-1 hover:drop-shadow-[-4px_4px_0px_rgba(0,0,0,1)] hover:bg-fuschia-950 hover:scale-105 transition-transform cursor-pointer">Logout</button>
  </div>;
};

export default SideNavbar;
