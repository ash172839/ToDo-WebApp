import { doAjax } from '../data/services/ajax.js';
import { Task_Operations } from '../data/services/task-operations.js';

window.addEventListener('load', init)

import { RegexValidator } from '../utils/regex-validator.js';
import Task from "../data/models/task.js";


function bindEvents() {
    document.getElementById("add").addEventListener('click', addTask);
    document.getElementById("remove").addEventListener('click', removeTask);
    document.getElementById("save").addEventListener('click', save);
    document.getElementById("load").addEventListener('click', load);
    document.getElementById("update").addEventListener('click', update);
    document.getElementById("search").addEventListener('click', searchTask);
    document.getElementById("clear-all").addEventListener('click', clearAll);
    document.getElementById("load-from-server").addEventListener('click', loadFromServer);
}

async function loadFromServer() {
    try {
        const result = await doAjax();
        console.log("Result of task.json is ", result['tasks']);
        Task_Operations.tasks = result['tasks'];
        printTaskTable(Task_Operations.tasks);
        showCount();
    } catch (err) {
        alert("Some Error Occurred");
        console.log(err);

    }
}

function clearAll() {
    document.querySelector('#total').innerHTML = '';
    document.querySelector('#mark').innerHTML = '';
    document.querySelector('#unmark').innerHTML = '';
    document.querySelector('#tasks').innerHTML = '';
    for (let field of fields) {
        document.querySelector(`#${field}`).value = '';
    }
}

function update() {
    for (let field of fields) {
        taskObject[field] = document.querySelector(`#${field}`).value;
    }
    printTaskTable(Task_Operations.save());
    showCount();
}

function init() {
    bindEvents();
    showCount();
    disableButtons();
}

function save() {
    if (window.localStorage) {
        const tasks = Task_Operations.save();
        localStorage.tasks = JSON.stringify(tasks);
        for (const taskObject of tasks) {
            const dateValue = taskObject['date'];
            const timeValue = taskObject['time'];

            if (dateValue && timeValue && !taskObject.isSentToAutoRemote) {
                const dateTimeString = `${dateValue}T${timeValue}:00`;
                const timestamp = Math.floor(new Date(dateTimeString).getTime() / 1000);

                const taskName = taskObject['name'];
                const taskDesc = taskObject['desc'];

                sendToAutoRemote(timestamp, taskName, taskDesc);
                taskObject.isSentToAutoRemote = true;
            }
        }
        alert("Data Saved Successfully...");
    } else {
        alert("Outdated Browser No Support of Local Storage...");
    }
}

function load() {
    if (window.localStorage) {
        if (localStorage.tasks) {
            const tasks = JSON.parse(localStorage.tasks);
            Task_Operations.tasks = tasks.map(obj => {
                const task = new Task(obj.id, obj.name, obj.desc, obj.date, obj.time, obj.url);
                task.isMarked = obj.isMarked; // preserve marked state
                task.isSentToAutoRemote = obj.isSentToAutoRemote || false;
                return task;
            });
            printTaskTable(Task_Operations.tasks);
            showCount();
        } else {
            alert("You Don't have any previous Tasks");
        }
    } else {
        alert("Outdated Browser No Support of Local Storage...");
    }
}

function photo(url) {
    const imageTag = document.createElement('img');
    imageTag.src = url;
    imageTag.className = 'size';
    return imageTag;
}

const fields = ['id', 'name', 'desc', 'date', 'time', 'url'];

function addTask() {
    const taskObject = {};
    for (let field of fields) {
        let fieldValue = document.querySelector(`#${field}`).value;
        const isValid = RegexValidator.validate(field, fieldValue);
        if (!isValid) {
            alert(`Invalid ${field} format.`);
            return;
        }
        taskObject[field] = fieldValue;
    }
    const isDuplicate = Task_Operations.tasks.some(task => task.id === taskObject.id);
    if (isDuplicate) {
        alert(`Task with ID ${taskObject.id} already exists.`);
        return;
    }
    Task_Operations.add(taskObject);
    printTask(taskObject);
    showCount();
    clearFields();
}

function clearFields() {
    for (let field of fields) {
        document.querySelector(`#${field}`).value = '';
    }
    document.querySelector('#id').focus();
}
let taskObject;

function edit() {
    const icon = this;
    const taskId = icon.getAttribute('task-id');
    taskObject = Task_Operations.search(taskId);
    if (taskObject) {
        for (let key in taskObject) {
            if (key === 'isMarked') {
                continue;
            }
            document.querySelector(`#${key}`).value = taskObject[key];
        }
        document.querySelector('#update').disabled = false;
    }
}

function removeTask() {
    const tasks = Task_Operations.delete();
    printTaskTable(Task_Operations.tasks);
    showCount();
}

function printTaskTable(tasks) {
    document.querySelector('#tasks').innerHTML = '';
    tasks.forEach(printTask);
}

function printTask(taskObject) {
    const tbody = document.querySelector('#tasks');
    const tr = tbody.insertRow();
    for (let key in taskObject) {
        if (key === 'isMarked') {
            continue;
        }
        let td = tr.insertCell();
        if (key === 'url') {
            td.appendChild(photo(taskObject[key]));
            continue;
        }
        td.innerText = taskObject[key];
    }
    let td = tr.insertCell();
    td.appendChild(createIcon('fa-pen', edit, taskObject.id));
    td.appendChild(createIcon('fa-trash', toggleDelete, taskObject.id));
}

function createIcon(className, fn, taskId) {
    const iconTag = document.createElement('i');
    iconTag.className = `fa-solid ${className} me-2 hand`;
    iconTag.addEventListener('click', fn);
    iconTag.setAttribute('task-id', taskId);
    return iconTag;
}

function disableButtons() {
    document.querySelector('#remove').setAttribute("disabled", true);
    document.querySelector('#update').setAttribute("disabled", true);
}

function toggleDelete() {
    console.log("toggle delete", this);
    let icon = this;
    const tr = this.parentNode.parentNode;
    const taskId = icon.getAttribute('task-id');
    Task_Operations.toggleMark(taskId);
    tr.classList.toggle("alert-danger");
    showCount();
    const enableOrDisabled = Task_Operations.getMark() > 0 ? false : true;
    document.querySelector('#remove').disabled = enableOrDisabled;
}

function showCount() {
    document.querySelector('#total').innerText = Task_Operations.getSize();
    document.querySelector('#mark').innerText = Task_Operations.getMark();
    document.querySelector('#unmark').innerText = Task_Operations.getUnMark();
}

function searchTask() {
    const id = document.querySelector('#id').value.trim();

    if (!RegexValidator.validate('id', id)) {
        alert("Invalid ID format.");
        return;
    }

    const task = Task_Operations.search(id);
    if (task) {
        printTaskTable([task]); // show only the searched task
        showCount();
    } else {
        alert("No task found with this ID.");
    }
}


function sendToAutoRemote(timestamp, name, desc) {
    const key = "dUhPcPb434U:APA91bHHstp8JCxbapDuOnNVhbVNiUjYxQgR_gg5_PSWvSnaYZX9oF_DvcRgT9g10j5NzCjOO2rTLH1VTf1yajzwEYpBIrkRcGxpXPnNhhEI3baeOMFNva4";

    // Format message as key-value pairs separated by =:
    const messageString = `${timestamp}:${encodeURIComponent(name)}:${encodeURIComponent(desc)}`;

    const url = `https://autoremotejoaomgcd.appspot.com/sendmessage?key=${key}&message=${messageString}`;

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("Network response was not OK");
            console.log("AutoRemote message sent:", messageString);
        })
        .catch(error => {
            console.error("Failed to send AutoRemote message:", error);
        });
}