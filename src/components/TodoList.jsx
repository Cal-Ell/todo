import React from 'react';
import { useSelector } from 'react-redux';
import TodoItem from './TodoItem';

const TodoList = () => {
    const state = useSelector((state) => state.todos);

  return (
    <div className="todo_list">
        <div className='todos'>
            {state && state.length > 0 ? (
                state.map(x => (
                    <TodoItem key={x.id} id={x.id} title={x.title} completed={x.completed} />
                ))
            )
            : (
            <div className='empty_tasks'>
                <h1>Currently no tasks</h1>
            </div>
            )
            }
        </div>
    </div>
  )
}

export default TodoList