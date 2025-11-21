import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { supabase } from "../supabaseClient";
import { Edit, ThumbsUp, Eye, MessageCircleMore, Award, TrendingUp } from "lucide-react";
import ProjectModal from "../modals/ProjectModal";

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'liked'
  const [projects, setProjects] = useState([]);
  const [likedProjects, setLikedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalLikes: 0,
    totalViews: 0,
    publicProjects: 0
  });

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id);

      // Determine which user profile to load
      const profileUserId = userId || user?.id;
      setIsOwnProfile(!userId || userId === user?.id);

      if (!profileUserId) {
        navigate('/login');
        return;
      }

      // Load profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileUserId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Load user's public projects (or all if own profile)
      const projectQuery = supabase
        .from('projects')
        .select('*')
        .eq('user_id', profileUserId);

      if (!isOwnProfile) {
        projectQuery.eq('is_public', true);
      }

      const { data: projectsData, error: projectsError } = await projectQuery
        .order('updated_at', { ascending: false });

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);

      // Calculate stats
      const totalLikes = projectsData?.reduce((sum, p) => sum + (p.likes_count || 0), 0) || 0;
      const totalViews = projectsData?.reduce((sum, p) => sum + (p.views_count || 0), 0) || 0;
      const publicProjects = projectsData?.filter(p => p.is_public).length || 0;

      setStats({
        totalProjects: projectsData?.length || 0,
        totalLikes,
        totalViews,
        publicProjects
      });

      // Load liked projects
      const { data: likesData, error: likesError } = await supabase
        .from('project_likes')
        .select(`
          project_id,
          projects:project_id (
            *,
            profiles:user_id (username)
          )
        `)
        .eq('user_id', profileUserId);

      if (!likesError && likesData) {
        setLikedProjects(likesData.map(like => like.projects).filter(Boolean));
      }

    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const openProjectModal = (project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const handleProjectModalClose = () => {
    setShowProjectModal(false);
    setSelectedProject(null);
    loadProfile(); // Reload to get updated stats
  };

  const getInitial = (username) => {
    return username ? username.charAt(0).toUpperCase() : '?';
  };

  const getProgressLevel = (totalProjects) => {
    if (totalProjects >= 50) return { level: 5, label: 'Master', color: 'bg-purple-500', progress: 100 };
    if (totalProjects >= 20) return { level: 4, label: 'Expert', color: 'bg-blue-500', progress: (totalProjects / 50) * 100 };
    if (totalProjects >= 10) return { level: 3, label: 'Advanced', color: 'bg-green-500', progress: (totalProjects / 20) * 100 };
    if (totalProjects >= 5) return { level: 2, label: 'Intermediate', color: 'bg-yellow-500', progress: (totalProjects / 10) * 100 };
    return { level: 1, label: 'Beginner', color: 'bg-gray-500', progress: (totalProjects / 5) * 100 };
  };

  const getBadges = (stats) => {
    const badges = [];
    if (stats.totalProjects >= 1) badges.push({ icon: '🎨', name: 'First Project', description: 'Created first project' });
    if (stats.publicProjects >= 1) badges.push({ icon: '🌟', name: 'Contributor', description: 'Shared a project' });
    if (stats.totalLikes >= 10) badges.push({ icon: '❤️', name: 'Popular', description: 'Received 10+ likes' });
    if (stats.totalViews >= 100) badges.push({ icon: '👁️', name: 'Trending', description: '100+ views' });
    if (stats.totalProjects >= 10) badges.push({ icon: '🏆', name: 'Productive', description: 'Created 10+ projects' });
    if (stats.publicProjects >= 5) badges.push({ icon: '🎯', name: 'Influencer', description: 'Shared 5+ projects' });
    return badges;
  };

  const progressInfo = getProgressLevel(stats.totalProjects);
  const badges = getBadges(stats);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500 text-lg">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500 text-lg">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50 p-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="shrink-0">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold border-4 border-gray-200">
                {getInitial(profile.username)}
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{profile.username}</h1>
              {isOwnProfile && (
                <button
                  onClick={() => navigate('/settings')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  <Edit size={16} />
                  Edit Profile
                </button>
              )}
            </div>

            {profile.bio && (
              <p className="text-gray-600 mb-4">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="flex gap-6 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.totalProjects}</div>
                <div className="text-sm text-gray-600">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.publicProjects}</div>
                <div className="text-sm text-gray-600">Public</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.totalLikes}</div>
                <div className="text-sm text-gray-600">Likes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.totalViews}</div>
                <div className="text-sm text-gray-600">Views</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-gray-700" />
                  <span className="font-semibold text-gray-900">Level {progressInfo.level}</span>
                  <span className="text-sm text-gray-600">- {progressInfo.label}</span>
                </div>
                <span className="text-sm text-gray-600">{stats.totalProjects} / {[5, 10, 20, 50, 50][progressInfo.level - 1]} projects</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-3">
                <div
                  className={`${progressInfo.color} h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(progressInfo.progress, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      {badges.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Award size={20} className="text-yellow-500" />
            <h2 className="text-xl font-bold text-gray-900">Badges</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {badges.map((badge, index) => (
              <div
                key={index}
                className="bg-linear-to-br from-yellow-50 to-orange-50 rounded-lg p-4 text-center border-2 border-yellow-200 hover:scale-105 transition-transform"
                title={badge.description}
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <div className="text-xs font-semibold text-gray-700">{badge.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 px-6 py-4 font-semibold border-b-2 transition ${
              activeTab === 'posts'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {isOwnProfile ? 'My Projects' : 'Public Projects'} ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('liked')}
            className={`flex-1 px-6 py-4 font-semibold border-b-2 transition ${
              activeTab === 'liked'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Liked ({likedProjects.length})
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {activeTab === 'posts' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => openProjectModal(project)}
              className="border-2 border-gray-200 rounded-xl bg-white hover:shadow-xl transition-all cursor-pointer group"
            >
              {/* Preview */}
              <div className="relative w-full h-40 flex items-center justify-center rounded-t-lg bg-linear-to-br from-blue-50 to-purple-50 overflow-hidden">
                {project.generated_html ? (
                  <iframe
                    srcDoc={project.generated_html}
                    className="w-full h-full border-0 pointer-events-none scale-50 origin-top-left"
                    style={{ width: '200%', height: '200%' }}
                    title={`Preview of ${project.title}`}
                    sandbox=""
                  />
                ) : (
                  <div className="text-gray-400 text-sm">No preview</div>
                )}
                
                {!project.is_public && (
                  <div className="absolute top-2 right-2 bg-gray-900 text-white text-xs px-2 py-1 rounded">
                    Private
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3 space-y-2">
                <h2 className="font-semibold text-sm truncate">{project.title}</h2>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <ThumbsUp size={14} />
                    {project.likes_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircleMore size={14} />
                    {project.comments_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={14} />
                    {project.views_count || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Liked Projects Grid */}
      {activeTab === 'liked' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {likedProjects.map((project) => (
            <div key={project.id} onClick={() => openProjectModal(project)}
              className="border-2 border-gray-200 rounded-xl bg-white hover:shadow-xl transition-all cursor-pointer group">
              {/* Preview */}
              <div className="relative w-full h-40 flex items-center justify-center rounded-t-lg bg-linear-to-br from-blue-50 to-purple-50 overflow-hidden">
                {project.generated_html ? (
                  <iframe
                    srcDoc={project.generated_html}
                    className="w-full h-full border-0 pointer-events-none scale-50 origin-top-left"
                    style={{ width: '200%', height: '200%' }}
                    title={`Preview of ${project.title}`}
                    sandbox=""
                  />
                ) : (
                  <div className="text-gray-400 text-sm">No preview</div>
                )}
              </div>

              {/* Info */}
              <div className="p-3 space-y-2">
                <h2 className="font-semibold text-sm truncate">{project.title}</h2>
                <p className="text-xs text-gray-500">
                  by <span className="font-medium text-gray-700">{project.profiles?.username || 'Unknown'}</span>
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <ThumbsUp size={14} />
                    {project.likes_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={14} />
                    {project.views_count || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {((activeTab === 'posts' && projects.length === 0) || 
        (activeTab === 'liked' && likedProjects.length === 0)) && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {activeTab === 'posts' ? 'No projects yet' : 'No liked projects yet'}
          </h3>
          <p className="text-gray-500 mb-4">
            {activeTab === 'posts' 
              ? 'Start creating amazing projects!' 
              : 'Explore the gallery and like some projects!'}
          </p>
        </div>
      )}

      {/* Project Modal */}
      {selectedProject && (
        <ProjectModal
          isOpen={showProjectModal}
          onClose={handleProjectModalClose}
          id={selectedProject.id}
          title={selectedProject.title}
          description={selectedProject.description || ''}
          likes={selectedProject.likes_count || 0}
          comments={selectedProject.comments_count || 0}
          srcDoc={selectedProject.generated_html}
          isPublic={selectedProject.is_public}
          projectOwnerId={selectedProject.user_id}
        />
      )}
    </div>
  );
};

export default Profile;