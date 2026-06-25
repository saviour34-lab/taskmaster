const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  deadline: {
    type: Date,
    required: [true, 'Please provide a deadline']
  },
  priority: {
    type: String,
    required: [true, 'Please select a priority'],
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  status: {
    type: String,
    required: [true, 'Please select a status'],
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

taskSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Task', taskSchema);