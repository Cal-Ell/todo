import React, {useState} from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { addTodo } from '../redux/reducerSlice';

const TodoInput = () => {
    const [title, setTitle] = useState('');
    const dispatch = useDispatch();

    const handleChange = (e) => {
        setTitle(e.target.value);
    }
    
    const handleSubmit = (e) => {
        e.preventDefault();

        if(title === ''){
            toast.error('Please enter title');
            return;
        }
            
        dispatch(addTodo({   
            title: title
        }));
        
        toast.success('Task Successfully Created!');
        
        setTitle('');
    }

  return (
    <div className='todo_input'>
        <div className='title'>
            <input placeholder='Title' value={title} type='text' onChange={e => handleChange(e)}/>
        </div>
        <div className='submit_button'>
            <button type="submit" variant="primary" onClick={handleSubmit}>Add</button>
        </div>
    </div>
  )
}

export default TodoInput