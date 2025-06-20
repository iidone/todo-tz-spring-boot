document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    document.getElementById('task-form').addEventListener('submit', addTask);
    document.getElementById('deadline').addEventListener('change', validateDeadline);
});

// валидация дедлайна
function validateDeadline() {
    const deadlineInput = document.getElementById('deadline');
    const errorElement = document.getElementById('deadline-error');
    const selectedDate = new Date(deadlineInput.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        if (!errorElement) {
            const error = document.createElement('div');
            error.id = 'deadline-error';
            error.className = 'error-message';
            error.textContent = 'Дата не может быть раньше текущей!';
            deadlineInput.parentNode.insertBefore(error, deadlineInput.nextSibling);
        }
        deadlineInput.classList.add('invalid');
        return false;
    } else {
        if (errorElement) {
            errorElement.remove();
        }
        deadlineInput.classList.remove('invalid');
        return true;
    }
}

// загрузка задач
async function loadTasks() {
    try {
        const response = await fetch('/tasks');
        const tasks = await response.json();
        console.log("Задачи с сервера:", tasks);

        const sortedTasks = tasks.sort((a, b) => {

            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }

            if (!a.completed && !b.completed) {
                return new Date(a.deadline) - new Date(b.deadline);
            }

            return new Date(b.deadline) - new Date(a.deadline);
        });

        const list = document.getElementById('task-list');
        list.innerHTML = sortedTasks.map(task => `
            <div class="task ${getTaskStatusClass(task)}" data-id="${task.id}">
                <div class="task-header">
                    <span class="task-id">ID: ${task.id}</span>
                    <h3>${task.title}</h3>
                </div>
                <p class="task-description">${task.description}</p>
                <div class="task-details">
                    <p><strong>Срок выполнения:</strong> ${formatDeadline(task.deadline)}</p>
                    <p class="deadline-days">${getDaysRemaining(task.deadline, task.completed)}</p>
                    <p><strong>Статус:</strong> ${task.completed ? '✅ Выполнено' : '⏳ В процессе'}</p>
                </div>
                <div class="task-actions">
                    <button class="toggle-btn" onclick="toggleTask(${task.id})">
                        ${task.completed ? 'Отметить невыполненной' : 'Отметить выполненной'}
                    </button>
                    <button class="delete-btn" onclick="deleteTask(${task.id})">🗑️ Удалить</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Ошибка загрузки задач:', error);
    }
}

// получение статуса
function getTaskStatusClass(task) {
    const isCompleted = task.completed !== undefined 
        ? task.completed 
        : task.isCompleted;
    
    if (isCompleted === true || isCompleted === "true") return 'completed';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(task.deadline);

    return deadline < today ? 'overdue' : 'pending';
}

// форматирование дедлайна на мск
function formatDeadline(deadline) {
    const date = new Date(deadline);
    return date.toLocaleDateString('ru-RU', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// просроченные дни
function getDaysRemaining(deadline, completed) {
    if (completed) return 'Задача выполнена';
    
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
        return `Просрочено на ${Math.abs(diffDays)} ${declOfNum(Math.abs(diffDays), ['день', 'дня', 'дней'])}`;
    } else {
        return `Осталось ${diffDays} ${declOfNum(diffDays, ['день', 'дня', 'дней'])}`;
    }
}
function declOfNum(number, titles) {
    const cases = [2, 0, 1, 1, 1, 2];
    return titles[
        (number % 100 > 4 && number % 100 < 20) 
            ? 2 
            : cases[(number % 10 < 5) ? number % 10 : 5]
    ];
}

// добавление задачи
async function addTask(e) {
    e.preventDefault();
    
    if (!validateDeadline()) {
        return;
    }
    
    const task = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        deadline: document.getElementById('deadline').value,
        completed: false
    };
    
    try {
        const response = await fetch('/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(task)
        });
        
        if (response.ok) {
            document.getElementById('task-form').reset();
            loadTasks();
        } else {
            const error = await response.json();
            alert(`Ошибка: ${error || 'Неизвестная ошибка'}`);
        }
    } catch (error) {
        console.error('Ошибка добавления задачи:', error);
        alert('Произошла ошибка при добавлении задачи');
    }
}

// триггер нажатия на кнопку изменения статуса
async function toggleTask(id) {
    try {
        const response = await fetch(`/tasks/${id}/toggle`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error(`Ошибка сервера: ${response.status}`);

        const updatedTask = await response.json();
        console.log("Ответ сервера:", updatedTask);
        updateTaskUI(updatedTask);

    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось изменить статус: ' + error.message);
    }
}

// обновление ui после изменения статуса
function updateTaskUI(updatedTask) {
    const taskElement = document.querySelector(`.task[data-id="${updatedTask.id}"]`);
    if (!taskElement) return;

    taskElement.className = `task ${getTaskStatusClass(updatedTask)}`;

    const statusElement = taskElement.querySelector('.task-details p:nth-child(3)');
    if (statusElement) {
        statusElement.innerHTML = `<strong>Статус:</strong> ${updatedTask.completed ? '✅ Выполнено' : '⏳ В процессе'}`;
    }

    const daysElement = taskElement.querySelector('.deadline-days');
    if (daysElement) {
        daysElement.textContent = getDaysRemaining(updatedTask.deadline, updatedTask.completed);
    }

    const toggleBtn = taskElement.querySelector('.toggle-btn');
    if (toggleBtn) {
        toggleBtn.textContent = updatedTask.completed ? 'Отметить невыполненной' : 'Отметить выполненной';
    }
}

// удаление задачи
async function deleteTask(id) {
    if (!confirm('Вы уверены, что хотите удалить эту задачу?')) {
        return;
    }
    
    try {
        const response = await fetch(`/tasks/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadTasks();
        } else {
            const error = await response.json();
            alert(`Ошибка: ${error || 'Неизвестная ошибка'}`);
        }
    } catch (error) {
        console.error('Ошибка удаления задачи:', error);
        alert('Произошла ошибка при удалении задачи');
    }
}
