import { createSlice } from '@reduxjs/toolkit';
import { nanoid } from 'nanoid';


const todoSlice = createSlice({
    name: 'todos',
    initialState: [],
    reducers: {
        addTodo: (state, action) => {
            const newTodo = {
                id: nanoid(),
                title: action.payload.title,
                completed: false
            };
            state.push(newTodo)
        },
        updateTodo: (state, action) => {
            const index = state.findIndex(x => x.id === action.payload.id);
            //state[index].title = action.payload.title;
            state[index].completed = action.payload.completed;
        },
        deleteTodo: (state, action) => {
            return state.filter(x => x.id !== action.payload.id);
        }
    }
});

export const {addTodo, updateTodo, deleteTodo} = todoSlice.actions;
export default todoSlice.reducer;