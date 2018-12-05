const express = require('express');
const bodyParser = require('body-parser');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();
const port = process.env.PORT || 5000;

const sqlite3 = require('sqlite3').verbose();

let userCount;
let db; 
//= connectToDatabase();

initialize();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.post('/api/loginRequest', async (request,response) =>{

    /**
     *  @param request {username: , password: }
     * 
     * The username is verified to be valid and exists. 
     * The password is verified to be valid and correct.
     * If the credentials are correct, then the user will be redirected to the next page.
     * 
     * ? What do I want to respond with?
     * ? Something to verify they are still logged in?
     * ? or just grant them a new api?
     */
    let username = request.body.credentials.username;
    let password = request.body.credentials.password;

    try {
      await isUsernameValid(username);
      let available = await isUsernameAvailable(username);
      if (available){
        let result = {
          loginStatus: false,
          token: null
        };
        return response.send(result);
      }
      await isPasswordValid(password);

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
      };

      let loginStatus = await loginAttempt(username, password);
      let token = buildUserToken(username);

      let result = {
        loginStatus: loginStatus,
        token: token,
      };

      //

      //result = JSON.stringify(result);
      
      response.send(result);
    }
    catch(error){
      let result = {
        loginStatus: false,
        token: null
      };
    
      console.log(result);
      response.send(result);
    };
});

app.post('/api/createAccount', async (request, response) =>{
  /** 
   * @param request is a request with a potential username and password combination
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
    let available = await isUsernameAvailable(username);
    if(!available){
      response.send("Username Already Exists")
    };


    await isPasswordValid(password);
    let hashResult = await hash(password);
    await updateUserCount();

    let sql = `INSERT INTO user(userID, username, firstName, lastName, passHash, passSalt, authType) 
              VALUES(?,?,?,?,?,?,?)`;
    let insertParameters = [userCount+1, username, "NULL", "NULL", hashResult.hash, hashResult.salt, "user"];
    
    let insertUserInDB = insertInDB(sql, insertParameters);
    let createStatus = await insertUserInDB("User Successfully Added", "User Could Not be Added");

    response.send(`${createStatus}`);
  } catch (error){
    response.send(error);
  }
});

app.post('/api/getUserEvents', async (request, response) => {
  let username = request.body.username;
  try{
    let events = await getUserEvents(username);
    console.log(events);
    response.send(events);
  }catch(error){
    response.send(error);
  }

});

app.post('/api/generateSchedule', async (request, response) =>{

});

app.post('/api/enrollInClass', async (request, response) => {
  /** 
   * @param request is a request with a potential username and password combination
   * @param response is a response that indicates the status of the attempted account creation. 
   * 
  */

  // Get variables for 'enroll'
  let classID = 'NULL';
  let userID = 'NULL';
  let enrolledDate = 'NULL';

  try {
    let sql = `INSERT INTO studentEnrollment(classID, userID, enrolledDate) 
              VALUES(?,?,?)`;
    let insertParameters = [eventID, classID];
    let insert = insertInDB(sql, insertParameters);
    let createStatus = await insert("Successfully Enrolled", "Not Successfully Enrolled");

    response.send(`${createStatus}`);
  } catch (error) {
    response.send(error);
  }
});

app.post('/api/addClass', async (request, response) => {
  /** 
   * @param request is a request with a potential username and password combination
   * @param response is a response that indicates the status of the attempted account creation. 
   * 
  */

  // Get variables for 'addClass'
  let classID = 'NULL';
  let name = 'NULL';
  let professorID = 'NULL';
  let rotation = 'NULL';
  let startTime = 'NULL';
  let endTime = 'NULL';
  let startDate = 'NULL';
  let endDate = 'NULL';

  try {
    let sql = `INSERT INTO class(classID, name, professorID, rotation, startTime, endTime, startDate, endDate) 
              VALUES(?,?,?,?,?,?,?,?)`;
    let insertParameters = [classID, name, professorID, rotation, startTime, endTime, startDate, endDate];
    let insert = insertInDB(sql, insertParameters);
    let createStatus = await insert("Class Successfully Added", "Class Could Not be Added");

    response.send(`${createStatus}`);
  } catch (error) {
    response.send(error);
  }
});

app.post('/api/addEvent', async (request, response) => {
  /** 
   * @param request is a request with a potential username and password combination
   * @param response is a response that indicates the status of the attempted account creation. 
   * 
  */

  // Get variables for 'addEvent'
  let eventID = '';
  let username = request.body.staticEvent.username;
  let userID;
  let name = request.body.staticEvent.eventName;
  let description = request.body.staticEvent.eventDesc;
  let startDate =
   `${request.body.staticEvent.startMonth}/${request.body.staticEvent.startDay}/${request.body.staticEvent.startYear}`;

  let endDate = startDate;
  let startTime = request.body.staticEvent.startTime;
  let endTime = request.body.staticEvent.endTime;
  let createStatus;

  try{
    userID = await getUserID(username);
    eventID = await getNextEventID();
    console.log(eventID);
    if(isNaN(eventID))
      eventID = 1;
    let sql = `INSERT INTO event(eventID, userID, name, description) 
                VALUES(?,?,?,?)`;
    let insertParameters = [eventID, userID, name, description];
    let insert = insertInDB(sql, insertParameters);
    await insert("Event Successfully Added To Event", "Event Could Not be Added To Event");
    
    sql = `INSERT INTO eventTimes(eventID, startDate, endDate, startTime, endTime)
          VALUES(?,?,?,?,?)`;
    insertParameters = [eventID, startDate, endDate, startTime, endTime];
    insert = insertInDB(sql, insertParameters);
    createStatus = await insert("Event Successfully Added To Event Time", "Event Could Not be Added To Event Time");
    console.log(createStatus);
    response.send(createStatus);
  } catch(error){
    console.log(error)
    response.send("Unable To Complete Insertion");
  }


  // try{
  //   let transactionDB = await connectToDatabase();

  //   try {
  //     userID = await getUserID(username);
  //     eventID = await getNextEventID();
  //     transactionDB.serialize(async function() {
  //       try{
  //       transactionDB.run("BEGIN;");
  //       let sql = `INSERT INTO event(eventID, userID, name, description) 
  //               VALUES(?,?,?,?)`;
  //       let insertParameters = [eventID, userID, name, description];
  //       let insert = insertTransaction(transactionDB, sql, insertParameters);
  //       await insert("Event Successfully Added To Event", "Event Could Not be Added To Event");
        
  //       sql = `INSERT INTO eventTimes(eventID, startDate, endDate, startTime, endTime)
  //             VALUES(?,?,?,?)`;
  //       insertParameters = [eventID, startDate, endDate, startTime, endTime];
  //       insert = insertTransaction(transactionDB, sql, insertParameters);
  //       createStatus = await insert("Event Successfully Added To Event Time", "Event Could Not be Added To Event Time");
  //       transactionDB.run('COMMIT');
  //       } catch(error){
  //         response.send(error);
  //       }
  //     })
      
  //     response.send(`${createStatus}`);
  //   } catch (error) {
  //     transactionDB.run('ROLLBACK')
  //     response.send(error);
  //   }
  // }
  // catch(error){
  //   response.send(error);
  // }
});

app.post('/api/inputFlexEvent', async (request, response) =>{

});

app.post('/api/modifyEvent', async (request, response) =>{

});

app.post('/api/addClasswork', async (request, response) => {
  /** 
   * @param request is a request with a potential username and password combination
   * @param response is a response that indicates the status of the attempted account creation. 
   * 
  */

  // Get variables for 'addClasswork'
  let eventID = 'NULL';
  let classID = 'NULL';

  try {
    let sql = `INSERT INTO classwork(eventID, classID) 
              VALUES(?,?)`;
    let insertParameters = [eventID, classID];
    let insert = insertInDB(sql, insertParameters);
    let createStatus = await insert("Classwork Successfully Added", "Classwork Could Not be Added");

    response.send(`${createStatus}`);
  } catch (error) {
    response.send(error);
  }
});

app.post('/api/addClassEvent', async (request, response) => {
  /** 
   * @param request is a request with a potential username and password combination
   * @param response is a response that indicates the status of the attempted account creation. 
   * 
  */

  // Get variables for 'addClassEvent'
  let eventID = 'NULL';
  let classID = 'NULL';
  let userID = 'NULL';
  let name = 'NULL';
  let description = 'NULL';

  try {
    let sql = `INSERT INTO classwork(eventID, classID) 
              VALUES(?,?)`;
    let insertParameters = [eventID, classID];
    let insert = insertInDB(sql, insertParameters);
    let createStatus = await insert("Classwork Successfully Added", "Classwork Could Not be Added");

    response.send(`${createStatus}`);
  } catch (error) {
    response.send(error);
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));

async function initialize(){
  /**
   * This function initializes the database connection and updates the user count.
   */
  db = await connectToDatabase();
  userCount = await getUserCount();

}

function getUserEvents(username){
  return new Promise(async (resolve, reject) => {
    try{
    let userID = await getUserID(username);
    let sql =
     `CREATE VIEW events
      AS SELECT event.eventID as id, name, description, startDate, endDate, startTime, endTime
      FROM event, eventTimes
      WHERE userID = ? AND event.eventID = eventTimes.eventID;`;
    let events = [];
    let params = [userID];
    db.all(sql, params, (err, rows) => {
      if(err){
        reject(err);
      }
      rows.forEach((row) => {
        let event ={
          eventID: row.id,
          name: row.name,
          description: row.description,
          startDate: row.startDate,
          endDate: row.endDate,
          startTime: row.startTime,
          endTime: row.endTime,
        };
        events.push(event);
      });
    });
    resolve(events);
  }catch(err){
    reject(err);
  }
  })
}

async function getUserCount() {
  /**
   * Creates a sql query and returns the user count as the max user ID.
   */
  let sql = "SELECT MAX(userID) AS userCount FROM user";
  let userCount = await getMaxUserID(sql);
  return userCount;
};

function getMaxUserID(sql){
  /**
   * ! This statement could be generalized as just running sql statements.
   * ? maybe just make a named instance of this function to make use clearer. 
   * ? Ex: getMaxUserID = thisFunc(); getMaxUserID(sql);
   */
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

function updateUserCount(){
  /**
   * returns a promise that gives the count of users in the database. 
   */
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

function getUserID(username){
  /**
   * @param sql a prepared statement for username existence check.
   * @param username a string that the user supplies to be checked.
   * 
   * returns a promise that gives userID.
   */
  return new Promise((resolve, reject) => {
    let sql = `SELECT userID FROM user WHERE username = ?`;
    db.get(sql, [username], (err, row) => {
      if (err){
        reject(err.message);
      }
      resolve(row.userID);
    });
  });
};

function getNextEventID(){
  /**
   * returns a promise that gives next event id.
   */
  return new Promise((resolve, reject) => {
    let sql = `SELECT MAX(eventID) as maxEventID FROM event`;
    db.get(sql, (err, row) => {
      if (err){
        reject(err.message);
      }
      resolve(parseInt(row.maxEventID) + 1);
    });
  });
};

function connectToDatabase() {
  /**
   * Creates a database object that connects to the scheduler database.
   * returns the database object to be used to complete queries.
   */
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

function hash(password) {
  /**
   * Creates and returns a promise which generates a salt and hashes
   * the supplied password using bcrypt. The hash and salt are
   * returned in the resolve.
   */
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

function isPasswordValid(password){
  /**
   * @param password takes a string provided from the user as a potential password.
   * 
   * returns a promise which validates or rejects if the password matches the correct pattern.
   */
  return new Promise((resolve, reject) => {
    let pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    if(password.match(pattern)){
      resolve();
    }
    else {
      reject("Password Not Valid");
    }
  });
};

function checkPassword(password, hash){
  /**
   * !seems to always return true;
   * compares the password givin to the hash of the password requested by the user. 
   */
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, function(err, res) {
        if(res){
          //resolve("Login Successful");
          resolve(true);
        }
        else reject(false);//reject("Login Failed");
      })
  })
};

function isUsernameValid(username){
  /**
   * @param username a string given by the user as a potential username.
   * 
   * returns a promise that detects if a username follows the required pattern.
   */
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

async function isUsernameAvailable(username){
  /**
   * @param username takes a string as input for the prepared statement.
   * Checks the database to see if the selected username is available during account creation
   */
  return new Promise(async(resolve, reject) => {
    
    let sql = `SELECT EXISTS(SELECT username FROM user WHERE username = ?) AS taken`;
    
    let taken = await checkUsernameInDB(sql, username);
    
    resolve(!taken);
  });
};

async function checkUsernameInDB(sql, username){
  /**
   * @param sql a prepared statement for username existence check.
   * @param username a string that the user supplies to be checked.
   * 
   * returns a promise that determines if the username exists.
   */
  return new Promise((resolve, reject) => {
    db.get(sql, [username], (err, row) => {
      if (err){
        reject(err.message);
      }
      resolve(row.taken);
    });
  });
};

function buildUserToken(username){
  /**
   * @param username supplies a username to build a token after authentication.
   * ? what should the token be comprised of?
   * 
   */

  let token = {
    username: username
  };

  token = JSON.stringify({token});
  return encodeURI(token);

};

function authenticateToken(username, token){
  /**
   * @param token supplies a token from the user when making a request.
   * Decrypts the token to verify the user making the request. 
   */

  let decryptToken = decodeURI(token);
  let tokenUsername = decryptToken.username;

  if (username === tokenUsername)
    return true;
    
  else return false;
}

function insertInDB(sql, params){
  
  /**
   * This function is used as a partial function to let new functions
   * use this insert behavior. 
   * 
   * @param sql takes a prepared statement.
   * @param params supplies parameters for prepared statement
   * 
   * * EX: let newInsertFunction = insertInDB(sql,params);
   * *     let message = await newInsertFunction(resMessage, rejMessage);
   */
   
  return(resMessage, rejMessage) =>{
    /**
     * @param resMessage supplies the message to return when resolved
     * @param rejMessage supplies the message to return when rejected
     */
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err){
        if (err){
          reject(`${rejMessage}`);
        }
        else{
          resolve(`${resMessage}`)
        }
      });
    })
  }
};

function insertTransaction(database, sql, params){
  
  /**
   * This function is used as a partial function to let new functions
   * use this insert behavior. 
   * @param database specifies a database object to use
   * @param sql takes a prepared statement.
   * @param params supplies parameters for prepared statement
   * 
   * * EX: let newInsertFunction = insertInDB(sql,params);
   * *     let message = await newInsertFunction(resMessage, rejMessage);
   */
   
  return(resMessage, rejMessage) =>{
    /**
     * @param resMessage supplies the message to return when resolved
     * @param rejMessage supplies the message to return when rejected
     */
    return new Promise((resolve, reject) => {
      database.run(sql, params, function(err){
        if (err){
          reject(`${rejMessage}`);
        }
        else{
          resolve(`${resMessage}`)
        }
      });
    })
  }
};