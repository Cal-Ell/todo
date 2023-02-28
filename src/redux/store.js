import { configureStore } from '@reduxjs/toolkit';
import todoReducer from './reducerSlice';

export default configureStore({
	reducer: {
		todos: todoReducer,
	},
});