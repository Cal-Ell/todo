import React from 'react';
import Header from './Header';
import { Box, Container } from '@mui/system';


const Todo = () => {
  return (
    <div>
        <Container maxWidth="xs">
            <Box 
                sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <Header />
            </Box>
            
        </Container>
        
    </div>
  )
}

export default Todo