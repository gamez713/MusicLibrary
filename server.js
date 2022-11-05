const initializePassport = require("./passportConfig");
const express = require("express");
const session = require("express-session");
const flash = require("express-flash");
const { checkAuthenticated } = require("./basicAuth");
const { checkNotAuthenticated } = require("./basicAuth");
const { pool } = require("./dbConfig");
const passport = require("passport");
const bcrypt = require("bcrypt");
const app = express();
const PORT = process.env.PORT || 4000;

initializePassport(passport);

// Middlewarwe
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: false}));
app.use(flash());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// GET Directories
app.get("/", (req, res) => {
    res.render("index");
});
app.get("/users/login", checkAuthenticated, (req, res) => {
    res.render("login");
});
app.get("/users/register", checkAuthenticated, (req, res) => {
    res.render("register");
});
app.get("/users/dashboard", checkNotAuthenticated, (req, res) => {
    res.render("dashboard", {user: req.user.name });
});
app.get("/users/logout", function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash("success_msg", "Successfully logged out");
      res.redirect("/users/login");
    });
});

// POST
app.post("/users/login", passport.authenticate('local', {
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
}));

app.post("/users/register", async (req, res) => {
    let { name, email, password, password2 ,musician} = req.body;
    let errors = [];
    console.log({name, email, password, password2, musician});

    // Form validation
    if (!name || !email || !password || !password2) {
        errors.push({ message: "All forms must be filled"});
    }
    if (password.length < 6) {
        errors.push({ message: "Passwords must be at least 6 characters"});
    }
    if (password != password2) {
        errors.push({ message: "Passwords do not match"});
    }
    if (errors.length > 0) {
        res.render("register", { errors });
    } else {
        // Validation passed
        let hashedPass = await bcrypt.hash(password, 10);
        console.log(hashedPass);

        // Checking musician boolean value
        

        pool.query(
            `SELECT * FROM users
            WHERE email = $1`,
            [email],
            (err, results) => {
                if (err) {
                    throw err;
                }
                console.log(results.rows);
                // If email exists
                if (results.rows.length > 0) {
                    errors.push({ message: "Email already exists"});
                    res.render("register", {errors});
                } else {
                    // Register new user
                    pool.query(
                        `INSERT INTO users (name, email, password, musician)
                        VALUES ($1, $2, $3, $4)
                        RETURNING id, password`, [name, email, hashedPass, musician],
                        (err, results) => {
                            if (err) {
                                throw err;
                            }
                            console.log(results.rows)
                            req.flash("success_msg", "Successfully registered, please log in");
                            res.redirect("/users/login");
                        }
                    )
                }
            }
        )
    }
});

// Port in-use msg
app.listen(PORT, ()=>{
    console.log(`Server running on port:${PORT}`)
});