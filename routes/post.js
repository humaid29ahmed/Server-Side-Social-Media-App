import express from "express";
import auth from "../middleware/auth.js"
import { createPost,commentPost,getPosts,getPost,getPostsBySearch, updatePost, deletePost, likePost } from "../controllers/posts.js";

const router = express.Router();

router.get('/', getPosts);
router.get('/post/:id', getPost);
router.get('/search',getPostsBySearch);
router.post('/',auth, createPost);
router.patch('/:id',auth, updatePost);
router.delete('/:id',auth,  deletePost);
router.patch('/:id/likePost',auth, likePost);
router.post('/:id/commentPost',auth, commentPost);

export default router;