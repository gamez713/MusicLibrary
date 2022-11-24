const express = require("express");
const route = express.Router();
const { pool } = require("../dbConfig");
const { checkAuth } = require("../helpers/userAuth");

route.get("/", checkAuth, (req, res) => {
    let date = JSON.stringify(req.user.date_created)
        month = date.slice(5,8)
        day = date.slice(9,11)
        year = date.slice(3,5)
        dateCreated = month + '/' + day + '/' + year

    res.render("account", {
        userfname: req.user.fname,
        userlname: req.user.lname,
        useremail: req.user.email,
        usertype: req.user.role,
        userdate: dateCreated
    });
});

route.post("/", async (req, res) => {
    let { fname, lname, email } = req.body;
    const id = req.user.id;
    console.log({fname, lname, email});

    // Updating Name
    if (email == null) {
        pool.query(
        `UPDATE "users"
        SET "fname" = $1, "lname" = $2
        WHERE "id" = $3`, [fname, lname, id],
        (err, results) => {
            if (err) {
                throw err;
            }
            console.log(results.rows)
            req.flash("success_msg", "Account Updated");
            res.redirect("/account");
            }
        )
    }
    // Updating Email
    else if (fname == null && lname == null) {
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
                    res.redirect("/account");
                } else {
                    // Validation passed, update DB
                    pool.query(
                        `UPDATE "users"
                        SET "email" = $1
                        WHERE "id" = $2`, [email, id],
                        (err, results) => {
                            if (err) {
                                throw err;
                            }
                            console.log(results.rows)
                            req.flash("success_msg", "Account Updated");
                            res.redirect("/account");
                        }
                    )
                }
            }
        )
    }
});

module.exports = route;