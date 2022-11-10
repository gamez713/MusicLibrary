// Express 
const express = require("express");
const session = require("express-session");
const flash = require("express-flash");
const app = express();
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(flash());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

// Passport
const initPassport = require("./controllers/passportConfig");
const passport = require("passport");
initPassport(passport);
app.use(passport.initialize());
app.use(passport.session());

// Routes
const userRoutes = require("./routes/users");
app.set("view engine", "ejs");
app.use("/users", userRoutes);
//app.use("/dashboard", userDashboard);
app.get("/", (req, res) => {
    res.render("index");
});

// Port in-use
const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=>{
    console.log(`Server running on port:${PORT}`)
});