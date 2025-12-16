import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { supabase } from "../supabaseClient";
import { Edit, ThumbsUp, Eye, MessageCircleMore, Award, TrendingUp, Save, X } from "lucide-react";
import ProjectModal from "../modals/ProjectModal";
import Loader from "../components/Loader";

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [projects, setProjects] = useState([]);
  const [likedProjects, setLikedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', bio: '', avatar_url: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
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
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id);

      const profileUserId = userId || user?.id;
      const ownProfile = !userId || userId === user?.id;
      setIsOwnProfile(ownProfile);

      if (!profileUserId) {
        navigate('/login');
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileUserId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);
      setEditForm({
        username: profileData.username || '',
        bio: profileData.bio || '',
        avatar_url: profileData.avatar_url || ''
      });

      // Use the local variable instead of state
      const projectQuery = supabase
        .from('projects')
        .select('*')
        .eq('user_id', profileUserId);

      if (!ownProfile) {
        projectQuery.eq('is_public', true);
      }

      const { data: projectsData, error: projectsError } = await projectQuery
        .order('updated_at', { ascending: false });

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);

      const totalLikes = projectsData?.reduce((sum, p) => sum + (p.likes_count || 0), 0) || 0;
      const totalViews = projectsData?.reduce((sum, p) => sum + (p.views_count || 0), 0) || 0;
      const publicProjects = projectsData?.filter(p => p.is_public).length || 0;

      setStats({
        totalProjects: projectsData?.length || 0,
        totalLikes,
        totalViews,
        publicProjects
      });

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

  const uploadAvatar = async (file) => {
    try {
      setUploading(true);

      // Delete old avatar if exists
      if (profile.avatar_url && profile.avatar_url.includes('supabase')) {
        const oldPath = profile.avatar_url.split('/').slice(-2).join('/');
        await supabase.storage.from('avatars').remove([oldPath]);
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUserId}/${Math.random()}.${fileExt}`;

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB');
      return;
    }

    setAvatarFile(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setEditForm({ ...editForm, avatar_url: previewUrl });
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      let avatarUrl = editForm.avatar_url;

      // Upload new avatar if file was selected
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar(avatarFile);
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        } else {
          setSaving(false);
          return;
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          username: editForm.username,
          bio: editForm.bio,
          avatar_url: avatarUrl
        })
        .eq('id', currentUserId);

      if (error) throw error;

      setProfile({ ...profile, username: editForm.username, bio: editForm.bio, avatar_url: avatarUrl });
      setIsEditing(false);
      setAvatarFile(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const openProjectModal = (project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const handleProjectModalClose = () => {
    setShowProjectModal(false);
    setSelectedProject(null);
    loadProfile();
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
      <Loader/>
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
    <div className="w-full h-full bg-slate-200/80">
      <div className="py-6 px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Profile Info */}
          <div className="lg:w-80 shrink-0 space-y-6">
            {/* Avatar & Basic Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {isEditing ? (
                /* Edit Mode */
                <div className="space-y-4">
                  {/* Avatar Preview */}
                  <div className="mb-4">
                    {editForm.avatar_url ? (
                      <img
                        src={editForm.avatar_url}
                        alt="Preview"
                        className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-gray-100"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="w-32 h-32 mx-auto rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold border-4 border-gray-100"
                      style={{ display: editForm.avatar_url ? 'none' : 'flex' }}
                    >
                      {getInitial(editForm.username)}
                    </div>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Avatar
                    </label>
                    <div className="flex items-center gap-2">
                      <input type="file" accept="image/*" onChange={handleAvatarChange} disabled={uploading}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 disabled:opacity-50"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Max 2MB, JPG/PNG/GIF</p>
                    {uploading && (
                      <p className="text-xs text-green-600 mt-1">Uploading...</p>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-white text-gray-500">OR</span>
                    </div>
                  </div>

                  {/* Avatar URL Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Avatar URL
                    </label>
                    <input
                      type="text"
                      value={avatarFile ? '' : editForm.avatar_url}
                      onChange={(e) => {
                        setAvatarFile(null);
                        setEditForm({ ...editForm, avatar_url: e.target.value });
                      }}
                      disabled={avatarFile !== null}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="https://example.com/avatar.jpg"
                    />
                    {avatarFile && (
                      <p className="text-xs text-gray-500 mt-1">Clear file selection to use URL</p>
                    )}
                  </div>

                  {/* Username Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Bio Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      rows="3"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  {/* Save/Cancel Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                      <Save size={16} />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setAvatarFile(null);
                        setEditForm({
                          username: profile.username || '',
                          bio: profile.bio || '',
                          avatar_url: profile.avatar_url || ''
                        });
                      }}
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition border border-gray-300 disabled:opacity-50"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <>
                  {/* Avatar */}
                  <div className="mb-4">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.username}
                        className="w-full aspect-square rounded-full object-cover border-4 border-gray-100"
                      />
                    ) : (
                      <div className="w-full aspect-square rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-6xl font-bold border-4 border-gray-100">
                        {getInitial(profile.username)}
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <div className="mb-4">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{profile.username}</h1>
                    <p className="text-gray-600 text-sm">@{profile.username}</p>
                  </div>

                  {/* Edit Button */}
                  {isOwnProfile && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition border border-gray-300 mb-4"
                    >
                      <Edit size={16} />
                      Edit Profile
                    </button>
                  )}

                  {/* Bio */}
                  {profile.bio && (
                    <p className="text-gray-700 text-sm mb-4">{profile.bio}</p>
                  )}

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="text-xl font-bold text-gray-900">{stats.totalProjects}</div>
                      <div className="text-xs text-gray-600">Projects</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="text-xl font-bold text-gray-900">{stats.publicProjects}</div>
                      <div className="text-xs text-gray-600">Public</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="text-xl font-bold text-gray-900">{stats.totalLikes}</div>
                      <div className="text-xs text-gray-600">Likes</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="text-xl font-bold text-gray-900">{stats.totalViews}</div>
                      <div className="text-xs text-gray-600">Views</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-gray-700" />
                        <span className="font-semibold text-sm text-gray-900">Level {progressInfo.level}</span>
                      </div>
                      <span className="text-xs text-gray-600">{progressInfo.label}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className={`${progressInfo.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min(progressInfo.progress, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 text-center">
                      {stats.totalProjects} / {[5, 10, 20, 50, 50][progressInfo.level - 1]} projects
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Badges Section */}
            {badges.length > 0 && !isEditing && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Award size={18} className="text-yellow-500" />
                  <h2 className="text-lg font-bold text-gray-900">Achievements</h2>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {badges.map((badge, index) => (
                    <div
                      key={index}
                      className="bg-linear-to-br from-yellow-50 to-orange-50 rounded-lg p-3 text-center border border-yellow-200 hover:scale-105 transition-transform cursor-pointer"
                      title={badge.description}
                    >
                      <div className="text-3xl mb-1">{badge.icon}</div>
                      <div className="text-xs font-semibold text-gray-700 leading-tight">{badge.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Content - Projects */}
          <div className="flex-1 bg-white rounded-xl min-w-0">
            {/* Tabs */}
            <div className="bg-white rounded-lg border border-gray-200 mb-6">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`flex-1 px-6 py-3 font-semibold border-b-2 transition text-sm ${
                    activeTab === 'posts'
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {isOwnProfile ? 'My Projects' : 'Public Projects'} ({projects.length})
                </button>
                <button
                  onClick={() => setActiveTab('liked')}
                  className={`flex-1 px-6 py-3 font-semibold border-b-2 transition text-sm ${
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 m-10">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => openProjectModal(project)}
                    className="border border-gray-200 rounded-lg bg-white hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
                  >
                    <div className="relative w-full h-40 flex items-center justify-center bg-linear-to-br from-blue-50 to-purple-50 overflow-hidden">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {likedProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => openProjectModal(project)}
                    className="border border-gray-200 rounded-lg bg-white hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
                  >
                    <div className="relative w-full h-40 flex items-center justify-center bg-linear-to-br from-blue-50 to-purple-50 overflow-hidden">
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
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {activeTab === 'posts' ? 'No projects yet' : 'No liked projects yet'}
                </h3>
                <p className="text-gray-500">
                  {activeTab === 'posts' 
                    ? 'Start creating amazing projects!' 
                    : 'Explore the gallery and like some projects!'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

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