// DOM Elements
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');
const createTaskButton = document.getElementById('create-task-button');
const addCategoryButton = document.getElementById('add-category-button');
const taskModal = document.getElementById('task-modal');
const categoryModal = document.getElementById('category-modal');
const taskDetailsModal = document.getElementById('task-details-modal');
const closeModal = document.getElementById('close-modal');
const closeCategoryModal = document.getElementById('close-category-modal');
const closeDetailsModal = document.getElementById('close-details-modal');
const overlay = document.getElementById('overlay');
const taskForm = document.getElementById('task-form');
const categoryForm = document.getElementById('category-form');
const deleteTaskButton = document.getElementById('delete-task');
const deleteCategoryButton = document.getElementById('delete-category');
const taskContainer = document.getElementById('task-container');
const categoriesList = document.getElementById('categories-list');
const taskCategorySelect = document.getElementById('task-category');
const colorOptions = document.querySelectorAll('.color-option');
const categoryColorInput = document.getElementById('category-color');
const themeSwitch = document.getElementById('theme-switch');
const searchInput = document.getElementById('search-input');
const viewButtons = document.querySelectorAll('.sidebar-item[data-view]');
const currentViewTitle = document.getElementById('current-view-title');
const gridViewButton = document.getElementById('grid-view-button');
const listViewButton = document.getElementById('list-view-button');
const editTaskButton = document.getElementById('edit-task-button');
const completeTaskButton = document.getElementById('complete-task-button');
const dropdownButton = document.querySelector('.dropdown-button');
const dropdownContent = document.querySelector('.dropdown-content');
const sortOptions = document.querySelectorAll('.dropdown-content a');
const deleteConfirmationModal = document.getElementById("confirmationModal");

deleteConfirmationModal.style.display = "none";

// State
let tasks = [];
let categories = [];
let currentView = 'all';
let currentSort = 'date-desc';
let currentTaskId = null;
let currentCategoryId = null;
let isGridView = true;

// Initialize
function init() {
    loadFromLocalStorage();
    renderTasks();
    renderCategories();
    updateCounts();
    setupEventListeners();
    checkTheme();
}

// Event Listeners
function setupEventListeners() {
    // Menu Toggle
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });

    // Create Task
    createTaskButton.addEventListener('click', () => {
        openTaskModal();
    });

    // Add Category
    addCategoryButton.addEventListener('click', () => {
        openCategoryModal();
    });

    // Close Modals
    closeModal.addEventListener('click', closeTaskModal);
    closeCategoryModal.addEventListener('click', closeCategoriesModal);
    closeDetailsModal.addEventListener('click', closeTaskDetailsModal);
    overlay.addEventListener('click', () => {
        closeTaskModal();
        closeCategoriesModal();
        closeTaskDetailsModal();
    });

    // Form Submissions
    taskForm.addEventListener('submit', handleTaskSubmit);
    categoryForm.addEventListener('submit', handleCategorySubmit);

    // Delete Buttons
    deleteTaskButton.addEventListener('click', handleTaskDelete);
    deleteCategoryButton.addEventListener('click', handleCategoryDelete);

    // Color Options
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            categoryColorInput.value = option.dataset.color;
        });
    });

    // Theme Switch
    themeSwitch.addEventListener('change', () => {
        document.body.classList.toggle('dark', themeSwitch.checked);
        localStorage.setItem('darkMode', themeSwitch.checked);
    });

    // Search
    searchInput.addEventListener('input', () => {
        renderTasks();
    });

    // View Buttons
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            viewButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentView = button.dataset.view;
            currentViewTitle.textContent = button.querySelector('span').textContent;
            renderTasks();
        });
    });

    // Grid/List View Toggle
    gridViewButton.addEventListener('click', () => {
        isGridView = true;
        gridViewButton.classList.add('active');
        listViewButton.classList.remove('active');
        taskContainer.classList.remove('list-view');
        localStorage.setItem('viewMode', 'grid');
    });

    listViewButton.addEventListener('click', () => {
        isGridView = false;
        listViewButton.classList.add('active');
        gridViewButton.classList.remove('active');
        taskContainer.classList.add('list-view');
        localStorage.setItem('viewMode', 'list');
    });

    // Edit Task
    editTaskButton.addEventListener('click', () => {
        closeTaskDetailsModal();
        openTaskModal(currentTaskId);
    });

    // Complete Task
    completeTaskButton.addEventListener('click', toggleTaskCompletion);

    // Sort Dropdown
    dropdownButton.addEventListener('click', () => {
        dropdownButton.parentElement.classList.toggle('active');
    });

    // Sort Options
    sortOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            currentSort = option.dataset.sort;
            dropdownButton.parentElement.classList.remove('active');
            renderTasks();
            localStorage.setItem('currentSort', currentSort);
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            document.querySelector('.dropdown').classList.remove('active');
        }
    });
}

// Local Storage
function loadFromLocalStorage() {
    // Load Tasks
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    } else {
        // Default tasks
        tasks = [
            {
                id: generateId(),
                name: 'Welcome to Task Manager',
                description: 'This is a sample task to help you get started. Click on it to see details or create a new task with the button in the sidebar.',
                dueDate: getTodayDate(),
                dueTime: '12:00',
                category: null,
                priority: 'medium',
                completed: false,
                createdAt: new Date().toISOString()
            }
        ];
        saveTasksToLocalStorage();
    }

    // Load Categories
    const savedCategories = localStorage.getItem('categories');
    if (savedCategories) {
        categories = JSON.parse(savedCategories);
    } else {
        // Default categories
        categories = [
            { id: generateId(), name: 'Work', color: '#4f46e5' },
            { id: generateId(), name: 'Personal', color: '#10b981' },
            { id: generateId(), name: 'Shopping', color: '#f59e0b' },
            { id: generateId(), name: 'Health', color: '#ef4444' }
        ];
        saveCategoriesToLocalStorage();
    }

    // Load View Mode
    const viewMode = localStorage.getItem('viewMode');
    if (viewMode === 'list') {
        isGridView = false;
        listViewButton.classList.add('active');
        gridViewButton.classList.remove('active');
        taskContainer.classList.add('list-view');
    }

    // Load Sort
    const savedSort = localStorage.getItem('currentSort');
    if (savedSort) {
        currentSort = savedSort;
    }

    // Load Current View
    const savedView = localStorage.getItem('currentView');
    if (savedView) {
        currentView = savedView;
        viewButtons.forEach(btn => {
            if (btn.dataset.view === currentView) {
                btn.classList.add('active');
                currentViewTitle.textContent = btn.querySelector('span').textContent;
            } else {
                btn.classList.remove('active');
            }
        });
    }
}

function saveTasksToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function saveCategoriesToLocalStorage() {
    localStorage.setItem('categories', JSON.stringify(categories));
}

// Task Operations
function addTask(task) {
    tasks.push({
        id: generateId(),
        name: task.name,
        description: task.description,
        dueDate: task.dueDate,
        dueTime: task.dueTime,
        category: task.category,
        priority: task.priority,
        completed: false,
        createdAt: new Date().toISOString()
    });
    triggerNotification("task saved successfully")
    saveTasksToLocalStorage();
    renderTasks();
    updateCounts();
}

function updateTask(id, updatedTask) {
    const index = tasks.findIndex(task => task.id === id);
    if (index !== -1) {
        tasks[index] = {
            ...tasks[index],
            name: updatedTask.name,
            description: updatedTask.description,
            dueDate: updatedTask.dueDate,
            dueTime: updatedTask.dueTime,
            category: updatedTask.category,
            priority: updatedTask.priority
        };
        triggerNotification("task updated successfully");
        saveTasksToLocalStorage();
        renderTasks();
        updateCounts();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    triggerNotification("task deleted successfully")
    saveTasksToLocalStorage();
    renderTasks();
    updateCounts();
}

function toggleTaskCompletion() {
    const index = tasks.findIndex(task => task.id === currentTaskId);
    if (index !== -1) {
        tasks[index].completed = !tasks[index].completed;
        saveTasksToLocalStorage();
        renderTasks();
        updateCounts();
        
        // Update button text
        if (tasks[index].completed) {
            completeTaskButton.innerHTML = '<i class="fas fa-undo"></i><span>Mark as Incomplete</span>';
            completeTaskButton.classList.add('completed');
        } else {
            completeTaskButton.innerHTML = '<i class="fas fa-check"></i><span>Mark as Complete</span>';
            completeTaskButton.classList.remove('completed');
        }
    }
    closeTaskDetailsModal();
}

// Category Operations
function addCategory(category) {
    categories.push({
        id: generateId(),
        name: category.name,
        color: category.color
    });
    triggerNotification(`Category added successfully`);
    saveCategoriesToLocalStorage();
    renderCategories();
}

function updateCategory(id, updatedCategory) {
    const index = categories.findIndex(category => category.id === id);
    if (index !== -1) {
        categories[index] = {
            ...categories[index],
            name: updatedCategory.name,
            color: updatedCategory.color
        };
        triggerNotification("Category updated successfully");
        saveCategoriesToLocalStorage();
        renderCategories();
        renderTasks(); // Re-render tasks to update category colors
    }
}

function deleteCategory(id) {
    // Update tasks that use this category
    tasks = tasks.map(task => {
        if (task.category === id) {
            return { ...task, category: null };
        }
        return task;
    });
    saveTasksToLocalStorage();
    
    // Delete the category
    categories = categories.filter(category => category.id !== id);
    saveCategoriesToLocalStorage();
    
    renderCategories();
    triggerNotification("Category deleted Successfully");
    renderTasks();
}

// Render Functions
function renderTasks() {
    taskContainer.innerHTML = '';
    
    // Filter tasks based on current view and search
    let filteredTasks = tasks;
    const searchTerm = searchInput.value.toLowerCase();

    // Apply view filter
    if (currentView === 'today') {
        const today = getTodayDate();
        filteredTasks = filteredTasks.filter(task => task.dueDate === today);
    } else if (currentView === 'upcoming') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filteredTasks = filteredTasks.filter(task => {
            if (!task.dueDate || task.completed) return false;
            const dueDate = new Date(task.dueDate);
            return dueDate > today;
        });
    } else if (currentView === 'completed') {
        filteredTasks = filteredTasks.filter(task => task.completed);
    } else if (currentView.startsWith('category-')) {
        const categoryId = currentView.replace('category-', '');
        filteredTasks = filteredTasks.filter(task => task.category === categoryId);
    }
    
    // Apply search filter
    if (searchTerm) {
        filteredTasks = filteredTasks.filter(task => {
            console.log("Task:", task); // Debugging
            console.log("Task Name:", task.name); // Should not be undefined
            console.log("Task Description:", task.description); // Should not be undefined
    
            return (
                (task.name && task.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        });
    }    
    
    // Sort tasks
    filteredTasks = sortTasks(filteredTasks, currentSort);
    
    // Check if there are no tasks
    if (filteredTasks.length === 0) {
        renderEmptyState();
        return;
    }
    
    // Render each task
    filteredTasks.forEach(task => {
        const taskCard = document.createElement('div');
        taskCard.className = `task-card ${task.completed ? 'completed' : ''}`;
        taskCard.dataset.id = task.id;

        // Find category
        const category = task.category ? categories.find(cat => cat.id === task.category) : null;

        // Create task card content
        if (isGridView) {
            const now = new Date(); // Get the current date and time
            const taskDueDate = task.dueDate ? new Date(task.dueDate) : null;
            const isOverdue = taskDueDate && taskDueDate < now && !task.completed;
            
            taskCard.innerHTML = `
                <div class="task-header-row">
                    <h3 class="task-title">${task.name}</h3>
                    <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-id="${task.id}">
                        ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                    </div>
                </div>
                ${task.dueDate ? `
                <div class="task-date">
                    <i class="far fa-calendar"></i>
                    <span>${formatDate(task.dueDate)}${task.dueTime ? ' at ' + formatTime(task.dueTime) : ''}</span>
                    ${isOverdue ? '<span class="due-tag">( Due Date Passed ) </span>' : ''}
                </div>
                ` : ''}
                ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
                <div class="task-footer">
                    ${category ? `
                    <div class="task-category" style="background-color: ${category.color}20; color: ${category.color}">
                        <span class="category-color" style="background-color: ${category.color}"></span>
                        <span>${category.name}</span>
                    </div>
                    ` : ''}
                    <div class="task-priority">
                        <span class="priority-indicator priority-${task.priority}"></span>
                        <span>${capitalizeFirstLetter(task.priority)}</span>
                    </div>
                </div>
            `;
        }
        else {
            // List view
            taskCard.innerHTML = `
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-id="${task.id}">
                    ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <div class="task-header-row">
                    <h3 class="task-title">${task.name}</h3>
                    ${task.dueDate ? `
                    <div class="task-date">
                        <i class="far fa-calendar"></i>
                        <span>${formatDate(task.dueDate)}${task.dueTime ? ' at ' + formatTime(task.dueTime) : ''}</span>
                    </div>
                    ` : ''}
                </div>
                <div class="task-footer">
                    ${category ? `
                    <div class="task-category" style="background-color: ${category.color}20; color: ${category.color}">
                        <span class="category-color" style="background-color: ${category.color}"></span>
                        <span>${category.name}</span>
                    </div>
                    ` : ''}
                    <div class="task-priority">
                        <span class="priority-indicator priority-${task.priority}"></span>
                        <span>${capitalizeFirstLetter(task.priority)}</span>
                    </div>
                </div>
            `;
        }

        taskContainer.appendChild(taskCard);

        // Add event listeners
        taskCard.addEventListener('click', (e) => {
            // Don't open details if clicking on checkbox
            if (!e.target.closest('.task-checkbox')) {
                openTaskDetailsModal(task.id);
            }
        });

        const checkbox = taskCard.querySelector('.task-checkbox');
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent opening details
            const taskId = checkbox.dataset.id;
            const taskIndex = tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                tasks[taskIndex].completed = !tasks[taskIndex].completed;
                triggerNotification("Congratulations you have completed your task");
                saveTasksToLocalStorage();
                renderTasks();
                updateCounts();
            }
        });
    });
}
function renderEmptyState() {
    

    let message = '';
    let icon = 'fas fa-tasks';

    if (searchInput.value) {
        message = 'No tasks match your search';
        icon = 'fas fa-search';
    } else if (currentView === 'today') {
        message = 'No tasks due today';
        icon = 'fas fa-calendar-day';
    } else if (currentView === 'upcoming') {
        message = 'No upcoming tasks';
        icon = 'fas fa-calendar-alt';
    } else if (currentView === 'completed') {
        message = 'No completed tasks';
        icon = 'fas fa-check-circle';
    } else if (currentView.startsWith('category-')) {
        const categoryId = currentView.replace('category-', '');
        const category = categories.find(cat => cat.id === categoryId);
        message = `No tasks in ${category ? category.name : 'this category'}`;
        icon = 'fas fa-tag';
    } else {
        message = 'No tasks yet';
        icon = 'fas fa-tasks';
    }
    taskContainer.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">
                <i class="${icon}"></i>
            </div>
            <h3 class="empty-state-title">${message}</h3>
            <p class="empty-state-description">
                ${searchInput.value ? 'Try a different search term or' : 'Get started by'} creating a new task.
            </p>
            <button class="empty-state-button" id="empty-state-create-button" onclick="openTaskModal()">
                <i class="fas fa-plus"></i>
                <span>Create Task</span>
            </button>
        </div>
    `;
}

function renderCategories() {
    // Render sidebar categories
    categoriesList.innerHTML = '';
    categories.forEach(category => {
        const li = document.createElement('li');
        li.className = `category-item ${currentView === 'category-' + category.id ? 'active' : ''}`;
        li.dataset.id = category.id;
        li.dataset.view = 'category-' + category.id;
        const trimmedName = category.name.length > 13 ? category.name.substring(0, 13) + '...' : category.name;
        li.innerHTML = `
            <span class="category-color" style="background-color: ${category.color}"></span>
            <span class="category-name" title="${category.name}">${trimmedName}</span>
            <span class="task-count" id="category-${category.id}-count">0</span>
            <span class="delete-category" data-id="${category.id}">&times;</span>
            <span class="edit-category" data-id="${category.id}"><i class="fas fa-edit"></i></span>
        `;

        categoriesList.appendChild(li);
        // Edit category button functionality
        li.querySelector('.edit-category').addEventListener('click', () => {
            const categoryId = li.dataset.id;
            let name = category.name;
            let color = category.color;
            const categoryData = {
                name,
                color
            };
            openCategoryModal(categoryId);
            console.log("category data :", categoryData)
        })
        // Add event listener for category selection
        li.addEventListener('click', (event) => {
            if (event.target.classList.contains('delete-category')) return; // Prevent category deletion click from triggering selection

            viewButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
            li.classList.add('active');
            currentView = 'category-' + category.id;
            currentViewTitle.textContent = category.name;
            renderTasks();
            localStorage.setItem('currentView', currentView);
        });

        // Add event listener for category deletion
        li.querySelector('.delete-category').addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent triggering category selection
            deleteConfirmationModal.style.display = "block";
            deleteConfirmationModal.style.display = "flex";

            document.getElementById('cancel-btn').addEventListener('click', (event) => {
                event.preventDefault();
                deleteConfirmationModal.style.display = "none";
                console.log("delete", deleteConfirmationModal)
            })

            document.getElementById('confirm-btn').addEventListener('click', (e) => {
                e.preventDefault();
                deleteConfirmationModal.style.display = "none";
                deleteCategory(category.id);
            })
        });
    });

    // Render task form categories
    taskCategorySelect.innerHTML = '<option value="">No Category</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        taskCategorySelect.appendChild(option);
    });

    updateCounts();
}

function updateCounts() {
    // All tasks count
    document.getElementById('all-count').textContent = tasks.length;

    // Today count
    const today = getTodayDate();
    const todayCount = tasks.filter(task => task.dueDate === today).length;
    document.getElementById('today-count').textContent = todayCount;

    // Upcoming count
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const upcomingCount = tasks.filter(task => {
        if (!task.dueDate || task.completed) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate > todayDate;
    }).length;
    document.getElementById('upcoming-count').textContent = upcomingCount;

    // Completed count
    const completedCount = tasks.filter(task => task.completed).length;
    document.getElementById('completed-count').textContent = completedCount;

    // Category counts
    categories.forEach(category => {
        const count = tasks.filter(task => task.category === category.id).length;
        const countElement = document.getElementById(`category-${category.id}-count`);
        if (countElement) {
            countElement.textContent = count;
        }
    });
}

// Modal Functions
function openTaskModal(taskId = null) {
    console.log("rana")
    currentTaskId = taskId;
    const modalTitle = document.getElementById('modal-title');
    const taskNameInput = document.getElementById('task-name');
    const taskDescriptionInput = document.getElementById('task-description');
    const dueDateInput = document.getElementById('due-date');
    const dueTimeInput = document.getElementById('due-time');
    const taskCategorySelect = document.getElementById('task-category');
    const taskPrioritySelect = document.getElementById('task-priority');
    const taskIdInput = document.getElementById('task-id');

    // Reset form
    taskForm.reset();
    console.log('task is :', taskId)
    if (taskId) {
        // Edit mode
        console.log("rana 2")

        modalTitle.textContent = 'Edit Task';
        deleteTaskButton.style.display = 'block';

        const task = tasks.find(task => task.id === taskId);
        if (task) {
            taskNameInput.value = task.name;
            taskDescriptionInput.value = task.description || '';
            dueDateInput.value = task.dueDate || '';
            dueTimeInput.value = task.dueTime || '';
            taskCategorySelect.value = task.category || '';
            taskPrioritySelect.value = task.priority;
            taskIdInput.value = task.id;
        }
    } else {
        // Create mode
        console.log("rana 3")

        modalTitle.textContent = 'Create New Task';
        deleteTaskButton.style.display = 'none';
        taskIdInput.value = '';

        // Set default due date to today
        dueDateInput.value = getTodayDate();
    }

    taskModal.style.display = 'block';
    overlay.style.display = 'block';
    taskNameInput.focus();
}

function closeTaskModal() {
    taskModal.style.display = 'none';
    overlay.style.display = 'none';
}

function openCategoryModal(categoryId = null) {
    currentCategoryId = categoryId;
    const modalTitle = document.getElementById('category-modal-title');
    const categoryNameInput = document.getElementById('category-name');
    const categoryColorInput = document.getElementById('category-color');
    const categoryIdInput = document.getElementById('category-id');

    // Reset form
    categoryForm.reset();

    // Reset color options
    colorOptions.forEach(option => option.classList.remove('selected'));
    colorOptions[0].classList.add('selected');
    categoryColorInput.value = colorOptions[0].dataset.color;
    console.log("red bro", categoryId)
    deleteCategoryButton.style.display = 'none';

    if (categoryId) {
        // Edit mode
        const saveButton = document.getElementById('save-category');
        overlay.style.display = 'block';
        categoryModal.style.display = 'block';
        modalTitle.textContent = 'Edit Category';
        deleteCategoryButton.style.display = 'block';
        saveButton.textContent = "Update Category";

        console.log("saev ...", saveButton)

        const category = categories.find(category => category.id === categoryId);
        console.log('sgfgsdf')
        if (category) {
            categoryNameInput.value = category.name;
            categoryColorInput.value = category.color;
            categoryIdInput.value = category.id;

            // Select the correct color option
            colorOptions.forEach(option => {
                if (option.dataset.color === category.color) {
                    option.classList.add('selected');
                } else {
                    option.classList.remove('selected');
                }
            });

        }
    } 
    else {
        
        modalTitle.textContent = 'Add Category';

        categoryIdInput.value = '';

        categoryModal.style.display = 'block';
        overlay.style.display = 'block';
        categoryNameInput.focus();
    }
}

function closeCategoriesModal() {
    categoryModal.style.display = 'none';
    overlay.style.display = 'none';
}

function openTaskDetailsModal(taskId) {
    currentTaskId = taskId;
    const task = tasks.find(task => task.id === taskId);
    if (!task) return;

    const taskDetailsTitle = document.getElementById('task-details-title');
    const taskDetailsDate = document.getElementById('task-details-date');
    const taskDetailsCategory = document.getElementById('task-details-category');
    const taskDetailsPriority = document.getElementById('task-details-priority');
    const taskDetailsDescription = document.getElementById('task-details-description-text');
    const completeTaskButton = document.getElementById('complete-task-button');

    taskDetailsTitle.textContent = task.name;

    // Format date
    if (task.dueDate) {
        taskDetailsDate.textContent = `${formatDate(task.dueDate)}${task.dueTime ? ' at ' + formatTime(task.dueTime) : ''}`;
    } else {
        taskDetailsDate.textContent = 'No due date';
    }

    // Category
    if (task.category) {
        const category = categories.find(cat => cat.id === task.category);
        if (category) {
            taskDetailsCategory.innerHTML = `<span class="category-color" style="background-color: ${category.color}"></span> ${category.name}`;
        } else {
            taskDetailsCategory.textContent = 'No category';
        }
    } else {
        taskDetailsCategory.textContent = 'No category';
    }

    // Priority
    taskDetailsPriority.innerHTML = `<span class="priority-indicator priority-${task.priority}"></span> ${capitalizeFirstLetter(task.priority)}`;

    // Description
    taskDetailsDescription.textContent = task.description || 'No description provided.';

    // Complete button
    if (task.completed) {
        completeTaskButton.innerHTML = '<i class="fas fa-undo"></i><span>Mark as Incomplete</span>';
        completeTaskButton.classList.add('completed');
    } else {
        completeTaskButton.innerHTML = '<i class="fas fa-check"></i><span>Mark as Complete</span>';
        completeTaskButton.classList.remove('completed');
    }

    taskDetailsModal.style.display = 'block';
    overlay.style.display = 'block';
}

function closeTaskDetailsModal() {
    taskDetailsModal.style.display = 'none';
    overlay.style.display = 'none';
}

// Form Handlers
function handleTaskSubmit(e) {
    e.preventDefault();

    const taskId = document.getElementById('task-id').value;
    const name = document.getElementById('task-name').value;
    const description = document.getElementById('task-description').value;
    const dueDate = document.getElementById('due-date').value;
    const dueTime = document.getElementById('due-time').value;
    const category = document.getElementById('task-category').value;
    const priority = document.getElementById('task-priority').value;

    const taskData = {
        name,
        description,
        dueDate,
        dueTime,
        category: category || null,
        priority
    };

    if (taskId) {
        updateTask(taskId, taskData);
    } else {
        addTask(taskData);
    }

    closeTaskModal();
}

function handleCategorySubmit(e) {
    e.preventDefault();

    const categoryId = document.getElementById('category-id').value;
    const name = document.getElementById('category-name').value;
    const color = document.getElementById('category-color').value;

    const categoryData = {
        name,
        color
    };

    if (categoryId) {
        updateCategory(categoryId, categoryData);
    } else {
        addCategory(categoryData);
    }

    closeCategoriesModal();
}

function handleTaskDelete() {
    if (currentTaskId) {
        deleteTask(currentTaskId);
        closeTaskModal();
    }
}

function handleCategoryDelete() {
    if (currentCategoryId) {
        deleteCategory(currentCategoryId);
        closeCategoriesModal();
    }
}

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
    if (!dateString) return '';

    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
}

function formatTime(timeString) {
    if (!timeString) return '';

    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;

    return `${formattedHour}:${minutes} ${period}`;
}

function capitalizeFirstLetter(string) {
    if (typeof string !== 'string' || string.length === 0) {
        console.error('Invalid input:', string);
        return ''; // Return an empty string if input is invalid
    }
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function sortTasks(tasks, sortBy) {
    return [...tasks].sort((a, b) => {
        switch (sortBy) {
            case 'date-asc':
                return new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31');
            case 'date-desc':
                return new Date(b.dueDate || '0000-01-01') - new Date(a.dueDate || '0000-01-01');
            case 'priority-high':
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            case 'priority-low':
                const priorityOrderReverse = { low: 0, medium: 1, high: 2 };
                return priorityOrderReverse[a.priority] - priorityOrderReverse[b.priority];
            case 'name-asc':
                return (a.name || "").localeCompare(b.name || "");
            case 'name-desc':
                return (b.name || "").localeCompare(a.name || "");
            default:
                return new Date(b.createdAt) - new Date(a.createdAt);
        }
    });
}

function checkTheme() {
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'true') {
        document.body.classList.add('dark');
        themeSwitch.checked = true;
    }
}

// keyboard shortcuts 
document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "k") {
        event.preventDefault()
        document.getElementById("create-task-button").click();
    } else if (event.ctrlKey && event.key === "f") {
        event.preventDefault()
        document.getElementById("search-input").focus();
    }
})

// Due date alerts 
function dueDateAlerts() {
    let tasks = JSON.parse(localStorage.getItem('tasks'));
    let now = new Date().getTime();
    tasks.forEach((task) => {
        let dueTime = new Date(task.dueDate).getTime();
        if (dueTime - now <= 3600000 && !task.alertSent) {
            triggerNotification(`Task Due Soon: ${task.title}`);
            task.alertSent = true;
        }
    })
    localStorage.setItem('tasks', JSON.stringify(tasks))
}

setInterval(dueDateAlerts, 60000) // every 1 minute


const settingsButton = document.getElementById('settings-button');
const closeSettingsButton = document.getElementById('close-settings');
const settingsOffcanvas = document.getElementById('settings-offcanvas');
const settingsOverlay = document.getElementById('settings-overlay');

// Toggle settings offcanvas
settingsButton.addEventListener('click', () => {
    settingsOffcanvas.classList.add('active');
    settingsOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

// Close settings offcanvas
closeSettingsButton.addEventListener('click', closeSettings);
settingsOverlay.addEventListener('click', closeSettings);

function closeSettings() {
    settingsOffcanvas.classList.remove('active');
    settingsOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Export tasks

document.getElementById("exportTasks").addEventListener("click", () => {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    if (tasks.length === 0) {
        alert("No tasks available to export.");
        return;
    }

    // Define CSV headers
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Name,Description,Due Date,Due Time,Category,Priority,Completed,Created At\n";

    // Convert each task object into a CSV row
    tasks.forEach(task => {
        let row = `${task.id},"${task.name}","${task.description.replace(/\n/g, " ")}",${task.dueDate},${task.dueTime},${task.category},${task.priority},${task.completed},${task.createdAt}`;
        csvContent += row + "\n";
    });

    // Create a downloadable CSV file
    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.href = encodedUri;
    link.download = "tasks.csv";
    link.click();
});

// Import tasks
document.getElementById("importTasks").addEventListener("change", (event) => {
    let file = event.target.files[0];

    if (file) {
        let reader = new FileReader();
        reader.onload = (e) => {
            let csvData = e.target.result.split("\n").slice(1); // Skip header row
            let importedTasks = [];

            csvData.forEach(row => {
                let columns = row.split(",");

                if (columns.length >= 9) { // Ensure the row has enough data
                    let task = {
                        id: columns[0].trim(),
                        name: columns[1].trim().replace(/"/g, ""), // Remove quotes
                        description: columns[2].trim().replace(/"/g, ""),
                        dueDate: columns[3].trim(),
                        dueTime: columns[4].trim(),
                        category: columns[5].trim(),
                        priority: columns[6].trim(),
                        completed: columns[7].trim().toLowerCase() === "true", // Convert to boolean
                        createdAt: columns[8].trim()
                    };
                    importedTasks.push(task);
                }
            });

            // Save imported tasks to localStorage
            let existingTasks = JSON.parse(localStorage.getItem("tasks")) || [];
            localStorage.setItem("tasks", JSON.stringify([...existingTasks, ...importedTasks]));

            alert("Tasks imported successfully!");

            location.reload(); // Refresh page to reflect changes
            triggerNotification("Tasks imported successfully!");
        };

        reader.readAsText(file);
    }
});

// Import categories 

document.getElementById("importCategories").addEventListener("change", (event) => {
    let file = event.target.files[0];

    if (file) {
        let reader = new FileReader();
        reader.onload = (e) => {
            let csvData = e.target.result.split("\n").slice(1); // Skip header row
            let importedCategories = [];

            csvData.forEach(row => {
                let columns = row.split(",");

                if (columns.length >= 3) { // Ensure the row has enough data
                    let category = {
                        id: columns[0].trim(),
                        name: columns[1].trim().replace(/"/g, ""), // Remove quotes
                        color: columns[2].trim().replace(/"/g, "")
                    };
                    importedCategories.push(category);
                }
            });

            // Save imported categories to localStorage
            let existingCategories = JSON.parse(localStorage.getItem("categories")) || [];
            localStorage.setItem("categories", JSON.stringify([...existingCategories, ...importedCategories]));

            alert("Categories imported successfully!");
            location.reload(); // Refresh page to reflect changes
            triggerNotification("Categories imported successfully!");
        };

        reader.readAsText(file);
    }
});

// Export categories 
document.getElementById("exportCategories").addEventListener("click", () => {
    let categories = JSON.parse(localStorage.getItem("categories")) || [];

    if (categories.length === 0) {
        alert("No categories to export.");
        return;
    }

    let csvContent = "ID,Name,Color\n"; // CSV Header
    categories.forEach(category => {
        csvContent += `${category.id},"${category.name}","${category.color}"\n`;
    });

    let blob = new Blob([csvContent], { type: "text/csv" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "categories.csv";
    link.click();
});

// push notification 
let notificationDisplayed = false;
function triggerNotification(message) {

    if (notificationDisplayed) {
        return; // Exit the function if a notification is already shown
    }

    notificationDisplayed = true;
    const notification = document.createElement("div");
    notification.classList.add("notification");
    notification.innerText = message;

    const container = document.getElementById("notification-container");
    container.appendChild(notification);

    setTimeout(() => {
        notification.classList.add("hide");
        setTimeout(() => {
            container.removeChild(notification);
            notificationDisplayed = false;
        }, 0);
    }, 3000);
}

// Initialize the app
init();