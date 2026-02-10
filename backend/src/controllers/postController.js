import Post from '../models/Post.js';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getPosts = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const userId = req.user.id;

    const posts = Post.getFeed(userId, ['public', 'friends'], parseInt(limit), parseInt(offset));

    return successResponse(res, {
      posts,
      count: posts.length
    });
  } catch (error) {
    console.error('Get posts error:', error);
    return errorResponse(res, 'Failed to get posts', 500);
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    const currentUserId = req.user.id;

    const posts = Post.getUserPosts(parseInt(userId), currentUserId, parseInt(limit), parseInt(offset));

    return successResponse(res, {
      posts,
      count: posts.length
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    return errorResponse(res, 'Failed to get user posts', 500);
  }
};

export const getUserPostsByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    const currentUserId = req.user.id;

    // Find user by username first
    const user = User.findByUsername(username);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const posts = Post.getUserPosts(user.id, currentUserId, parseInt(limit), parseInt(offset));

    return successResponse(res, {
      posts,
      count: posts.length
    });
  } catch (error) {
    console.error('Get user posts by username error:', error);
    return errorResponse(res, 'Failed to get user posts', 500);
  }
};

export const createPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { content, type, visibility, image, farmData } = req.body;

    if (!content || content.trim().length === 0) {
      return errorResponse(res, 'Post content is required', 400);
    }

    if (content.length > 5000) {
      return errorResponse(res, 'Post content too long (max 5000 characters)', 400);
    }

    const post = Post.create({
      userId,
      content: content.trim(),
      type: type || 'text',
      visibility: visibility || 'public',
      image,
      farmData
    });

    return successResponse(res, { post }, 'Post created successfully', 201);
  } catch (error) {
    console.error('Create post error:', error);
    return errorResponse(res, 'Failed to create post', 500);
  }
};

export const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const { content, visibility, image } = req.body;

    const post = Post.findById(parseInt(postId));
    if (!post) {
      return errorResponse(res, 'Post not found', 404);
    }

    if (post.user_id !== userId) {
      return errorResponse(res, 'Unauthorized to update this post', 403);
    }

    const updatedPost = Post.update(parseInt(postId), userId, {
      content,
      visibility,
      image
    });

    return successResponse(res, { post: updatedPost }, 'Post updated successfully');
  } catch (error) {
    console.error('Update post error:', error);
    return errorResponse(res, 'Failed to update post', 500);
  }
};

export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = Post.findById(parseInt(postId));
    if (!post) {
      return errorResponse(res, 'Post not found', 404);
    }

    if (post.user_id !== userId) {
      return errorResponse(res, 'Unauthorized to delete this post', 403);
    }

    Post.delete(parseInt(postId), userId);

    return successResponse(res, null, 'Post deleted successfully');
  } catch (error) {
    console.error('Delete post error:', error);
    return errorResponse(res, 'Failed to delete post', 500);
  }
};

export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = Post.findById(parseInt(postId));
    if (!post) {
      return errorResponse(res, 'Post not found', 404);
    }

    const liked = Post.likePost(parseInt(postId), userId);

    return successResponse(res, { liked }, liked ? 'Post liked' : 'Already liked');
  } catch (error) {
    console.error('Like post error:', error);
    return errorResponse(res, 'Failed to like post', 500);
  }
};

export const unlikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const unliked = Post.unlikePost(parseInt(postId), userId);

    return successResponse(res, { unliked }, unliked ? 'Post unliked' : 'Not liked');
  } catch (error) {
    console.error('Unlike post error:', error);
    return errorResponse(res, 'Failed to unlike post', 500);
  }
};

export const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const post = Post.findById(parseInt(postId));
    if (!post) {
      return errorResponse(res, 'Post not found', 404);
    }

    const comments = Post.getComments(parseInt(postId), parseInt(limit), parseInt(offset));

    return successResponse(res, {
      comments,
      count: comments.length
    });
  } catch (error) {
    console.error('Get comments error:', error);
    return errorResponse(res, 'Failed to get comments', 500);
  }
};

export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return errorResponse(res, 'Comment content is required', 400);
    }

    if (content.length > 1000) {
      return errorResponse(res, 'Comment too long (max 1000 characters)', 400);
    }

    const post = Post.findById(parseInt(postId));
    if (!post) {
      return errorResponse(res, 'Post not found', 404);
    }

    const comment = Post.addComment(parseInt(postId), userId, content.trim());

    return successResponse(res, { comment }, 'Comment added successfully', 201);
  } catch (error) {
    console.error('Add comment error:', error);
    return errorResponse(res, 'Failed to add comment', 500);
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    Post.deleteComment(parseInt(commentId), userId);

    return successResponse(res, null, 'Comment deleted successfully');
  } catch (error) {
    console.error('Delete comment error:', error);
    return errorResponse(res, 'Failed to delete comment', 500);
  }
};

export default {
  getPosts,
  getUserPosts,
  getUserPostsByUsername,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  getPostComments,
  addComment,
  deleteComment
};
