const express = require("express");
const route = express();
const passport = require("passport");
const bcrypt = require("bcrypt");
const { pool } = require("../dbConfig");
const { checkAuthenticated } = require("../basicAuth");
const { checkNotAuthenticated } = require("../basicAuth");

route.get("/login", checkAuthenticated, (req, res) => {
    res.render("login");
});

route.get("/register", checkAuthenticated, (req, res) => {
    res.render("register");
});

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

route.post("/login", passport.authenticate('local', {
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
}));

route.post("/register", async (req, res) => {
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

module.exports = route;