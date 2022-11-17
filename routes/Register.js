const express = require("express");
const route = express.Router();
const bcrypt = require("bcrypt");
const { pool } = require("../dbConfig");
const { checkAuthenticated } = require("../controllers/users-auth");

route.get("/", (req, res) => {
    res.render("register");
});

route.post("/", async (req, res) => {
    let { fname, lname, email, password, password2 ,musician } = req.body;
    let errors = [];
    console.log({ fname, lname, email, password, password2 ,musician });

    // Form validation
    if (!fname || !email || !password || !password2) {
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
        // Form validation passed
        let hashedPass = await bcrypt.hash(password, 10);
        console.log(hashedPass);

        // Query to check if email exist
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
                    // Validation passed, register new user
                    pool.query(
                        `INSERT INTO users (fname, lname, email, password, musician)
                        VALUES ($1, $2, $3, $4, $5)
                        RETURNING id, password`, [fname, lname, email, hashedPass, musician],
                        (err, results) => {
                            if (err) {
                                throw err;
                            }
                            console.log(results.rows)
                            req.flash("success_msg", "Successfully registered, please log in");
                            res.redirect("/login");
                        }
                    )
                }
            }
        )
    }
});

module.exports = route;