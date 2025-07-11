import { Task_Operations } from '../data/services/task-operations.js';
window.addEventListener('load',init)
function bindEvents() {
    document.getElementById("add").addEventListener('click',addTask);
}

function init(){
    bindEvents();
    showCount();
    disableButtons();
}
function addTask(){
    const fields=['id','name','desc','date','time','url'];
    const taskObject={};
    for(let field of fields){
        let fieldValue=document.querySelector(`#${field}`).value;
        taskObject[field]=fieldValue;
    }
    Task_Operations.add(taskObject);
    printTask(taskObject);
    showCount();
}
function createIcon(className,fn){
    const iconTag=document.createElement('i');
    iconTag.className=`fa-solid ${className} me-2 hand`;
    iconTag.addEventListener('click',fn);
    return iconTag;
}

function disableButtons(){
    document.querySelector('#remove').setAttribute("disabled",true);
    document.querySelector('#update').setAttribute("disabled",true);
}

function toggleDelete(){
    console.log("toggle delete");
    
}

function edit(){

}

function showCount(){
    document.querySelector('#total').innerText=Task_Operations.getSize();
    document.querySelector('#mark').innerText=Task_Operations.getMark();
    document.querySelector('#unmark').innerText=Task_Operations.getUnMark();
}

function printTask(taskObject){
    const tbody=document.querySelector('#tasks');
    const tr=tbody.insertRow();
    for(let key in taskObject){
        let td=tr.insertCell();
        td.innerText=taskObject[key];
    }
    let td=tr.insertCell();
    td.appendChild(createIcon('fa-pen',edit));
    td.appendChild(createIcon('fa-trash',toggleDelete));
}