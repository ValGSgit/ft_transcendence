import express from 'express';
import {
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
} from '../controllers/postController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All post routes require authentication
router.use(authenticate);

router.get('/', getPosts);
router.post('/', createPost);
router.get('/user/:userId', getUserPosts);
router.get('/username/:username', getUserPostsByUsername);
router.get('/:postId/comments', getPostComments);
router.post('/:postId/comments', addComment);
router.delete('/comments/:commentId', deleteComment);
router.put('/:postId', updatePost);
router.delete('/:postId', deletePost);
router.post('/:postId/like', likePost);
router.delete('/:postId/like', unlikePost);

export default router;
