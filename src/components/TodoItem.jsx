import React, {useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateTodo, deleteTodo } from '../redux/reducerSlice';
import toast from 'react-hot-toast';

const TodoItem = ({id, title, completed}) => {
    const dispatch = useDispatch();

    
    const handleDelete = () => {
        dispatch(deleteTodo({
            id: id
        }));
        toast.success('Task has been successfully Deleted');
    }

    const handleUpdate = () => {
        //setChecked(!checked);
        dispatch(updateTodo({
            id: id,
            completed: !completed
        }));
        
        toast.success('Task Status has been Updated');
    }

  return (
    <div className='todo_item'>
        <div className='todo'>
            <div className='todo_title'>
                <h2>{title}</h2>
            </div>
            <div className='todo_body'>
                <h3>{completed === true ? 'Completed' : 'Incomplete'}</h3>
                <label>
                    <input key={id} type="checkbox" name='status' value={completed} onClick={handleUpdate}/>
                </label>
            </div>
            <div className='todo_footer'>
                <button className='btn btn-danger' onClick={handleDelete}>Delete</button>
            </div>
        </div>
    </div>
  )
}

export default TodoItem