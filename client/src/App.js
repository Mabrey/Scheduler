import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';

import Login from './Login';

class App extends Component {

  state = {
    response: '',
    post: '',
    responseToPost: '',
    credentials: {
      username: '',
      password: ''
    },
    loggedIn: false,
  };

  /*
  componentDidMount() {
    this.callApi()
      .then(res => this.setState({response: res.express}))
      .catch(err => console.log(err));
  };
  

  loginRequest = async e => {
    e.preventDefault();
    const response = await fetch('/api/loginRequest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({credentials:this.state.credentials}),
    });

   
    try{
      const body = await response.text();
      console.log(body);
      this.setState({loggedIn: body});

      }catch(error){
        this.setState({loggedIn: false});   
      };
    
    
  }

  createAccount = async e => {
    e.preventDefault();
    const response = await fetch('/api/createAccount', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({credentials:this.state.credentials}),
    });
    const body = await response.text();

    this.setState({responseToPost: body});
  }
*/

  logInUpdate = (logInStatus) =>{
    this.setState({loggedIn: logInStatus})
  }

  render() {
    if (!this.state.loggedIn || this.state.loggedIn === "false"){
      return (
        <Login logInUpdate= {this.logInUpdate}/>
      );
    }
    if(this.state.loggedIn ||this.state.loggedIn === "true"){
      return (
          <div className="App">
          <header className="App-header">
            <p>
              Thank you for using My App! 
            </p>
            <p>You are now logged in</p>
          </header>
          </div>
      );
    }
  }
}

export default App;
