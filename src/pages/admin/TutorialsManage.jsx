import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ChevronDown, ChevronUp, Save, X } from 'lucide-react';
import { supabase } from '../../supabaseClient';

export default function TutorialsManage() {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTutorial, setExpandedTutorial] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState(null);
  const [newTutorial, setNewTutorial] = useState({
    title: '',
    description: '',
    difficulty_level: 'beginner'
  });

  useEffect(() => {
    fetchTutorials();
  }, []);

  const fetchTutorials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tutorials')
        .select(`
          id,
          title,
          description,
          difficulty_level,
          order_index,
          created_at,
          tutorial_steps (
            id,
            instruction_text,
            expected_output,
            hint,
            step_order
          )
        `)
        .order('order_index', { ascending: true });

      if (error) throw error;

      // Fetch completion count for each tutorial
      const tutorialsWithStats = await Promise.all(
        data.map(async (tutorial) => {
          const { count } = await supabase
            .from('user_progress')
            .select('*', { count: 'exact', head: true })
            .eq('tutorial_id', tutorial.id)
            .eq('is_completed', true);

          return {
            ...tutorial,
            completions: count || 0,
            stepCount: tutorial.tutorial_steps?.length || 0
          };
        })
      );

      setTutorials(tutorialsWithStats);
    } catch (error) {
      console.error('Error fetching tutorials:', error);
      alert('Error fetching tutorials');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTutorial = async () => {
    try {
      const { error } = await supabase
        .from('tutorials')
        .insert([newTutorial]);

      if (error) throw error;

      setShowCreateModal(false);
      setNewTutorial({ title: '', description: '', difficulty_level: 'beginner' });
      fetchTutorials();
      alert('Tutorial created successfully!');
    } catch (error) {
      console.error('Error creating tutorial:', error);
      alert('Error creating tutorial');
    }
  };

  const handleUpdateTutorial = async () => {
    try {
      const { error } = await supabase
        .from('tutorials')
        .update({
          title: editingTutorial.title,
          description: editingTutorial.description,
          difficulty_level: editingTutorial.difficulty_level
        })
        .eq('id', editingTutorial.id);

      if (error) throw error;

      setShowEditModal(false);
      setEditingTutorial(null);
      fetchTutorials();
      alert('Tutorial updated successfully!');
    } catch (error) {
      console.error('Error updating tutorial:', error);
      alert('Error updating tutorial');
    }
  };

  const handleDeleteTutorial = async (tutorialId) => {
    if (!confirm('Are you sure you want to delete this tutorial? This will also delete all its steps.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tutorials')
        .delete()
        .eq('id', tutorialId);

      if (error) throw error;

      fetchTutorials();
      alert('Tutorial deleted successfully!');
    } catch (error) {
      console.error('Error deleting tutorial:', error);
      alert('Error deleting tutorial');
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-700';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
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
          <h2 className="text-xl font-semibold">Tutorial Management</h2>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} />
            Create Tutorial
          </button>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        {tutorials.length > 0 ? (
          tutorials.map(tutorial => (
            <div key={tutorial.id} className="border rounded-lg overflow-hidden">
              <div className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{tutorial.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{tutorial.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(tutorial.difficulty_level)}`}>
                        {tutorial.difficulty_level}
                      </span>
                      <span>{tutorial.stepCount} steps</span>
                      <span>{tutorial.completions} completions</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setExpandedTutorial(expandedTutorial === tutorial.id ? null : tutorial.id)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                    >
                      {expandedTutorial === tutorial.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    <button 
                      onClick={() => {
                        setEditingTutorial(tutorial);
                        setShowEditModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteTutorial(tutorial.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {expandedTutorial === tutorial.id && tutorial.tutorial_steps && (
                <div className="border-t bg-gray-50 p-4">
                  <h4 className="font-medium mb-3">Tutorial Steps</h4>
                  <div className="space-y-2">
                    {tutorial.tutorial_steps
                      .sort((a, b) => a.step_order - b.step_order)
                      .map((step, index) => (
                        <div key={step.id} className="bg-white p-3 rounded border">
                          <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <p className="text-sm text-gray-700">{step.instruction_text}</p>
                              {step.hint && (
                                <p className="text-xs text-gray-500 mt-1">💡 {step.hint}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            No tutorials found. Create your first tutorial!
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Create Tutorial</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newTutorial.title}
                  onChange={(e) => setNewTutorial({...newTutorial, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., Introduction to HTML"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newTutorial.description}
                  onChange={(e) => setNewTutorial({...newTutorial, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="3"
                  placeholder="Describe what this tutorial covers..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
                <select
                  value={newTutorial.difficulty_level}
                  onChange={(e) => setNewTutorial({...newTutorial, difficulty_level: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
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
                onClick={handleCreateTutorial}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Edit Tutorial</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editingTutorial.title}
                  onChange={(e) => setEditingTutorial({...editingTutorial, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingTutorial.description}
                  onChange={(e) => setEditingTutorial({...editingTutorial, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
                <select
                  value={editingTutorial.difficulty_level}
                  onChange={(e) => setEditingTutorial({...editingTutorial, difficulty_level: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
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
                onClick={handleUpdateTutorial}
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