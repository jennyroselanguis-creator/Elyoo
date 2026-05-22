const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all brands
router.get('/', async (req, res, next) => {
  try {
    const connection = await db.getConnection();
    const [brands] = await connection.execute(
      'SELECT * FROM brands ORDER BY name'
    );
    connection.release();

    res.json({
      success: true,
      data: brands,
      count: brands.length,
    });
  } catch (error) {
    next(error);
  }
});

// Create brand (Admin only)
router.post('/',
  authenticate,
  authorize(['admin']),
  [
    body('name').trim().notEmpty().isLength({ min: 2 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const { name } = req.body;
      const connection = await db.getConnection();

      const [result] = await connection.execute(
        'INSERT INTO brands (name) VALUES (?)',
        [name]
      );

      connection.release();

      res.status(201).json({
        success: true,
        message: 'Brand created successfully',
        data: { id: result.insertId, name },
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ 
          error: 'Brand already exists' 
        });
      }
      next(error);
    }
  }
);

// Update brand (Admin only)
router.put('/:id',
  authenticate,
  authorize(['admin']),
  [
    body('name').trim().notEmpty().isLength({ min: 2 }),
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      const connection = await db.getConnection();
      const [result] = await connection.execute(
        'UPDATE brands SET name=? WHERE id=?',
        [name, id]
      );

      connection.release();

      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          error: 'Brand not found' 
        });
      }

      res.json({
        success: true,
        message: 'Brand updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete brand (Admin only)
router.delete('/:id',
  authenticate,
  authorize(['admin']),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const connection = await db.getConnection();

      // Check if brand has products
      const [products] = await connection.execute(
        'SELECT COUNT(*) as count FROM products WHERE brand_id=?',
        [id]
      );

      if (products[0].count > 0) {
        connection.release();
        return res.status(400).json({ 
          error: 'Cannot delete brand with associated products' 
        });
      }

      const [result] = await connection.execute(
        'DELETE FROM brands WHERE id=?',
        [id]
      );

      connection.release();

      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          error: 'Brand not found' 
        });
      }

      res.json({
        success: true,
        message: 'Brand deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
