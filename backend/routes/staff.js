const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all staff (Admin only)
router.get('/',
  authenticate,
  authorize(['admin']),
  async (req, res, next) => {
    try {
      const connection = await db.getConnection();
      const [staff] = await connection.execute(
        'SELECT id, name, email, role, created_at FROM staff'
      );
      connection.release();

      res.json({
        success: true,
        data: staff,
        count: staff.length,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Create staff (Admin only)
router.post('/',
  authenticate,
  authorize(['admin']),
  [
    body('name').trim().notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['admin', 'staff']),
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

      const { name, email, password, role } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const connection = await db.getConnection();
      const [result] = await connection.execute(
        'INSERT INTO staff (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, role]
      );

      connection.release();

      res.status(201).json({
        success: true,
        message: 'Staff member created successfully',
        data: {
          id: result.insertId,
          name,
          email,
          role,
        },
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ 
          error: 'Email already exists' 
        });
      }
      next(error);
    }
  }
);

// Update staff (Admin only)
router.put('/:id',
  authenticate,
  authorize(['admin']),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, role } = req.body;

      const connection = await db.getConnection();
      const [result] = await connection.execute(
        'UPDATE staff SET name=?, role=? WHERE id=?',
        [name, role, id]
      );

      connection.release();

      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          error: 'Staff member not found' 
        });
      }

      res.json({
        success: true,
        message: 'Staff member updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete staff (Admin only)
router.delete('/:id',
  authenticate,
  authorize(['admin']),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const connection = await db.getConnection();
      const [result] = await connection.execute(
        'DELETE FROM staff WHERE id=?',
        [id]
      );

      connection.release();

      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          error: 'Staff member not found' 
        });
      }

      res.json({
        success: true,
        message: 'Staff member deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
