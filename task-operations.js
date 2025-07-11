import Task from '../models/task.js';
export const Task_Operations={
    getSize(){
        return this.tasks.length;
    },

    getMark(){
        return 0;
    },

    getUnMark(){
        return 0;
    },
    
    tasks:[],
    add(taskObject){
        let task=new Task();
        for(let key in taskObject){
            task[key]=taskObject[key];
        }
        this.tasks.push(task);
        console.log(this.tasks);
        
    },
    delete(){

    },
    update(){

    },
    search(){

    },
    save(){

    },
    clearAll(){

    }
}