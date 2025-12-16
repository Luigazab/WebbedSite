import { Bell, Heart, Menu, MessageCircleMore, User, X } from "lucide-react";
import { NavLink, useNavigate} from "react-router";
import { supabase } from "../supabaseClient";
import { useEffect, useState } from "react";

const SideNavbar = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
  const NavContent = () =>(
    <>
      <div className="flex flex-col mt-8 w-full items-center">
        <img src="/logo.png" alt="" className="size-20 mb-8" />
        <nav className="flex flex-col font-bold font-mono text-base-content space-y-8 items-center rounded-4xl ">
          <NavLink to="/" className="navButtons w-full" onClick={() => setIsMobileMenuOpen(false)}>
            <button className="w-full hover:font-semibold">Home</button>
          </NavLink>
          <NavLink to="/projects" className="navButtons w-full" onClick={() => setIsMobileMenuOpen(false)}>
            <button className="w-full hover:font-semibold">Projects</button>
          </NavLink>
          <NavLink to="/gallery" className="navButtons w-full" onClick={() => setIsMobileMenuOpen(false)}>
            <button className="w-full hover:font-semibold">Gallery</button>
          </NavLink>
          <NavLink to="/blocks" className="navButtons w-full" onClick={() => setIsMobileMenuOpen(false)}>
            <button className="w-full hover:font-semibold">Blocks</button>
          </NavLink>
        </nav>
        <div className="w-4/5 h-1 rounded-full bg-slate-800 my-6"/>

        <div className="relative mb-4">
          <button onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-3 rounded-full bg-slate-200 hover:bg-slate-100 border-3 hover:translate-x-1 hover:-translate-y-1 border-black hover:shadow-[-2px_2px_0px_rgba(0,0,0,1)]  transition-all ">
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
              <div className="absolute left-full ml-4 top-10 z-50 w-80 bg-white rounded-lg border-3 border-black shadow-[-4px_-4px_0px_rgba(0,0,0,1)] max-h-96 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-4 border-b-3 border-black bg-linear-to-r from-pink-200 to-purple-200">
                  <h3 className="font-bold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full border-2 border-black hover:bg-blue-600 transition-all hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]">
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
                        className={`p-4 border-b-2 border-gray-100 hover:bg-gray-50 cursor-pointer transition ${
                          !notification.is_read ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''
                        }`}>
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 font-semibold">{notification.content}</p>
                            <p className="text-xs text-gray-600 mt-1 font-mono">{formatNotificationTime(notification.created_at)}</p>
                          </div>
                          {!notification.is_read && (
                            <div className="w-3 h-3 bg-blue-600 rounded-full shrink-0 mt-1 border-2 border-black" />
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
        <NavLink to="/profile" className="mb-4" onClick={() => setIsMobileMenuOpen(false)}>
          <button className="relative group">
            {currentUser?.avatar_url ? (
              <img src={currentUser.avatar_url} alt={currentUser.username} className="w-12 h-12 rounded-full object-cover border-3 border-black group-hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all group-hover:-translate-y-1"/>
            ) : (
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg border-3 border-black group-hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all group-hover:-translate-y-1">
                {getInitial(currentUser?.username)}
              </div>
            )}
          </button>
        </NavLink>
      </div>
      <button onClick={handleSignOut} className="px-2 py-2 mb-8 bg-fuchsia-900 text-white font-semibold border-3 border-black rounded-lg drop-shadow-[-2px_2px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:translate-x-1 hover:drop-shadow-[-4px_4px_0px_rgba(0,0,0,1)] hover:bg-fuschia-950 hover:scale-105 transition-all cursor-pointer">Logout</button>
    </>
  )
  return (
    <>
      <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}className="md:hidden fixed top-4 left-4 z-50 p-3 bg-linear-to-br from-pink-400 to-purple-500 text-white rounded-xl border-3 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all">
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-10"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      <div className={`
        fixed left-0 top-0 h-screen w-72 z-10
        bg-linear-to-b from-gray-200 via-gray-300 to-gray-200
        border-r-4 border-black 
        flex flex-col items-center justify-between
        transition-transform duration-300 ease-in-out
        md:translate-x-0 md:w-28
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <NavContent />
      </div>
    </>
  );
};

export default SideNavbar;
