import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';

import Login from './Login';
import Home from './Home';

class App extends Component {

  state = {
    response: '',
    post: '',
    responseToPost: '',
    username: '',
    loggedIn: false,
    token: null,
  };


  logInUpdate = (logInStatus) =>{
    this.setState({loggedIn: logInStatus})
  };

  updateState = (state) => {
    this.setState({username: state.username,token: state.token})
  };

  render() {
    if (!this.state.loggedIn || this.state.loggedIn === "false"){
      return (
        <Login logInUpdate={this.logInUpdate}
              updateState={this.updateState}/>
      );
    }
    if(this.state.loggedIn ||this.state.loggedIn === "true"){
      return (
        <Home username={this.state.username} token={this.state.token} />
      );
    }
  }
}

export default App;
