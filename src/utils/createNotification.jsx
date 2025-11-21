import { supabase } from '../supabaseClient';

/**
 * Create a notification for a user
 * @param {string} userId - The user who will receive the notification
 * @param {string} type - Type of notification: 'like', 'comment', 'follow'
 * @param {string} content - The notification message
 * @param {string} projectId - Optional project ID
 * @param {string} fromUserId - The user who triggered the notification
 */
export const createNotification = async (userId, type, content, projectId = null, fromUserId) => {
  try {
    if (userId === fromUserId) return;

    const { error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        type,
        content,
        project_id: projectId,
        from_user_id: fromUserId,
        is_read: false
      }]);

    if (error) throw error;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

/**
 * Create a like notification
 */
export const createLikeNotification = async (projectOwnerId, projectTitle, currentUserId, currentUsername, projectId) => {
  await createNotification(
    projectOwnerId,
    'like',
    `${currentUsername} liked your project "${projectTitle}"`,
    projectId,
    currentUserId
  );
};

/**
 * Create a comment notification
 */
export const createCommentNotification = async (projectOwnerId, projectTitle, currentUserId, currentUsername, projectId) => {
  await createNotification(
    projectOwnerId,
    'comment',
    `${currentUsername} commented on your project "${projectTitle}"`,
    projectId,
    currentUserId
  );
};

/**
 * Create a follow notification
 */
export const createFollowNotification = async (followedUserId, currentUserId, currentUsername) => {
  await createNotification(
    followedUserId,
    'follow',
    `${currentUsername} started following you`,
    null,
    currentUserId
  );
};