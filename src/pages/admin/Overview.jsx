import { Award, BookOpen, FileText, PieChart, TrendingUp, Users } from "lucide-react";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, Pie, Cell } from "recharts";
import StatCard from "../../components/StatCard";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabaseClient";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#14b8a6'];

const getTimeAgo = (timestamp) => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  if (diffMs < 60000) return 'just now'; // Less than 1 minute
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)} min ago`; // Less than 1 hour
  if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)} hour${Math.floor(diffMs / 3600000) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffMs / 86400000)} day${Math.floor(diffMs / 86400000) > 1 ? 's' : ''} ago`;
};

const Overview = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalProjects: 0, totalTutorials: 0, totalBadges: 0, publicProjects: 0 });
  const [activityData, setActivityData] = useState([]);
  const [projectsByCategory, setProjectsByCategory] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchCount = (tableName) => 
    supabase.from(tableName).select('*', { count: 'exact', head: true }).then(res => res.count || 0);

  const fetchWeeklyActivity = useCallback(async () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dataPromises = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayOfWeek = days[date.getDay()];
      
      // Use setHours on a new date object to avoid side effects
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).toISOString();
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).toISOString();

      const userPromise = fetchCount('profiles')
        .then(count => ({ day: dayOfWeek, users: count }))
        .catch(() => ({ day: dayOfWeek, users: 0 }));

      const projectPromise = fetchCount('projects')
        .then(count => ({ day: dayOfWeek, projects: count }))
        .catch(() => ({ day: dayOfWeek, projects: 0 }));

      // Push a promise that resolves to the combined data for the day
      dataPromises.push(Promise.all([userPromise, projectPromise]).then(([userRes, projectRes]) => ({
        date: userRes.day,
        users: userRes.users,
        projects: projectRes.projects
      })));
    }

    // Wait for all 7 days of data to be fetched
    return Promise.all(dataPromises);
  }, []);

  /**
   * Fetches recent user joins and project creations, then merges and sorts them.
   */
  const fetchRecentActivity = useCallback(async () => {
    const [
      { data: recentProjects },
      { data: recentUsers }
    ] = await Promise.all([
      supabase.from('projects')
        .select('id, title, created_at, profiles(username)')
        .order('created_at', { ascending: false })
        .limit(5),
      
      supabase.from('profiles')
        .select('username, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);
    
    // Normalize and merge activities
    const activities = [
      ...(recentProjects || []).map(project => ({
        type: 'project',
        username: project.profiles?.username || 'Unknown',
        action: `published a new project: "${project.title}"`,
        time: project.created_at,
        color: 'green'
      })),
      ...(recentUsers || []).map(user => ({
        type: 'user',
        username: user.username,
        action: 'joined the platform',
        time: user.created_at,
        color: 'blue'
      }))
    ];

    // Sort by actual time string (which is a timestamp) and limit to top 5
    return activities
      .sort((a, b) => new Date(b.time) - new Date(a.time)) // Descending sort
      .slice(0, 5)
      .map(activity => ({ 
        ...activity, 
        time: getTimeAgo(activity.time) // Format time after sorting
      }));

  }, []);

  /**
   * Placeholder: In a real app, you would fetch projects and group them by a 'category' column.
   */
  const fetchProjectsByCategory = useCallback(async () => {
    // NOTE: Your 'projects' table schema doesn't have a 'category' column.
    // Assuming a temporary mock for the pie chart to render:
    return [
      { name: 'Web', value: 400 },
      { name: 'Mobile', value: 300 },
      { name: 'Game Dev', value: 300 },
      { name: 'Data Science', value: 200 },
    ];
  }, []);


  const fetchOverviewData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        usersCount,
        projectsData,
        tutorialsCount,
        badgesCount,
        weeklyData,
        recentData,
        categoryData
      ] = await Promise.all([
        fetchCount('profiles'),
        supabase.from('projects').select('is_public', { count: 'exact' }),
        fetchCount('tutorials'),
        fetchCount('badges'),
        fetchWeeklyActivity(),
        fetchRecentActivity(),
        fetchProjectsByCategory()
      ]);

      const projectsCount = projectsData.count || 0;
      const publicProjectsCount = projectsData.data?.filter(p => p.is_public).length || 0;

      setStats({
        totalUsers: usersCount,
        totalProjects: projectsCount,
        totalTutorials: tutorialsCount,
        totalBadges: badgesCount,
        publicProjects: publicProjectsCount,
        // Added a placeholder for active users since it's in the StatCard subtitle
        activeUsers: Math.ceil(usersCount * 0.7) // Mock active users
      });

      setActivityData(weeklyData);
      setRecentActivity(recentData);
      setProjectsByCategory(categoryData);

    } catch (err) {
      console.error('Error fetching overview data:', err);
      setError("Failed to load dashboard data. Please check connection.");
    } finally {
      setLoading(false);
    }
  }, [fetchWeeklyActivity, fetchRecentActivity, fetchProjectsByCategory]); // Dependencies for useCallback

  useEffect(() => {
    fetchOverviewData();
  }, [fetchOverviewData]);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="ml-4 text-lg text-blue-600">Loading Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-12 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700 font-semibold mb-3">{error}</p>
        <button onClick={fetchOverviewData} className="flex items-center mx-auto gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
          <RefreshCw size={16} />
          Retry Fetching Data
        </button>
      </div>
    );
  }
  return <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard icon={Users} title="Total Users" value={stats.totalUsers} subtitle={`${stats.activeUsers} active`} color="#3b82f6" />
      <StatCard icon={FileText} title="Total Projects" value={stats.totalProjects} subtitle={`${stats.publicProjects} public`} color="#10b981" />
      <StatCard icon={BookOpen} title="Tutorials" value={stats.totalTutorials} subtitle="All levels" color="#f59e0b" />
      <StatCard icon={Award} title="Badges" value={stats.totalBadges} subtitle="Achievement system" color="#ef4444" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-600" />
          Weekly Activity
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={activityData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis allowDecimals={false} stroke="#6b7280" />
            <Tooltip formatter={(value, name) => [value, name]} />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} name="New Users" dot={{ r: 4 }} activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="projects" stroke="#10b981" strokeWidth={3} name="New Projects" dot={{ r: 4 }} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText size={20} className="text-green-600" />
          Projects by Category
        </h3>
        {projectsByCategory.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={projectsByCategory}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {projectsByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ paddingTop: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[250px] text-gray-500">
            <p>No project category data available to display.</p>
          </div>
        )}
      </div>
    </div>
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
          <Users size={20} className="text-purple-600" />
          Recent Activity Feed
      </h3>
      <div className="space-y-4">
        {recentActivity.length > 0 ? (
          recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
              {/* Visual Indicator */}
              <div className={`w-2 h-2 rounded-full shrink-0 ${
                activity.color === 'green' ? 'bg-green-500' : 
                activity.color === 'blue' ? 'bg-blue-500' : 'bg-gray-500'
              }`}></div>
              
              {/* Activity Details */}
              <span className="text-base flex-1">
                <strong className="font-semibold text-gray-800">{activity.username}</strong> {activity.action}
              </span>

              {/* Time Ago */}
              <span className="text-sm text-gray-500 shrink-0">{activity.time}</span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No recent activity to show.</p>
        )}
      </div>
    </div>
  </div>;
};

export default Overview;
