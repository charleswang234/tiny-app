var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser');
app.use(cookieParser());

// ***********************************************************************

function generateRandomString() {
  let upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let lower = upper.toLowerCase();
  let digits = "0123456789";
  let alphanum = upper + lower + digits;

  let generatedString = "";
  for (let i = 0; i < 6; ++i) {
    generatedString += alphanum[Math.floor(Math.random() * alphanum.length)];
  }
  return generatedString;
}

// **********************************************************************


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");


// **********************************************************************

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },

  "john": {
    id: "johnsmith",
    email: "john@example.com",
    password: "smithjohn"
  }
}

// **********************************************************************

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]};
    res.render("urls_index", templateVars);
  });

app.post("/urls", (req, res) => {
  var randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL; //uses bodyparser
  res.redirect("http://localhost:8080/urls/" + randomString);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]};
    res.render("urls_new", templateVars);
  });


app.get("/u/:shortURL", (req, res) => {
 let longURL = urlDatabase[req.params.shortURL];
 res.redirect(longURL);
});


app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  let templateVars = { urls: urlDatabase};
  res.redirect("/urls");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {shortURL: req.params.id, longURL: urlDatabase[req.params.id],
    user: users[req.cookies["user_id"]]};
    res.render("urls_show", templateVars);
  });

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  //   let templateVars = { urls: urlDatabase};
  // res.render("urls_index", templateVars);
  res.redirect("/urls");
});

app.post("/login", (req, res) => {                /// need to modify
  res.cookie("username",req.body.username);
  //console.log(req.cookies);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]};
    res.render("register", templateVars);
  });

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400);
    res.send("error problem");
  }
  for (userIDs in users) {
    if (users[userIDs].email === req.body.email) {
      res.status(400);
      res.send("error problem");
    }
  }
  let randomID = generateRandomString();
  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie("user_id",users[randomID].id);
  res.redirect("/urls");
});





// ************************************************************

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});