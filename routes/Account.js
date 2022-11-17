const express = require("express");
const route = express.Router();
const { pool } = require("../dbConfig");
const { checkNotAuthenticated } = require("../controllers/users-auth");

route.get("/", checkNotAuthenticated, (req, res) => {
    let date = JSON.stringify(req.user.date_created)
        date = date.slice(1,11)
    res.render("account", {
        userfname: req.user.fname,
        userlname: req.user.lname,
        useremail: req.user.email,
        userdate: date

    });
});

route.post("/", async (req, res) => {
    let { fname, lname, email} = req.body;
    const id = req.user.id;
    console.log({fname, lname, email});

    // Query to check if email exist
    pool.query(
        `SELECT * FROM users
        WHERE email = $1`,
        [email],
        (err, results) => {
            if (err) {
                throw err;
            }
            // If email exist
            if (results.rows.length > 0) {
                req.flash("error", "Email Taken");
                res.redirect("/users/account");
            } else {
                // Validation passed, update DB
                pool.query(
                    `UPDATE "users"
                    SET "fname" = $1, "lname" = $2, "email" = $3
                    WHERE "id" = $4`, [fname, lname, email, id],
                    (err, results) => {
                        if (err) {
                            throw err;
                        }
                        console.log(results.rows)
                        req.flash("success_msg", "Account Updated");
                        res.redirect("/users/account");
                    }
                )
            }
        }
    )
});

module.exports = route;