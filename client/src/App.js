import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';

class App extends Component {

  state = {
    response: '',
    post: '',
    responseToPost: '',
    login: {
      username: '',
      password: ''
    }
  };

  componentDidMount() {
    this.callApi()
      .then(res => this.setState({response: res.express}))
      .catch(err => console.log(err));
  }


  callApi = async () => {
    const response = await fetch('/api/hello');
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  handleSubmit = async e => {
    e.preventDefault();
    const response = await fetch('/api/fuckYou', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({post:this.state.post}),
    });
    const body = await response.text();
    
    this.setState({responseToPost: body});
  };

  LoginAttempt = async e => {
    e.preventDefault();
    const response = await fetch('/api/returnLogin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({login:this.state.login}),
    });
    const body = await response.text();
    
    this.setState({responseToPost: body});
  };


  render() {
    return (
      <div className="App">
        <header className="App-header">
          <p>
            Thank you for using My App! 
          </p>
        </header>

        
        <form onSubmit={this.LoginAttempt}>
          <p>Username:</p>
          <input
            id = "username"
            type="text"
            value={this.state.login.username}
            onChange={e=>this.setState({
              login:{
                ...this.state.login,
                username: e.target.value
              }
            })}
          />
          <p>Password:</p>
          <input
            id = "password"
            type="password"
            value={this.state.login.password}
            onChange={e=>this.setState({
              login:{
                ...this.state.login,
                password: e.target.value
              }
            })}
          />
          <br/>
          <button type="submit">Login</button>
        </form>
        <p>{this.state.responseToPost}</p>
      </div>
    );
  }
}

export default App;
