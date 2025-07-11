import { Task_Operations } from '../data/services/task-operations.js';
window.addEventListener('load',bindEvents)
export function bindEvents() {
    document.getElementById("add").addEventListener('click',addTask);
}

export function addTask(){
    const fields=['id','name','desc','date','time','url'];
    const taskObject={};
    for(let field of fields){
        let fieldValue=document.querySelector(`#${field}`).value;
        taskObject[field]=fieldValue;
    }
    Task_Operations.add(taskObject);
    
}