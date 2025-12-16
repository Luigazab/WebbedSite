import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Edit, Trash2, Save, X, Award, TrendingUp, Eye, ThumbsUp, MessageCircle } from 'lucide-react';
import { supabase } from '../../supabaseClient';

export default function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', bio: '', role: '', avatar_url: '' });
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [userProjects, setUserProjects] = useState([]);
  const [userStats, setUserStats] = useState({
    totalProjects: 0,
    publicProjects: 0,
    totalLikes: 0,
    totalViews: 0
  });

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);

      // Fetch user profile
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      setUser(userData);
      setEditForm({
        username: userData.username || '',
        bio: userData.bio || '',
        role: userData.role || 'user',
        avatar_url: userData.avatar_url || ''
      });

      // Fetch user's projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (projectsError) throw projectsError;
      setUserProjects(projects || []);

      // Calculate stats
      const totalLikes = projects?.reduce((sum, p) => sum + (p.likes_count || 0), 0) || 0;
      const totalViews = projects?.reduce((sum, p) => sum + (p.views_count || 0), 0) || 0;
      const publicProjects = projects?.filter(p => p.is_public).length || 0;

      setUserStats({
        totalProjects: projects?.length || 0,
        publicProjects,
        totalLikes,
        totalViews
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
      alert('Error loading user details');
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (file) => {
    try {
      setUploading(true);

      if (user.avatar_url && user.avatar_url.includes('supabase')) {
        const oldPath = user.avatar_url.split('/').slice(-2).join('/');
        await supabase.storage.from('avatars').remove([oldPath]);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

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

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB');
      return;
    }

    setAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setEditForm({ ...editForm, avatar_url: previewUrl });
  };

  const handleUpdateUser = async () => {
    setSaving(true);
    try {
      let avatarUrl = editForm.avatar_url;

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
          role: editForm.role,
          avatar_url: avatarUrl
        })
        .eq('id', userId);

      if (error) throw error;

      setIsEditing(false);
      setAvatarFile(null);
      setUser({ ...user, ...editForm, avatar_url: avatarUrl });
      alert('User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm('Are you sure you want to delete this user? This will also delete all their projects and related data.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      alert('User deleted successfully!');
      navigate('/admin/users');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
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
    if (stats.totalProjects >= 1) badges.push({ icon: '🎨', name: 'First Project' });
    if (stats.publicProjects >= 1) badges.push({ icon: '🌟', name: 'Contributor' });
    if (stats.totalLikes >= 10) badges.push({ icon: '❤️', name: 'Popular' });
    if (stats.totalViews >= 100) badges.push({ icon: '👁️', name: 'Trending' });
    if (stats.totalProjects >= 10) badges.push({ icon: '🏆', name: 'Productive' });
    if (stats.publicProjects >= 5) badges.push({ icon: '🎯', name: 'Influencer' });
    return badges;
  };

  const progressInfo = user ? getProgressLevel(userStats.totalProjects) : null;
  const badges = user ? getBadges(userStats) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-500 mb-4">User not found</p>
        <button
          onClick={() => navigate('/admin/users')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/users')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
                <p className="text-sm text-gray-600">Admin view</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <Edit size={16} />
                    Edit User
                  </button>
                  <button
                    onClick={handleDeleteUser}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Side - Profile Info */}
          <div className="lg:w-80 shrink-0 space-y-6">
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
                        className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-gray-200"
                      />
                    ) : (
                      <div className="w-32 h-32 mx-auto rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold border-4 border-gray-200">
                        {getInitial(editForm.username)}
                      </div>
                    )}
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Avatar
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      disabled={uploading}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Max 2MB</p>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-white text-gray-500">OR</span>
                    </div>
                  </div>

                  {/* Avatar URL */}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                      placeholder="https://..."
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                      rows="3"
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {/* Save/Cancel */}
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={handleUpdateUser}
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Save size={16} />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setAvatarFile(null);
                        setEditForm({
                          username: user.username || '',
                          bio: user.bio || '',
                          role: user.role || 'user',
                          avatar_url: user.avatar_url || ''
                        });
                      }}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-2"
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
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.username}
                        className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-gray-200"
                      />
                    ) : (
                      <div className="w-32 h-32 mx-auto rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold border-4 border-gray-200">
                        {getInitial(user.username)}
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">{user.username}</h2>
                    <p className="text-sm text-gray-600">@{user.username}</p>
                    <span className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700 border border-purple-300' : 
                      user.role === 'moderator' ? 'bg-blue-100 text-blue-700 border border-blue-300' :
                      'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}>
                      {user.role}
                    </span>
                  </div>

                  {/* Bio */}
                  {user.bio && (
                    <p className="text-sm text-gray-700 mb-4 text-center">{user.bio}</p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-300 text-center">
                      <div className="text-xl font-bold text-gray-900">{userStats.totalProjects}</div>
                      <div className="text-xs text-gray-600">Projects</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-300 text-center">
                      <div className="text-xl font-bold text-gray-900">{userStats.publicProjects}</div>
                      <div className="text-xs text-gray-600">Public</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-300 text-center">
                      <div className="text-xl font-bold text-gray-900">{userStats.totalLikes}</div>
                      <div className="text-xs text-gray-600">Likes</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-300 text-center">
                      <div className="text-xl font-bold text-gray-900">{userStats.totalViews}</div>
                      <div className="text-xs text-gray-600">Views</div>
                    </div>
                  </div>

                  {/* Progress */}
                  {progressInfo && (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-300">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp size={14} className="text-gray-700" />
                          <span className="font-semibold text-xs text-gray-900">Level {progressInfo.level}</span>
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
                        {userStats.totalProjects} / {[5, 10, 20, 50, 50][progressInfo.level - 1]} projects
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Badges */}
            {badges.length > 0 && !isEditing && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Award size={16} className="text-yellow-500" />
                  <h3 className="font-bold text-sm text-gray-900">Achievements</h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {badges.map((badge, index) => (
                    <div
                      key={index}
                      className="bg-linear-to-br from-yellow-50 to-orange-50 rounded-lg p-2 text-center border border-yellow-200"
                    >
                      <div className="text-2xl mb-1">{badge.icon}</div>
                      <div className="text-xs font-semibold text-gray-700 leading-tight">{badge.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Account Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-bold text-sm text-gray-900 mb-3">Account Information</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">User ID:</span>
                  <span className="text-gray-900 font-mono">{user.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Joined:</span>
                  <span className="text-gray-900">{new Date(user.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 font-medium">Last Updated:</span>
                  <span className="text-gray-900">{new Date(user.updated_at || user.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Projects */}
          <div className="flex-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Projects ({userProjects.length})</h3>
              
              {userProjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {userProjects.map((project) => (
                    <div
                      key={project.id}
                      className="border border-gray-300 rounded-lg bg-white overflow-hidden hover:shadow-lg transition"
                    >
                      <div className="relative w-full h-32 bg-linear-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                        {project.generated_html ? (
                          <iframe
                            srcDoc={project.generated_html}
                            className="w-full h-full border-0 pointer-events-none scale-50 origin-top-left"
                            style={{ width: '200%', height: '200%' }}
                            title={project.title}
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

                      <div className="p-3">
                        <h4 className="font-semibold text-sm truncate mb-2">{project.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <ThumbsUp size={12} />
                            {project.likes_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle size={12} />
                            {project.comments_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye size={12} />
                            {project.views_count || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-5xl mb-2">📦</div>
                  <p className="text-gray-500">No projects yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}