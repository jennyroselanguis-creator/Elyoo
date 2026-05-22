const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const { generateOrderNumber } = require('../utils/helpers');

const router = express.Router();

// Create order (Public)
router.post('/',
  [
    body('customer_name').trim().notEmpty(),
    body('customer_email').isEmail(),
    body('customer_phone').trim().notEmpty(),
    body('items').isArray({ min: 1 }),
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

      const { customer_name, customer_email, customer_phone, items } = req.body;
      const order_number = generateOrderNumber();
      const total_amount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const connection = await db.getConnection();
      const [result] = await connection.execute(
        `INSERT INTO orders (order_number, customer_name, customer_email, customer_phone, total_amount, items, status)
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [order_number, customer_name, customer_email, customer_phone, total_amount, JSON.stringify(items)]
      );

      connection.release();

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: {
          id: result.insertId,
          order_number,
          status: 'pending',
          total_amount,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get all orders (Admin only)
router.get('/',
  authenticate,
  authorize(['admin']),
  async (req, res, next) => {
    try {
      const connection = await db.getConnection();
      const [orders] = await connection.execute(
        'SELECT * FROM orders ORDER BY created_at DESC'
      );

      // Parse items JSON
      const parsedOrders = orders.map(order => ({
        ...order,
        items: JSON.parse(order.items),
      }));

      connection.release();

      res.json({
        success: true,
        data: parsedOrders,
        count: parsedOrders.length,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get single order (Admin only)
router.get('/:id',
  authenticate,
  authorize(['admin']),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const connection = await db.getConnection();
      const [orders] = await connection.execute(
        'SELECT * FROM orders WHERE id=?',
        [id]
      );

      connection.release();

      if (orders.length === 0) {
        return res.status(404).json({ 
          error: 'Order not found' 
        });
      }

      const order = {
        ...orders[0],
        items: JSON.parse(orders[0].items),
      };

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update order status (Admin only)
router.put('/:id',
  authenticate,
  authorize(['admin']),
  [
    body('status').isIn(['pending', 'processing', 'shipped', 'delivered']),
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

      const { id } = req.params;
      const { status } = req.body;

      const connection = await db.getConnection();
      const [result] = await connection.execute(
        'UPDATE orders SET status=? WHERE id=?',
        [status, id]
      );

      connection.release();

      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          error: 'Order not found' 
        });
      }

      res.json({
        success: true,
        message: 'Order updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
