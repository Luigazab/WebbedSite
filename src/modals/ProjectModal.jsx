import { Edit, Eye, EyeOff, MessageCircleMore, Send, ThumbsUp } from "lucide-react";
import ModalLayout from "../layouts/ModalLayout";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { createNotification, createCommentNotification, createLikeNotification } from "../utils/createNotification";


export default function ProjectModal({ isOpen, onClose, title, description, likes, comments, id, srcDoc, isPublic, projectOwnerId }) {
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [projectComments, setProjectComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [visibility, setVisibility] = useState(isPublic);
  const [likesCount, setLikesCount] = useState(likes);
  const [hasLiked, setHasLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && id) {
      loadCurrentUser();
      loadComments();
      checkIfLiked();
    }
  }, [isOpen, id]);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      setIsOwner(user.id === projectOwnerId);
    }
  };

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (username)
        `)
        .eq('project_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjectComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const checkIfLiked = async () => {
    if (!currentUserId) return;
    
    try {
      const { data, error } = await supabase
        .from('project_likes')
        .select('id')
        .eq('project_id', id)
        .eq('user_id', currentUserId)
        .single();

      setHasLiked(!!data);
    } catch (error) {
      // Not liked yet
      setHasLiked(false);
    }
  };

  const toggleVisibility = async () => {
    if (!isOwner) return;

    try {
      const newVisibility = !visibility;
      const { error } = await supabase
        .from('projects')
        .update({ is_public: newVisibility })
        .eq('id', id);

      if (error) throw error;
      setVisibility(newVisibility);
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  const toggleLike = async () => {
    if (!currentUserId) return;

    try {
      if (hasLiked) {
        // Unlike
        const { error } = await supabase
          .from('project_likes')
          .delete()
          .eq('project_id', id)
          .eq('user_id', currentUserId);

        if (error) throw error;
        
        setHasLiked(false);
        setLikesCount(prev => prev - 1);
        
        // Update project likes_count
        await supabase
          .from('projects')
          .update({ likes_count: likesCount - 1 })
          .eq('id', id);
      } else {
        // Like
        const { error } = await supabase
          .from('project_likes')
          .insert([{ project_id: id, user_id: currentUserId }]);

        if (error) throw error;
        
        setHasLiked(true);
        setLikesCount(prev => prev + 1);
        
        // Update project likes_count
        await supabase
          .from('projects')
          .update({ likes_count: likesCount + 1 })
          .eq('id', id);

        const { data: userData } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', currentUserId)
          .single();

        if (userData) {
          await createLikeNotification(
            projectOwnerId, title, currentUserId, userData.username, id
          );
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };
  const postComment = async () => {
    if (!newComment.trim() || !currentUserId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          project_id: id,
          user_id: currentUserId,
          content: newComment.trim()
        }])
        .select(`
          *,
          profiles:user_id (username)
        `)
        .single();

      if (error) throw error;

      setProjectComments(prev => [data, ...prev]);
      setNewComment('');
      
      // Update comments count
      await supabase
        .from('projects')
        .update({ comments_count: projectComments.length + 1 })
        .eq('id', id);

      if (currentUserId !== projectOwnerId) {
        const { data: userData } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', currentUserId)
          .single();
        
        await createCommentNotification(
          projectOwnerId, 
          title, 
          currentUserId, 
          userData.username, 
          id
        );
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitial = (username) => {
    return username ? username.charAt(0).toUpperCase() : '?';
  };
  const getRandomColor = (str) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
      'bg-pink-500', 'bg-yellow-500', 'bg-red-500',
      'bg-indigo-500', 'bg-teal-500', 'bg-orange-500'
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };
  return (
    <ModalLayout isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center justify-center p-4 gap-2 w-full">
        <div className="flex-1 h-[60vh] border rounded-lg bg-linear-to-br from-blue-100 to-purple-400">
          {srcDoc ? ( 
            <iframe srcDoc={srcDoc} title={`Preview of ${title}`} sandbox="allow-scripts"/>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No preview available
            </div>
          )}
        </div>
        <div className="w-2/5 flex flex-col p-6 h-full">
          <div className="space-y-2">
            <div className="space-y-4">
              <h3 className="font-semibold text-xl text-gray-900">{title}</h3>
              <div className="flex items-center gap-4 text-sm">
                <button
                  onClick={toggleLike}
                  disabled={!currentUserId}
                  className={`flex items-center gap-1 font-medium transition ${
                    hasLiked 
                      ? 'text-green-600' 
                      : 'text-gray-500 hover:text-green-600'
                  }`}
                >
                  <ThumbsUp size={16} fill={hasLiked ? 'currentColor' : 'none'} />
                  {likesCount}
                </button>
                
                <p className="flex items-center gap-1 text-gray-500 font-medium">
                  <MessageCircleMore size={16}/>
                  {projectComments.length}
                </p>

                {isOwner && (
                  <button
                    onClick={toggleVisibility}
                    className={`flex items-center gap-1 font-medium transition ${
                      visibility 
                        ? 'text-green-600' 
                        : 'text-gray-500'
                    }`}
                  >
                    {visibility ? (
                      <>
                        <Eye size={16} />
                        Public
                      </>
                    ) : (
                      <>
                        <EyeOff size={16} />
                        Private
                      </>
                    )}
                  </button>
                )}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed bg-gray-200 p-4 rounded-2xl">{description || 'No description provided'}</p>
            </div>
            {isOwner && (
            <div className="flex gap-3 items-center">
              <button onClick={() => { navigate(`/editor/${id}`)}} className="flex items-center gap-2 bg-blue-600 text-white font-medium px-5 py-2.5 rounded-full hover:bg-blue-700 transition"><Edit size={16}/> Edit</button>
              <button className="flex items-center gap-2 bg-orange-500 text-white font-medium px-5 py-2.5 rounded-full hover:bg-orange-600 transition"><Send size={16}/> Post in Gallery</button>
            </div>
            )}
          </div>
          <hr className="my-4"/>
          <div className="flex-1 overflow-hidden flex flex-col">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Comments</h4>
            
            {/* Comment Input */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && postComment()}
                placeholder="Add a comment..."
                disabled={!currentUserId || loading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              <button
                onClick={postComment}
                disabled={!newComment.trim() || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </div>
            
            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {projectComments.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No comments yet</p>
              ) : (
                projectComments.map((comment) => (
                  <div key={comment.id} className="flex gap-2">
                    <div 
                      className={`shrink-0 w-10 h-10 rounded-full ${getRandomColor(comment.profiles?.username || 'user')} flex items-center justify-center text-white font-semibold`}
                    >
                      {getInitial(comment.profiles?.username)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h6 className="text-sm font-semibold text-gray-900">
                          {comment.profiles?.username || 'Unknown User'}
                        </h6>
                        <span className="text-xs text-gray-400">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 wrap-break-word">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </ModalLayout>
  );
}