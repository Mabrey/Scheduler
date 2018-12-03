import React, { Component } from 'react';
//import logo from './logo.svg';
import './Login.css';

class Login extends Component {

  state = {
    response: '',
    post: '',
    responseToPost: '',
    credentials: {
      username: '',
      password: ''
    },
    loggedIn: false,
    token: null,
  };

  
/*
  componentDidMount() {
    this.callApi()
      .then(res => this.setState({response: res.express}))
      .catch(err => console.log(err));
  };
*/

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
      console.log("hello");
      let result = JSON.parse(body);
      console.log(result.loginStatus);

      let logInUpdate = this.props.logInUpdate;
      let updateToken = this.props.updateToken;
      this.setState({responseToPost: result.loginStatus});
      
      logInUpdate(result.loginStatus);
      updateToken(result.token);
      //this.setState({loggedIn: body});

      }catch(error){
        this.setState({loggedIn: false});   
      };
    
    
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
}

export default Login;
