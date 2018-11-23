const express = require('express');
const bodyParser = require('body-parser');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();
const port = process.env.PORT || 5000;

const sqlite3 = require('sqlite3').verbose();



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let connectToDatabase = () => {
  
  let db = new sqlite3.Database('./db/scheduler.db', (err) => {
    if (err) {
      return console.error(err.message);
    }

    console.log('Connected to DB');
    })
  return db;
 };

let hash = (username) => (password) => {
  bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {
      let db = connectToDatabase();
        db.run(`INSERT INTO user(userID, passHash, passSalt) VALUES (${username}, ${hash}, ${salt})`, function(err){
          if (err){
            return console.log(err.message);
          }
          console.log("A row has been inserted.")
        });
        return hash;// Store hash in your password DB.
    });
});
};

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
    let hashedPassword = hash(req.body.login.username)(req.body.login.password);
    console.log(hashedPassword);
    res.send(
        `Username: ${req.body.login.username} and Password: \"${hashedPassword}\"`
    );
});

app.listen(port, () => console.log(`Listening on port ${port}`));



