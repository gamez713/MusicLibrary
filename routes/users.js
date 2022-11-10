const express = require("express");
const route = express();
const passport = require("passport");
const bcrypt = require("bcrypt");
const { pool } = require("../dbConfig");
const { checkAuthenticated } = require("../controllers/users-auth");
const { checkNotAuthenticated } = require("../controllers/users-auth");

// -------------------- Login --------------------
route.get("/login", checkAuthenticated, (req, res) => {
    res.render("login");
});
route.post("/login", passport.authenticate('local', {
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
}));

// -------------------- Register --------------------
route.get("/register", checkAuthenticated, (req, res) => {
    res.render("register");
});
route.post("/register", async (req, res) => {
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
                            res.redirect("/users/login");
                        }
                    )
                }
            }
        )
    }
});

// -------------------- Dashboard --------------------
route.get("/dashboard", checkNotAuthenticated, async (req, res) => {
    try {
        const dict = {}
        //counts number of playlist from specified user.
        const playlist_count = await pool.query("SELECT COUNT(playlist.playlist_name) FROM playlist WHERE id =" + x)
        //gets the playlist_names sorted by date created.
        const playlist_names = await pool.query ("SELECT playlist.playlist_name FROM playlist WHERE id =" + x + "ORDER BY date_created")
    
        for (let b = 0; b < playlist_count.rows[0].count; b++){
            //Song count of a playlist
            const songs_count = await pool.query("SELECT COUNT(songs.song_name) FROM playlist, playlist_songs, songs WHERE id ="+ x + "AND playlist.playlist_id = playlist_songs.playlist_id AND songs.song_id = playlist_songs.song_id AND playlist_name ="+ "'"+ playlist_names.rows[b].playlist_name + "'" )
            //Get the songs from each playlist
            const songs = await pool.query("SELECT songs.song_name FROM playlist, playlist_songs, songs WHERE id ="+ x + "AND playlist.playlist_id = playlist_songs.playlist_id AND songs.song_id = playlist_songs.song_id AND playlist_name ="+ "'"+ playlist_names.rows[b].playlist_name + "'" )
            dict[b] = [];
            for (let g = 0; g < songs_count.rows[0].count; g++){
                dict[b].push(songs.rows[g].song_name)
            }
        }
        console.log(playlist_names.rows)
        res.render("dashboard", {user: req.user.fname, test: dict, playlist: playlist_names.rows, pcount: playlist_count.rows[0].count});
        } catch (e) {
            console.log("There was an error");
            res.send("There was an error");
        }
});


route.get("/logout", function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash("success_msg", "Successfully logged out");
      res.redirect("/users/login");
    });
});

// -------------------- Upload --------------------
route.get("/uploadmusic", checkNotAuthenticated, (req, res) => {
    res.render("uploadmusic", {user: req.user.name });
});

// -------------------- Browse --------------------
route.get("/browse", checkNotAuthenticated, (req, res) => {
    res.render("browse", {user: req.user.name });
});

// -------------------- Account --------------------
route.get("/account", checkNotAuthenticated, (req, res) => {
    res.render("account", {
        userfname: req.user.fname,
        userlname: req.user.lname,
        useremail: req.user.email
    });
});
route.post("/account", async (req, res) => {
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

// -------------------- Music Player --------------------
route.get("/musicplayer", checkNotAuthenticated, (req, res) => {
    res.render("musicplayer", {user: req.user.name });
});

// -------------------- Logout --------------------
route.get("/logout", function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash("success_msg", "Successfully logged out");
      res.redirect("/users/login");
    });
});

module.exports = route;