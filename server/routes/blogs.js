import express from 'express';
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleBlogFeatured
} from '../controllers/blogController.js';

const router = express.Router();

// GET /api/blogs - Get all blogs (with optional filters)
router.get('/', getAllBlogs);

// GET /api/blogs/:id - Get blog by ID
router.get('/:id', getBlogById);

// POST /api/blogs - Create new blog
router.post('/', createBlog);

// PUT /api/blogs/:id - Update blog
router.put('/:id', updateBlog);

// DELETE /api/blogs/:id - Delete blog
router.delete('/:id', deleteBlog);

// PUT /api/blogs/:id/featured - Toggle featured status
router.put('/:id/featured', toggleBlogFeatured);

export default router;
