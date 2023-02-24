import React from 'react';
import { Box, Container } from '@mui/system';
import { useSelector } from 'react-redux';
import { Button } from '@mui/material';


const Todo = () => {
  const todoList = useSelector((state) => state.todo.todoList);
  const filterStatus = useSelector((state) => state.todo.filterStatus);


  return (
    <div>
      <Box 
        sx={{border: '10px dashed grey', p: 34, marginTop: '60px'}}
      >
        <Button variant='contained'>Add Task</Button>
      </Box>
    </div>
  )
}

export default Todo