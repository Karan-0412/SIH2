import { useState, useEffect, useCallback } from 'react';
import { CommunityService, CommunityPost, CommunityComment, CommunityGroup } from '@/services/communityService';
import { useProfile } from '@/hooks/useProfile';

export const useCommunity = () => {
  const { profile } = useProfile();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = profile?.id;

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!userId) return;

    const postsSubscription = CommunityService.subscribeToPosts((payload) => {
      console.log('Posts update:', payload);
      // Reload posts when there are changes
      loadPosts();
    });

    const commentsSubscription = CommunityService.subscribeToComments((payload) => {
      console.log('Comments update:', payload);
      // Reload posts to get updated comment counts
      loadPosts();
    });

    const interactionsSubscription = CommunityService.subscribeToInteractions((payload) => {
      console.log('Interactions update:', payload);
      // Reload posts to get updated interaction counts
      loadPosts();
    });

    return () => {
      postsSubscription.unsubscribe();
      commentsSubscription.unsubscribe();
      interactionsSubscription.unsubscribe();
    };
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([loadPosts(), loadGroups()]);
    } catch (err) {
      console.error('Error loading community data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load community data');
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async (groupId?: string, category?: string) => {
    try {
      const postsData = await CommunityService.getPosts(groupId, category);
      
      // Load interactions for each post
      const postsWithInteractions = await Promise.all(
        postsData.map(async (post) => {
          const interactions = await CommunityService.getPostInteractions(post.id, userId);
          return { ...post, ...interactions };
        })
      );

      setPosts(postsWithInteractions);
    } catch (err) {
      console.error('Error loading posts:', err);
      throw err;
    }
  };

  const loadGroups = async () => {
    try {
      const groupsData = await CommunityService.getGroups(userId);
      setGroups(groupsData);
    } catch (err) {
      console.error('Error loading groups:', err);
      throw err;
    }
  };

  const createPost = useCallback(async (
    content: string,
    category: 'Academics' | 'Placements' | 'Clubs' | 'Events' | 'General',
    groupId?: string
  ) => {
    if (!userId) throw new Error('User not authenticated');
    
    try {
      const newPost = await CommunityService.createPost(userId, content, category, groupId);
      const interactions = await CommunityService.getPostInteractions(newPost.id, userId);
      const postWithInteractions = { ...newPost, ...interactions };
      
      setPosts(prev => [postWithInteractions, ...prev]);
      return newPost;
    } catch (err) {
      console.error('Error creating post:', err);
      throw err;
    }
  }, [userId]);

  const createComment = useCallback(async (postId: string, content: string) => {
    if (!userId) throw new Error('User not authenticated');
    
    try {
      const newComment = await CommunityService.createComment(postId, userId, content);
      
      // Update the post in the list to reflect the new comment
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, comments: [...(post.comments || []), newComment] }
          : post
      ));
      
      return newComment;
    } catch (err) {
      console.error('Error creating comment:', err);
      throw err;
    }
  }, [userId]);

  const togglePostInteraction = useCallback(async (
    postId: string,
    interactionType: 'upvote' | 'downvote' | 'bookmark'
  ) => {
    if (!userId) throw new Error('User not authenticated');
    
    try {
      await CommunityService.togglePostInteraction(postId, userId, interactionType);
      
      // Update local state
      setPosts(prev => prev.map(post => {
        if (post.id !== postId) return post;
        
        const newPost = { ...post };
        
        if (interactionType === 'upvote') {
          if (post.user_has_upvoted) {
            newPost.upvotes = (post.upvotes || 0) - 1;
            newPost.user_has_upvoted = false;
          } else {
            newPost.upvotes = (post.upvotes || 0) + 1;
            newPost.user_has_upvoted = true;
            if (post.user_has_downvoted) {
              newPost.downvotes = (post.downvotes || 0) - 1;
              newPost.user_has_downvoted = false;
            }
          }
        } else if (interactionType === 'downvote') {
          if (post.user_has_downvoted) {
            newPost.downvotes = (post.downvotes || 0) - 1;
            newPost.user_has_downvoted = false;
          } else {
            newPost.downvotes = (post.downvotes || 0) + 1;
            newPost.user_has_downvoted = true;
            if (post.user_has_upvoted) {
              newPost.upvotes = (post.upvotes || 0) - 1;
              newPost.user_has_upvoted = false;
            }
          }
        } else if (interactionType === 'bookmark') {
          newPost.user_has_bookmarked = !post.user_has_bookmarked;
          newPost.bookmarks = post.user_has_bookmarked 
            ? (post.bookmarks || 0) - 1 
            : (post.bookmarks || 0) + 1;
        }
        
        return newPost;
      }));
    } catch (err) {
      console.error('Error toggling post interaction:', err);
      throw err;
    }
  }, [userId]);

  const createGroup = useCallback(async (name: string, description: string) => {
    if (!userId) throw new Error('User not authenticated');
    
    try {
      const newGroup = await CommunityService.createGroup(name, description, userId);
      setGroups(prev => [newGroup, ...prev]);
      return newGroup;
    } catch (err) {
      console.error('Error creating group:', err);
      throw err;
    }
  }, [userId]);

  const joinGroup = useCallback(async (groupId: string) => {
    if (!userId) throw new Error('User not authenticated');
    
    try {
      await CommunityService.joinGroup(groupId, userId);
      setGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { ...group, is_member: true, member_count: (group.member_count || 0) + 1 }
          : group
      ));
    } catch (err) {
      console.error('Error joining group:', err);
      throw err;
    }
  }, [userId]);

  const leaveGroup = useCallback(async (groupId: string) => {
    if (!userId) throw new Error('User not authenticated');
    
    try {
      await CommunityService.leaveGroup(groupId, userId);
      setGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { ...group, is_member: false, member_count: Math.max(0, (group.member_count || 0) - 1) }
          : group
      ));
    } catch (err) {
      console.error('Error leaving group:', err);
      throw err;
    }
  }, [userId]);

  return {
    posts,
    groups,
    loading,
    error,
    createPost,
    createComment,
    togglePostInteraction,
    createGroup,
    joinGroup,
    leaveGroup,
    loadPosts,
    loadGroups,
    refresh: loadData,
  };
};
