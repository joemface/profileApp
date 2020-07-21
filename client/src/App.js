import React, { Fragment } from 'react';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import './App.css';
//we brought in fragment and delete all the code inside
// and added the arrow function. Fragment is a ghost element
// that won't show up in the DOM
const App = () => (
  <Fragment>
    <Navbar />
    <Landing />
  </Fragment>
);

export default App;
