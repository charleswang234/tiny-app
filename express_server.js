const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
var cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

// **********************************************************************

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ['asdf'],
}));

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

function urlsForUser(id) {
  let filteredUrlDatabase = {};
  for (shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl].userID === id) {
      filteredUrlDatabase[shortUrl] = urlDatabase[shortUrl];
    }
  }
  return filteredUrlDatabase;
}

function noCurrentUser(req) {
  return req.session["user_id"] === undefined;
}

function userNotEqual(req) {
  return urlDatabase[req.params.id].userID !== req.session["user_id"];
}

// **********************************************************************

var urlDatabase = {
  // "b2xVn2": {
  //   longLink: "http://www.lighthouselabs.ca",
  //   userID: "admin"
  // },
  // "9sm5xK": {
  //   longLink:"http://www.google.com",
  //   userID: "admin"
  // }
};

const users = {};

// **********************************************************************

app.get("/", (req, res) => {
  if(noCurrentUser(req)) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.session["user_id"]),
    user: users[req.session["user_id"]]};
    res.render("urls_index", templateVars);
  });

app.post("/urls", (req, res) => {
  if (req.session["user_id"]) {
    var randomString = generateRandomString();
    urlDatabase[randomString] = {
      longLink: req.body.longURL,
  userID: req.session["user_id"]};
  res.redirect("/urls/" + randomString);
  } else {
  let templateVars = {user: users[req.session["user_id"]]};
  res.render("noAccess", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  if (!req.session["user_id"]){
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.session["user_id"]]};
      res.render("urls_new", templateVars);
    }
  });


app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    let templateVars = {user: users[req.session["user_id"]]};
    res.render("noPage", templateVars);
    return;
  }
  let longURL = urlDatabase[req.params.shortURL].longLink;
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  if (noCurrentUser(req) || userNotEqual(req)) {
    let templateVars = {user: users[req.session["user_id"]]};
    res.render("noAccess", templateVars);
    return;
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    let templateVars = {user: users[req.session["user_id"]]};
    res.render("noPage", templateVars);
  } else if (noCurrentUser(req) || userNotEqual(req)) {
    let templateVars = {user: users[req.session["user_id"]]};
    res.render("noAccess", templateVars);
  } else {
    let templateVars = {shortURL: req.params.id, longURL: urlDatabase[req.params.id].longLink,
      user: users[req.session["user_id"]]};
      res.render("urls_show", templateVars);
  }
});

app.post("/urls/:id", (req, res) => {
  if (noCurrentUser(req) || userNotEqual(req)) {
    let templateVars = {user: users[req.session["user_id"]]};
    res.render("noAccess", templateVars);
    return;
  }
  urlDatabase[req.params.id].longLink = req.body.longURL;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  if (users[req.session["user_id"]]) {
    res.redirect("/urls");
    return;
  }
  let templateVars = {
    user: users[req.session["user_id"]]};
  res.render("login", templateVars);
});


app.post("/login", (req, res) => {
  for (var userID in users) {
    if (users[userID].email === req.body.email
      && bcrypt.compareSync(req.body.password, users[userID].password)) {
     req.session["user_id"] = users[userID].id;
   res.redirect("/urls");
   return;
    }
  }
  res.status(403);
  res.send("error problem: 403");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  if (users[req.session["user_id"]]) {
    res.redirect("/urls");
    return;
  }
  let templateVars = {user: users[req.session["user_id"]]};
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400);
    res.send("Email or password is left empty");
    return;
  }

  for (userIDs in users) {
    if (users[userIDs].email === req.body.email) {
      res.status(400);
      res.send("This email has already been registered.");
      return;
    }
  }
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  let randomID = generateRandomString();
  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: hashedPassword
  };
  req.session["user_id"] = users[randomID].id;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

