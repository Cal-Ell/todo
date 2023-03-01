import React from "react";
import TodoInput from "./components/TodoInput";
import TodoList from "./components/TodoList";
import { Toaster } from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  return (
    <>
      <div className='container' style={{textAlign: 'center', display: 'flex', flexDirection: 'column', alignContent: 'center'}}>
        <h1 className="title">To Do List</h1>
        <div className="todo_content" style={{
          border: '1px solid black',
          width: '700px',
          height: '400px',
          position: 'relative',
          left: '300px',
          top: '20px'
        }}>
          <TodoInput />
          <TodoList />
        </div>
      </div>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontSize: '1.4rem',
          },
        }}
      />
    </>
  );
}

export default App;