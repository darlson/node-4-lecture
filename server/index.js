require("dotenv").config();
const express = require("express");
const app = express();
const massive = require("massive");
const session = require("express-session");
const sessionCtrl = require('./controllers/sessionController')
const authCtrl = require('./controllers/authController')
const checkForSession = require('./middlewares/checkForSession')
const authenticateUser = require('./middlewares/authenticateUser')
const { SERVER_PORT, CONNECTION_STRING, SESSION_SECRET } = process.env;

app.use(express.json());
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: SESSION_SECRET,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  })
);

// session demonstration endpoint
app.get("/session", sessionCtrl.checkSession)

// auth endpoints
app.post('/auth/register', authCtrl.register)
app.post('/auth/login', checkForSession, authCtrl.login)
app.delete('/auth/logout', authCtrl.logout)

// SECRET STUFF
app.get('/api/secrets', authenticateUser, (req, res) => {
    res.status(200).send('SECRETS ABOUND')
})
app.get('/api/allUsers', authenticateUser, (req, res) => {
    res.status(200).send('Here are all the users:')
})

massive({
  connectionString: CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
}).then((dbInstance) => {
  app.set("db", dbInstance);
  console.log("DB Spun up");
  app.listen(SERVER_PORT, () =>
    console.log(`Authenticate me cap'n on port ${SERVER_PORT}`)
  );
});
