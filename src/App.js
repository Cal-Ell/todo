import React from "react";
import Todo from "./components/Todo";
import Header from "./components/Header";

function App() {
  return (
    <>
      <div className='container'>
        <Header />
        <Todo />
      </div>
    </>
  );
}

export default App;