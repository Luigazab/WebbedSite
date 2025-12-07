import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Award, Save, X } from 'lucide-react';
import { supabase } from '../../supabaseClient';

export default function BadgesManage() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [newBadge, setNewBadge] = useState({
    title: '',
    description: '',
    icon_url: ''
  });

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch earned count for each badge
      const badgesWithStats = await Promise.all(
        data.map(async (badge) => {
          const { count } = await supabase
            .from('achievements')
            .select('*', { count: 'exact', head: true })
            .eq('badge_earned', badge.id);

          return {
            ...badge,
            earnedCount: count || 0
          };
        })
      );

      setBadges(badgesWithStats);
    } catch (error) {
      console.error('Error fetching badges:', error);
      alert('Error fetching badges');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBadge = async () => {
    try {
      const { error } = await supabase
        .from('badges')
        .insert([newBadge]);

      if (error) throw error;

      setShowCreateModal(false);
      setNewBadge({ title: '', description: '', icon_url: '' });
      fetchBadges();
      alert('Badge created successfully!');
    } catch (error) {
      console.error('Error creating badge:', error);
      alert('Error creating badge');
    }
  };

  const handleUpdateBadge = async () => {
    try {
      const { error } = await supabase
        .from('badges')
        .update({
          title: editingBadge.title,
          description: editingBadge.description,
          icon_url: editingBadge.icon_url
        })
        .eq('id', editingBadge.id);

      if (error) throw error;

      setShowEditModal(false);
      setEditingBadge(null);
      fetchBadges();
      alert('Badge updated successfully!');
    } catch (error) {
      console.error('Error updating badge:', error);
      alert('Error updating badge');
    }
  };

  const handleDeleteBadge = async (badgeId) => {
    if (!confirm('Are you sure you want to delete this badge? This will also remove it from all users who earned it.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('badges')
        .delete()
        .eq('id', badgeId);

      if (error) throw error;

      fetchBadges();
      alert('Badge deleted successfully!');
    } catch (error) {
      console.error('Error deleting badge:', error);
      alert('Error deleting badge');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Badge Management</h2>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} />
            Create Badge
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {badges.length > 0 ? (
          badges.map(badge => (
            <div key={badge.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  {badge.icon_url ? (
                    <img src={badge.icon_url} alt={badge.title} className="w-12 h-12" />
                  ) : (
                    <Award size={40} className="text-yellow-600" />
                  )}
                </div>
                
                <h3 className="font-semibold text-lg mb-2">{badge.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{badge.description}</p>
                
                <div className="text-sm text-gray-500 mb-4">
                  Earned by <strong>{badge.earnedCount}</strong> users
                </div>

                <div className="flex items-center gap-2 w-full">
                  <button 
                    onClick={() => {
                      setEditingBadge(badge);
                      setShowEditModal(true);
                    }}
                    className="flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
                  >
                    <Edit size={16} className="mx-auto" />
                  </button>
                  <button 
                    onClick={() => handleDeleteBadge(badge.id)}
                    className="flex-1 p-2 text-red-600 hover:bg-red-50 rounded border border-red-200"
                  >
                    <Trash2 size={16} className="mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            No badges found. Create your first badge!
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Create Badge</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newBadge.title}
                  onChange={(e) => setNewBadge({...newBadge, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., First Project"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newBadge.description}
                  onChange={(e) => setNewBadge({...newBadge, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="3"
                  placeholder="Describe what this badge is awarded for..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon URL (optional)</label>
                <input
                  type="text"
                  value={newBadge.icon_url}
                  onChange={(e) => setNewBadge({...newBadge, icon_url: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="https://example.com/icon.png"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBadge}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Edit Badge</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editingBadge.title}
                  onChange={(e) => setEditingBadge({...editingBadge, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingBadge.description}
                  onChange={(e) => setEditingBadge({...editingBadge, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon URL</label>
                <input
                  type="text"
                  value={editingBadge.icon_url || ''}
                  onChange={(e) => setEditingBadge({...editingBadge, icon_url: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateBadge}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}