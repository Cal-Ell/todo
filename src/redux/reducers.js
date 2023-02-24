import { createSlice } from "@reduxjs/toolkit";

const getInitialTodo = () => {
    const localTodoList = window.localStorage.getItem('todolist');
    if(localTodoList){
        return JSON.parse(localTodoList)
    } 
    window.localStorage.setItem('todoList', [])
    return [];
}

const initialValue = {
    filterStatus: 'all',
    todoList: getInitialTodo()
}

export const todoSlice = createSlice({
    name: 'todo',
    initialState: initialValue,
    reducers: {
        //add reducers
        //update reducers
        //delete reducers
        //filter status
    }
});

export const {addTodo, updateTodo, deleteTodo, filterStatus} = todoSlice.actions;
export default todoSlice.reducer;