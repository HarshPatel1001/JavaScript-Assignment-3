document.addEventListener('DOMContentLoaded', function () {
    const addTaskBtn = document.getElementById('add-task-btn');
    const selectAllBtn = document.getElementById('select-all-btn');
    const deleteSelectedBtn = document.getElementById('delete-selected-btn');
    const taskList = document.getElementById('task-list');
    const newTaskInput = document.getElementById('new-task');
    let allSelected = false;  // Track the state of the "Select All" button
    let selectedCount = 0;    // Track the number of selected tasks

    // Add a new task when the "Add Task" button is clicked
    addTaskBtn.addEventListener('click', function () {
        const taskText = newTaskInput.value.trim();
        if (taskText) {
            addTask(taskText);
            newTaskInput.value = '';
            newTaskInput.focus();
        }
    });

    // Toggle the selection of all tasks when the "Select All" button is clicked
    selectAllBtn.addEventListener('click', function () {
        const checkboxes = taskList.querySelectorAll('input[type="checkbox"]');
        if (allSelected) {
            // Deselect all tasks
            checkboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    checkbox.checked = false;
                    const li = checkbox.parentElement;
                    li.classList.remove('completed');
                    selectedCount--;
                }
            });
            allSelected = false;
        } else {
            // Select all tasks
            checkboxes.forEach(checkbox => {
                if (!checkbox.checked) {
                    checkbox.checked = true;
                    const li = checkbox.parentElement;
                    li.classList.add('completed');
                    playSound('ding.wav');
                    selectedCount++;
                }
            });
            allSelected = true;
        }
        toggleDeleteSelectedButton();
        toggleIndividualDeleteButtons();
        toggleEditButtons();
    });

    // Delete selected tasks when the "Delete Selected" button is clicked
    deleteSelectedBtn.addEventListener('click', function () {
        const selectedTasks = taskList.querySelectorAll('input[type="checkbox"]:checked');
        selectedTasks.forEach(checkbox => {
            const li = checkbox.parentElement;
            li.style.backgroundColor = '#f8d7da'; // Light red background
            setTimeout(() => {
                taskList.removeChild(li);
            }, 500); // Wait 500ms before removing
        });
        selectedCount = 0; // Reset selected count
        toggleDeleteSelectedButton(); // Hide delete selected button
        toggleIndividualDeleteButtons(); // Show individual delete buttons
        toggleEditButtons(); // Hide edit buttons
    });

    // Function to add a new task to the list
    function addTask(taskText) {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.setAttribute('draggable', 'true');
        li.addEventListener('dragstart', handleDragStart);
        li.addEventListener('dragover', handleDragOver);
        li.addEventListener('drop', handleDrop);
        li.addEventListener('dragend', handleDragEnd);

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.addEventListener('change', function () {
            const deleteBtn = li.querySelector('button.delete-btn');
            const editBtn = li.querySelector('button.edit-btn');
            if (checkbox.checked) {
                li.classList.add('completed');
                playSound('ding.wav');
                selectedCount++;
            } else {
                li.classList.remove('completed');
                selectedCount--;
            }
            toggleDeleteSelectedButton();
            toggleIndividualDeleteButtons();
            toggleEditButtons();
        });

        const span = document.createElement('span');
        span.textContent = taskText;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';
        deleteBtn.style.display = 'none'; // Hide delete button initially
        deleteBtn.addEventListener('click', function () {
            if (checkbox.checked) {
                selectedCount--;
                toggleDeleteSelectedButton();
            }
            li.style.backgroundColor = '#f8d7da'; // Light red background
            setTimeout(() => {
                taskList.removeChild(li);
            }, 500); // Wait 500ms before removing
        });

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.className = 'edit-btn';
        editBtn.style.display = 'none'; // Hide edit button initially
        editBtn.addEventListener('click', function () {
            if (editBtn.textContent === 'Edit') {
                editTask(li, span, editBtn);
            } else {
                saveTask(li, span, editBtn);
            }
        });

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);
        li.appendChild(editBtn);
        taskList.appendChild(li);
    }

    // Function to enable editing a task
    function editTask(li, span, editBtn) {
        const taskText = span.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = taskText;
        li.insertBefore(input, span);
        li.removeChild(span);

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                saveTask(li, input, editBtn);
            }
        });

        input.addEventListener('blur', function () {
            saveTask(li, input, editBtn);
        });

        input.focus();
        editBtn.textContent = 'Save';
    }

    // Function to save the edited task
    function saveTask(li, input, editBtn) {
        const span = document.createElement('span');
        span.textContent = input.value.trim();
        li.insertBefore(span, input);
        li.removeChild(input);
        editBtn.textContent = 'Edit';
    }

    // Handle the drag start event
    function handleDragStart(e) {
        e.target.classList.add('dragging');
    }

    // Handle the drag over event
    function handleDragOver(e) {
        e.preventDefault();
        const draggingItem = document.querySelector('.dragging');
        const taskItems = [...taskList.querySelectorAll('.task-item:not(.dragging)')];
        const nextTask = taskItems.find(task => e.clientY < task.getBoundingClientRect().top + task.offsetHeight / 2);
        taskList.insertBefore(draggingItem, nextTask);
    }

    // Handle the drop event
    function handleDrop(e) {
        e.target.classList.remove('dragging');
    }

    // Handle the drag end event
    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    // Function to play a sound when a task is completed
    function playSound(filename) {
        const audio = new Audio(filename);
        audio.play();
    }

    // Toggle the visibility of the "Delete Selected" button
    function toggleDeleteSelectedButton() {
        if (selectedCount > 1) {
            deleteSelectedBtn.style.display = 'inline'; // Show delete selected button
        } else {
            deleteSelectedBtn.style.display = 'none'; // Hide delete selected button
        }
    }

    // Toggle the visibility of individual delete buttons
    function toggleIndividualDeleteButtons() {
        const deleteButtons = taskList.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            const checkbox = button.parentElement.querySelector('input[type="checkbox"]');
            if (selectedCount > 1) {
                button.style.display = 'none'; // Hide individual delete buttons
            } else {
                if (checkbox.checked) {
                    button.style.display = 'inline'; // Show individual delete button if its task is selected
                } else {
                    button.style.display = 'none'; // Hide individual delete button if its task is not selected
                }
            }
        });
    }

    // Toggle the visibility of edit buttons
    function toggleEditButtons() {
        const editButtons = taskList.querySelectorAll('.edit-btn');
        editButtons.forEach(button => {
            const checkbox = button.parentElement.querySelector('input[type="checkbox"]');
            if (selectedCount === 1 && checkbox.checked) {
                button.style.display = 'inline'; // Show edit button if its task is the only selected
            } else {
                button.style.display = 'none'; // Hide edit button if its task is not the only selected
            }
        });
    }
});
