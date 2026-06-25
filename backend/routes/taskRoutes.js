const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  searchTasks
} = require('../controllers/taskController');

// All routes require authentication
router.use(protect);

// Search route (must come before /:id)
router.get('/search', searchTasks);

// Get all tasks
router.get('/', getTasks);

// Get single task
router.get('/:id', getTaskById);

// Create task
router.post(
  '/',
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 100 })
      .withMessage('Title cannot exceed 100 characters'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('deadline')
      .isISO8601()
      .withMessage('Please provide a valid date'),
    body('priority')
      .isIn(['Low', 'Medium', 'High'])
      .withMessage('Priority must be Low, Medium, or High'),
    body('status')
      .isIn(['Pending', 'In Progress', 'Completed'])
      .withMessage('Status must be Pending, In Progress, or Completed')
  ],
  createTask
);

// Update task
router.put(
  '/:id',
  [
    body('title')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Title cannot exceed 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('deadline')
      .optional()
      .isISO8601()
      .withMessage('Please provide a valid date'),
    body('priority')
      .optional()
      .isIn(['Low', 'Medium', 'High'])
      .withMessage('Priority must be Low, Medium, or High'),
    body('status')
      .optional()
      .isIn(['Pending', 'In Progress', 'Completed'])
      .withMessage('Status must be Pending, In Progress, or Completed')
  ],
  updateTask
);

// Delete task
router.delete('/:id', deleteTask);

module.exports = router;