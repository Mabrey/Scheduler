const express = require('express');
const bodyParser = require('body-parser');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();
const port = process.env.PORT || 5000;

const sqlite3 = require('sqlite3').verbose();

let db = connectToDatabase();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));





app.get('/api/hello', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

app.post('/api/world', (req, res) => {
  console.log(req.body);
  res.send(
    `I received your POST request. This is what you sent me: ${req.body.post}`,
  );
});

app.post('/api/returnLogin', (req,res) =>{
    //let hashedPassword = hash(req.body.credentials.password);
    console.log(req.body.credentials.password);
    res.send(
        `Username: ${req.body.credentials.username} and Password: \"${req.body.credentials.password}\"`
    );
});

app.post('/api/createAccount', async (req, res) =>{

  let username = req.body.credentials.username;
  let password = req.body.credentials.password;

  //attemptAccountCreate(username, password);
  try{
    await isUsernameValid(username);
    await isUsernameAvailable(username);
    await isPasswordValid(password);
    let {hash, salt} = await hash(password);
    console.log(hash);
    console.log(salt);
    res.send(`Hash is ${hash}`);
  } catch (error){
    res.send(error);
  }
})

app.listen(port, () => console.log(`Listening on port ${port}`));

function connectToDatabase() {
  
  let db = new sqlite3.Database('./db/scheduler.db', (err) => {
    if (err) {
      return console.error(err.message);
    }

    console.log('Connected to DB');
    })
  return db;
 };


function hash(password) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
          if(err)
            reject(err);
          else resolve({hash, salt});
        });
      });
  })
};

function isUsernameAvailable(username){
  return new Promise((resolve, reject) => {
    //let db = connectToDatabase();
    let sql = `SELECT username FROM user WHERE username = ?`;
    
    let taken = db.get(sql, [username], (err, row) => {
        if (err){
          return console.error(err.message);
        }
        console.log(row);
        return row;
      });
    
    console.log(`Username: ${username}`);
    console.log(`Taken: ${taken}`);
    if (!taken){
      resolve();
    }
    else{
      console.log("Username not Available");
      reject("Username Not Available");
    }
  });
};

function isUsernameValid(username){
  return new Promise((resolve, reject) => {
    //can have uppercase, lowercase, numbers, _, ., and \,
    // but not allow 2 punctuation marks to occur together
    //or start/end with them. 
    let pattern = /^(?=.*[a-zA-Z].*[a-zA-Z].*)\w(?!.*[._]{2,}|.*[._]$)(\w|[._]){4,15}$/;
    if(username.match(pattern)){
      console.log("valid username");
       resolve();
    }
    else reject("Username Has Invalid Format");
  });
};

function isPasswordValid(password){
  return new Promise((resolve, reject) => {
    let pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    if(password.match(pattern)){
      console.log("password valid");
      resolve();
    }
    else {
      console.log("Password Not Valid");
      reject("Password Not Valid");
    }
  });
}