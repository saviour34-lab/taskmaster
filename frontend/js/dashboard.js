document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token || !user) {
    window.location.href = 'login.html';
    return;
  }

  const API_URL = window.API_URL || 'http://localhost:5000/api';

  document.getElementById('userDisplay').textContent = `👋 ${user.username}`;
  document.getElementById('logoutBtn').addEventListener('click', logout);

  loadTasks();

  document.getElementById('showAddTaskBtn').addEventListener('click', () => openModal());
  document.getElementById('taskForm').addEventListener('submit', handleTaskSubmit);
  document.querySelector('.close').addEventListener('click', closeModal);
  document.getElementById('searchInput').addEventListener('input', handleSearch);
  document.getElementById('filterPriority').addEventListener('change', loadTasks);
  document.getElementById('filterStatus').addEventListener('change', loadTasks);

  async function loadTasks() {
    try {
      const priority = document.getElementById('filterPriority').value;
      const status = document.getElementById('filterStatus').value;
      const search = document.getElementById('searchInput').value;

      let url = `${API_URL}/tasks?`;
      if (priority) url += `priority=${priority}&`;
      if (status) url += `status=${status}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;
      url = url.slice(0, -1);

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          return;
        }
        throw new Error('Failed to fetch tasks');
      }
      const tasks = await response.json();
      renderTasks(tasks);
      updateStats(tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      showError('Failed to load tasks');
    }
  }

  function renderTasks(tasks) {
    const taskList = document.getElementById('taskList');
    
    if (!tasks || tasks.length === 0) {
      taskList.innerHTML = `
        <div style="text-align: center; padding: 40px; background: white; border-radius: 15px;">
          <p style="color: #666;">No tasks found. Create your first task!</p>
        </div>
      `;
      return;
    }

    taskList.innerHTML = tasks.map(task => `
      <div class="task-card priority-${task.priority.toLowerCase()}">
        <h3>${escapeHtml(task.title)}</h3>
        <p>${escapeHtml(task.description)}</p>
        <div class="task-meta">
          <div>
            <span class="task-status status-${task.status.toLowerCase().replace(' ', '-')}">
              ${task.status}
            </span>
            <span style="margin-left: 10px; font-size: 0.9rem; color: #666;">
              📅 ${new Date(task.deadline).toLocaleDateString()}
            </span>
          </div>
          <div class="task-actions">
            <button class="btn-edit" onclick="editTask('${task._id}')">✏️ Edit</button>
            <button class="btn-delete" onclick="deleteTask('${task._id}')">🗑️ Delete</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function updateStats(tasks) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const pending = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
    const highPriority = tasks.filter(t => t.priority === 'High').length;

    document.getElementById('totalTasks').textContent = total;
    document.getElementById('completedTasks').textContent = completed;
    document.getElementById('pendingTasks').textContent = pending;
    document.getElementById('highPriorityTasks').textContent = highPriority;
  }

  function openModal(task = null) {
    const modal = document.getElementById('taskModal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('taskForm');
    
    if (task) {
      title.textContent = 'Edit Task';
      document.getElementById('taskId').value = task._id;
      document.getElementById('taskTitle').value = task.title;
      document.getElementById('taskDescription').value = task.description;
      document.getElementById('taskDeadline').value = new Date(task.deadline).toISOString().split('T')[0];
      document.getElementById('taskPriority').value = task.priority;
      document.getElementById('taskStatus').value = task.status;
    } else {
      title.textContent = 'Add New Task';
      form.reset();
      document.getElementById('taskId').value = '';
      document.getElementById('taskDeadline').value = '';
    }
    
    modal.classList.add('show');
  }

  function closeModal() {
    document.getElementById('taskModal').classList.remove('show');
  }

  async function handleTaskSubmit(e) {
    e.preventDefault();
    
    const taskId = document.getElementById('taskId').value;
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const deadline = document.getElementById('taskDeadline').value;
    const priority = document.getElementById('taskPriority').value;
    const status = document.getElementById('taskStatus').value;

    const taskData = { title, description, deadline, priority, status };

    try {
      const url = taskId ? `${API_URL}/tasks/${taskId}` : `${API_URL}/tasks`;
      const method = taskId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          return;
        }
        throw new Error('Failed to save task');
      }
      
      closeModal();
      loadTasks();
    } catch (error) {
      console.error('Error saving task:', error);
      showError('Failed to save task');
    }
  }

  window.editTask = async function(id) {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) {
        if (response.status === 401) {
          logout();
          return;
        }
        throw new Error('Failed to fetch task');
      }
      const task = await response.json();
      openModal(task);
    } catch (error) {
      console.error('Error fetching task:', error);
      showError('Failed to fetch task for editing');
    }
  };

  window.deleteTask = async function(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          logout();
          return;
        }
        throw new Error('Failed to delete task');
      }
      loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      showError('Failed to delete task');
    }
  };

  function handleSearch() {
    loadTasks();
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #fed7d7;
      color: #c53030;
      padding: 15px 25px;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 3000;
      animation: slideIn 0.3s ease;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
  }
});