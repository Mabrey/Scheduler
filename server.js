const express = require('express');
const bodyParser = require('body-parser');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();
const port = process.env.PORT || 5000;

const sqlite3 = require('sqlite3').verbose();

const cookieParser = require('cookieParser');
const session = require('express-session');

let userCount;
let db; 
//= connectToDatabase();

initialize();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({secret: "shh"}));


app.get('/api/hello', (request, response) => {
  response.send({ express: 'Hello From Express' });
});

app.post('/api/world', (request, response) => {
  response.send(
    `I received your POST request. This is what you sent me: ${request.body.post}`,
  );
});

app.post('/api/loginRequest', async (request,response) =>{

    /**
     *  @param request {username: , password: }
     * 
     * The username is verified to be valid and exists. 
     * 
     * The password is verified to be valid and correct.
     * 
     * ? What do I want to respond with?
     * ? Something to verify they are still logged in?
     * ? or just grant them a new api?
     */
    let username = request.body.credentials.username;
    let password = request.body.credentials.password;

    try {

      let loginAttempt = async (username, password) => {
        return new Promise(async (resolve, reject) => {
          //private user hashPass 
          //? Should I use closures like this, or should i make these private functions?
          try{
            let getUserHash = (username) => {
              return new Promise((resolve, reject) => {
                let sql = `SELECT user.passHash FROM user WHERE username = ?`;
                hashQuery = db.get(sql, [username], (err, row) => {
                  if (err){
                    reject(err.message);
                  }
                  resolve(row.passHash);
                });
              });
            };

            let hash = await getUserHash(username);
            let passwordMatch = await checkPassword(password, hash);
            resolve(passwordMatch);
          }
          catch(error){reject(error)};
        })
      }
      let loginStatus = await loginAttempt(username, password);
      response.send(loginStatus);
    }
    catch(error){
      response.send(error);
    };
});

app.post('/api/createAccount', async (request, response) =>{
  /** 
   * @param request is a request with a potenial username and password combination
   * @param response is a response that indicates the status of the attempted account creation. 
   * 
   * The username is verified to be valid and available first.
   * The password is verified to be valid.
   * The password is passed into a hash function which returns the hash and salt.
   * The user count is updated so we can assign the user to a unique ID, which is current count + 1.
   * A SQL prepared statement controls the input we can insert. 
   * Initially, we only input the userID, username, hash, salt, and authType (default: "user").
   * The insert statement is then run with the user's parameters, and a status is returned and shown to the user.
  */
  let username = request.body.credentials.username;
  let password = request.body.credentials.password;

  
  try{
    await isUsernameValid(username);
    await isUsernameAvailable(username);
    await isPasswordValid(password);
    let hashResult = await hash(password);
    await updateUserCount();

    let sql = `INSERT INTO user(userID, username, firstName, lastName, passHash, passSalt, authType) 
              VALUES(?,?,?,?,?,?,?)`;
    let insertParameters = [userCount+1, username, "NULL", "NULL", hashResult.hash, hashResult.salt, "user"];
    
    let createStatus = await insertUserInDB(sql, insertParameters);

    response.send(`${createStatus}`);
  } catch (error){
    response.send(error);
  }
})

app.listen(port, () => console.log(`Listening on port ${port}`));

async function initialize(){
  db = await connectToDatabase();
  userCount = await getUserCount();

}

function updateUserCount(){
  return new Promise(async (resolve, reject) =>{
    try{
      userCount = await getUserCount();
      resolve("Success");
    }
    catch(error){
      reject("Failed");
    }
  });
};

function connectToDatabase() {
  return new Promise((resolve, reject) => {
    let db = new sqlite3.Database('./db/scheduler.db', (err) => {
      if (err) {
        console.error(err.message);
        reject(err);
      }
      else {
        console.log('Connected to DB');
        resolve(db);
      } 
    })
  })
};

async function getUserCount() {
  let sql = "SELECT MAX(userID) AS userCount FROM user";
  let userCount = await getMaxUserID(sql);
  return userCount;
};

function getMaxUserID(sql){
  return new Promise((resolve, reject) => {
    db.get(sql, (err, row) => {
      if (err){
        console.error(err.message);
        reject(err);
      }
      else {resolve(row.userCount);}
    });
  })
}

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

function checkPassword(password, hash){
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, function(err, res) {
        if(res){
          resolve("Login Successful");
        }
        else reject("Login Failed");
      })
  })
};

async function isUsernameAvailable(username){
  return new Promise(async(resolve, reject) => {
    //let db = connectToDatabase();
    let sql = `SELECT EXISTS(SELECT username FROM user WHERE username = ?) AS taken`;
    
    let taken = await checkUsernameInDB(sql, username);
    
    if (!taken){
      resolve("hello");
    }
    else{
      reject("Username Not Available");
    }
  });
};

async function checkUsernameInDB(sql, username){
  return new Promise((resolve, reject) => {
    db.get(sql, [username], (err, row) => {
      if (err){
        reject(err.message);
      }
      resolve(row.taken);
    });
  });
}

function insertUserInDB(sql, params){
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err){
      if (err){
        reject("Cannot insert user.");
      }
      else{
        resolve("User account created.")
      }
    });
  })
};

function isUsernameValid(username){
  return new Promise((resolve, reject) => {
    //can have uppercase, lowercase, numbers, _, ., and \,
    // but not allow 2 punctuation marks to occur together
    //or start/end with them. 
    let pattern = /^(?=.*[a-zA-Z].*[a-zA-Z].*)\w(?!.*[._]{2,}|.*[._]$)(\w|[._]){4,15}$/;
    if(username.match(pattern)){
      resolve();
    }
    else reject("Username Has Invalid Format");
  });
};

function isPasswordValid(password){
  return new Promise((resolve, reject) => {
    let pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    if(password.match(pattern)){
      resolve();
    }
    else {
      reject("Password Not Valid");
    }
  });
}