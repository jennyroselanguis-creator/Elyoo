const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all products
router.get('/', async (req, res, next) => {
  try {
    const connection = await db.getConnection();
    const [products] = await connection.execute(`
      SELECT p.*, b.name as brand_name 
      FROM products p 
      JOIN brands b ON p.brand_id = b.id 
      ORDER BY b.name, p.name
    `);
    connection.release();

    res.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    next(error);
  }
});

// Get single product
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const connection = await db.getConnection();
    const [products] = await connection.execute(`
      SELECT p.*, b.name as brand_name 
      FROM products p 
      JOIN brands b ON p.brand_id = b.id 
      WHERE p.id = ?
    `, [id]);
    connection.release();

    if (products.length === 0) {
      return res.status(404).json({ 
        error: 'Product not found' 
      });
    }

    res.json({
      success: true,
      data: products[0],
    });
  } catch (error) {
    next(error);
  }
});

// Create product (Admin only)
router.post('/', 
  authenticate,
  authorize(['admin']),
  [
    body('brand_id').isInt({ min: 1 }),
    body('name').trim().notEmpty(),
    body('price').isFloat({ min: 0 }),
    body('stock').isInt({ min: 0 }),
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

      const { brand_id, name, model, price, specs, stock, image } = req.body;
      const connection = await db.getConnection();

      const [result] = await connection.execute(
        `INSERT INTO products (brand_id, name, model, price, specs, stock, image) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [brand_id, name, model, price, specs, stock, image]
      );

      connection.release();

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: { id: result.insertId, ...req.body },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update product (Admin only)
router.put('/:id',
  authenticate,
  authorize(['admin']),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { brand_id, name, model, price, specs, stock, image } = req.body;

      const connection = await db.getConnection();
      const [result] = await connection.execute(
        `UPDATE products 
         SET brand_id=?, name=?, model=?, price=?, specs=?, stock=?, image=?
         WHERE id=?`,
        [brand_id, name, model, price, specs, stock, image, id]
      );

      connection.release();

      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          error: 'Product not found' 
        });
      }

      res.json({
        success: true,
        message: 'Product updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete product (Admin only)
router.delete('/:id',
  authenticate,
  authorize(['admin']),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const connection = await db.getConnection();
      const [result] = await connection.execute(
        'DELETE FROM products WHERE id=?',
        [id]
      );
      connection.release();

      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          error: 'Product not found' 
        });
      }

      res.json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
