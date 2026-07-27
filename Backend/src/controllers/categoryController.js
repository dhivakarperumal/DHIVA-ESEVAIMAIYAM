const { getDB } = require('../config/db');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public/Private
exports.getAllCategories = async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.execute('SELECT * FROM categories ORDER BY created_at ASC');
    
    // Parse subcategories from JSON string to array
    const categories = rows.map(row => {
      let parsedSubcats = [];
      try {
        parsedSubcats = row.subcategories ? JSON.parse(row.subcategories) : [];
      } catch (e) {
        console.error('Failed to parse subcategories for cid:', row.cid);
      }
      return {
        ...row,
        subcategories: parsedSubcats
      };
    });

    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error('Error in getAllCategories:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private (Admin)
exports.createCategory = async (req, res) => {
  try {
    const { name, image, description, subcategories, status } = req.body;
    const db = getDB();

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    // Auto-generate cid
    const [lastRows] = await db.execute('SELECT cid FROM categories ORDER BY id DESC LIMIT 1');
    let nextNum = 1;
    if (lastRows.length > 0 && lastRows[0].cid) {
      const match = lastRows[0].cid.match(/CAT(\d+)/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }
    const cid = `CAT${String(nextNum).padStart(3, '0')}`;
    const subcatsJson = JSON.stringify(subcategories || []);

    const [result] = await db.execute(
      'INSERT INTO categories (cid, name, image, description, subcategories, status) VALUES (?, ?, ?, ?, ?, ?)',
      [cid, name, image || null, description || '', subcatsJson, status || 'Active']
    );

    res.status(201).json({ 
      success: true, 
      data: { 
        id: result.insertId, 
        cid, 
        name, 
        image, 
        description, 
        subcategories: subcategories || [], 
        status 
      } 
    });
  } catch (error) {
    console.error('Error in createCategory:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
exports.updateCategory = async (req, res) => {
  try {
    const idParam = req.params.id; // Usually CID like 'CAT001'
    const { name, image, description, subcategories, status } = req.body;
    const db = getDB();

    // Check if category exists
    const [existing] = await db.execute('SELECT id FROM categories WHERE cid = ? OR id = ?', [idParam, idParam]);
    
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const subcatsJson = JSON.stringify(subcategories || []);

    await db.execute(
      'UPDATE categories SET name = ?, image = ?, description = ?, subcategories = ?, status = ? WHERE cid = ? OR id = ?',
      [name, image || null, description || '', subcatsJson, status || 'Active', idParam, idParam]
    );

    res.status(200).json({ success: true, message: 'Category updated successfully' });
  } catch (error) {
    console.error('Error in updateCategory:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
exports.deleteCategory = async (req, res) => {
  try {
    const idParam = req.params.id;
    const db = getDB();

    const [existing] = await db.execute('SELECT id FROM categories WHERE cid = ? OR id = ?', [idParam, idParam]);
    
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await db.execute('DELETE FROM categories WHERE cid = ? OR id = ?', [idParam, idParam]);

    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error in deleteCategory:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
