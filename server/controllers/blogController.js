import Database from '../models/database.js';

const db = new Database();

export const getAllBlogs = async (req, res) => {
  try {
    const { category, featured, status } = req.query;
    
    let sql = 'SELECT * FROM blogs WHERE 1=1';
    let params = [];
    
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    
    if (featured !== undefined) {
      sql += ' AND featured = ?';
      params.push(featured === 'true' ? 1 : 0);
    }
    
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY published_at DESC';
    
    const blogs = await db.query(sql, params);
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await db.get('SELECT * FROM blogs WHERE id = ?', [id]);
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    res.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
};

export const createBlog = async (req, res) => {
  try {
    const { title, description, content, image_url, author, read_time, category, tags, featured, status } = req.body;
    
    const result = await db.run(
      'INSERT INTO blogs (title, description, content, image_url, author, read_time, category, tags, featured, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, content, image_url, author, read_time, category, tags, featured ? 1 : 0, status || 'published']
    );
    
    res.status(201).json({ id: result.id, message: 'Blog created successfully' });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ error: 'Failed to create blog' });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, content, image_url, author, read_time, category, tags, featured, status } = req.body;
    
    const result = await db.run(
      'UPDATE blogs SET title = ?, description = ?, content = ?, image_url = ?, author = ?, read_time = ?, category = ?, tags = ?, featured = ?, status = ? WHERE id = ?',
      [title, description, content, image_url, author, read_time, category, tags, featured ? 1 : 0, status, id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    res.json({ message: 'Blog updated successfully' });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ error: 'Failed to update blog' });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.run('DELETE FROM blogs WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ error: 'Failed to delete blog' });
  }
};

export const toggleBlogFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    
    const blog = await db.get('SELECT featured FROM blogs WHERE id = ?', [id]);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    const newFeatured = blog.featured ? 0 : 1;
    await db.run('UPDATE blogs SET featured = ? WHERE id = ?', [newFeatured, id]);
    
    res.json({ message: 'Blog featured status updated', featured: newFeatured });
  } catch (error) {
    console.error('Error toggling blog featured status:', error);
    res.status(500).json({ error: 'Failed to update blog featured status' });
  }
};
