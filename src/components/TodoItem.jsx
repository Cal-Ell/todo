import React, {useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateTodo, deleteTodo } from '../redux/reducerSlice';
import toast from 'react-hot-toast';
import Button from './Button';
import CheckButton from "./CheckButton";

const TodoItem = ({id, title, completed}) => {
    const dispatch = useDispatch();

    
    const handleDelete = () => {
        dispatch(deleteTodo({
            id: id
        }));
        toast.success('Task has been successfully Deleted');
    }

    const handleUpdate = () => {
        dispatch(updateTodo({
            id: id,
            completed: !completed
        }));
        
        toast.success('Task Status has been Updated');
    }

  return (
    <div className='todo_item'>
        <div className='todo' style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '2px',
            margin: '2px',
            border: 'solid white 3px',
            borderRadius: '4px'
        }}>
            <div className='todo_title'>
                <h2>{title}</h2>
            </div>
            <div className='todo_body' style={{
                display: 'flex',
                flexDirection: 'column'
            }}>
                <label>
                    <input key={id} type="checkbox" name='status' value={completed} onClick={handleUpdate}/>
                </label>
                <h3>{completed === true ? 'Completed' : 'Incomplete'}</h3>
                <CheckButton completed={completed} onClick={handleUpdate}/>
            </div>
            <div className='todo_footer'>
                <Button variant='secondary' onClick={handleDelete}>Delete</Button>
            </div>
        </div>
    </div>
  )
}

export default TodoItem