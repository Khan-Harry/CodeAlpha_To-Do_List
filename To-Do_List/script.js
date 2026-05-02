document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const tasksCount = document.getElementById('tasks-count');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const dateDisplay = document.getElementById('date-display');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';

    // Set Date
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    dateDisplay.textContent = new Date().toLocaleDateString('en-US', options);

    // Initial render
    renderTasks();

    // Event Listeners
    todoForm.addEventListener('submit', addTask);
    clearCompletedBtn.addEventListener('click', clearCompleted);
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateCount();
    }

    function addTask(e) {
        e.preventDefault();
        const text = todoInput.value.trim();
        if (!text) return;

        const newTask = {
            id: Date.now().toString(),
            text,
            completed: false
        };

        tasks.unshift(newTask);
        todoInput.value = '';
        saveTasks();
        renderTasks();
    }

    function toggleTask(id) {
        tasks = tasks.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        saveTasks();
        renderTasks();
    }

    function deleteTask(id, element) {
        // Add fade out animation
        element.style.animation = 'slideOut 0.3s ease forwards';
        
        setTimeout(() => {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks();
        }, 300);
    }

    function editTask(id, currentText, element) {
        const textSpan = element.querySelector('.todo-text');
        
        // Create input field
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'edit-input';
        
        // Replace text with input
        element.insertBefore(input, textSpan);
        element.removeChild(textSpan);
        
        input.focus();
        
        // Handle saving
        const saveEdit = () => {
            const newText = input.value.trim();
            if (newText) {
                tasks = tasks.map(task => 
                    task.id === id ? { ...task, text: newText } : task
                );
                saveTasks();
            }
            renderTasks();
        };

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                input.removeEventListener('blur', saveEdit);
                saveEdit();
            }
        });
    }

    function clearCompleted() {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
    }

    function updateCount() {
        const activeTasks = tasks.filter(t => !t.completed).length;
        tasksCount.textContent = `${activeTasks} item${activeTasks !== 1 ? 's' : ''} left`;
    }

    function renderTasks() {
        todoList.innerHTML = '';

        let filteredTasks = tasks;
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(t => !t.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(t => t.completed);
        }

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `todo-item ${task.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <input type="checkbox" class="checkbox" ${task.completed ? 'checked' : ''}>
                <span class="todo-text">${escapeHTML(task.text)}</span>
                <div class="todo-actions">
                    <button class="action-btn edit-btn" aria-label="Edit task">
                        <i class="ph ph-pencil-simple"></i>
                    </button>
                    <button class="action-btn delete-btn" aria-label="Delete task">
                        <i class="ph ph-trash"></i>
                    </button>
                </div>
            `;

            // Event Listeners for the generated elements
            const checkbox = li.querySelector('.checkbox');
            checkbox.addEventListener('change', () => toggleTask(task.id));

            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => deleteTask(task.id, li));

            const editBtn = li.querySelector('.edit-btn');
            editBtn.addEventListener('click', () => editTask(task.id, task.text, li));

            todoList.appendChild(li);
        });

        updateCount();
    }

    // Helper to prevent XSS when setting innerHTML
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});
