const initializePassport = require("./passportConfig");
const express = require("express");
const session = require("express-session");
const flash = require("express-flash");
const passport = require("passport");
const app = express();
const PORT = process.env.PORT || 4000;
const userRoutes = require("./routes/users");

initializePassport(passport);

// Middlewarwe
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended: false}));
app.use(flash());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use("/users", userRoutes);
//app.use("/dashboard", userDashboard);
app.get("/", (req, res) => {
    res.render("index");
});

// Port in-use msg
app.listen(PORT, ()=>{
    console.log(`Server running on port:${PORT}`)
});