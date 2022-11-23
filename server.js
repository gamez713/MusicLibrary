const express = require("express");
const session = require("express-session");
const flash = require("express-flash");
const app = express();
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(flash());
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
}));

// Passport
const initPassport = require("./helpers/passConfig");
const passport = require("passport");
initPassport(passport);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.set("view engine", "ejs");
const accountRoute = require("./routes/Account");
const addalbumRoute = require("./routes/Addalbum");
const addsongRoute = require("./routes/Addsong");
const browseRoute = require("./routes/Browse");
const dashARoute = require("./routes/dashAdmin");
const dashLRoute = require("./routes/dashListener");
const dashMRoute = require("./routes/dashMusician");
const insightsRoute = require("./routes/Insights");
const loginRoute = require("./routes/Login");
const logoutRoute = require("./routes/Logout");
const musicplayerRoute = require("./routes/Musicplayer");
const registerRoute = require("./routes/Register");
const usersongsRoute = require("./routes/Usersongs");
app.use("/account", accountRoute);
app.use("/addalbum", addalbumRoute);
app.use("/addsong", addsongRoute);
app.use("/browse", browseRoute);
app.use("/dashAdmin", dashARoute);
app.use("/dashListener", dashLRoute);
app.use("/dashMusician", dashMRoute);
app.use("/insights", insightsRoute);
app.use("/login", loginRoute);
app.use("/", logoutRoute);
app.use("/musicplayer", musicplayerRoute);
app.use("/register", registerRoute);
app.use("/usersongs", usersongsRoute);
app.get("/", (req, res) => {
    res.render("index");
});

// PORT
const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=>{
    console.log(`Server running on port:${PORT}`)
});