import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';

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

  componentDidMount() {
    this.callApi()
      .then(res => this.setState({response: res.express}))
      .catch(err => console.log(err));
  };

  callApi = async () => {
    const response = await fetch('/api/hello');
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
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
    const body = await response.text();
    
    this.setState({loggedIn: body});
  };

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

  render() {
    if (!this.state.loggedIn || this.state.loggedIn === "false"){
      return (
        <div className="App">
          <header className="App-header">
            <p>
              Thank you for using My App! 
            </p>
          </header>

          
          <form onSubmit={this.loginRequest}>
            <p>Username:</p>
            <input
              id = "username"
              type="text"
              value={this.state.credentials.username}
              onChange={e=>this.setState({
                credentials:{
                  ...this.state.credentials,
                  username: e.target.value
                }
              })}
            />
            <p>Password:</p>
            <input
              id = "password"
              type="password"
              value={this.state.credentials.password}
              onChange={e=>this.setState({
                credentials:{
                  ...this.state.credentials,
                  password: e.target.value
                }
              })}
            />
            <br/>
            <button type="submit">Login</button>
            <br/>
            <button onClick={this.createAccount}>Create Account</button>
          </form>
          <p>{this.state.responseToPost}</p>
        </div>
      );
    }
    if(this.state.loggedIn === "true"){
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
