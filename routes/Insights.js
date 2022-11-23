const express = require("express");
const route = express.Router();
const { checkAuth } = require("../helpers/userAuth");
const { pool } = require("../dbConfig");



route.get("/", async (req, res) => {
    let empty = []
    try{
        res.render("insights", {z: empty});
    } catch (e) {
        console.log(e);
        res.send("There was an error");
    }
});

route.post("/", async (req, res) => {
    let { album_from, album_to, genre, rating_from, rating_to, playcount_from, playcount_to, reset} = req.body;
    
    if(album_from.length == 0)
    {   //If there is no from date, set date to default
        album_from = '1950-01-01'
    }
    if(album_to.length == 0){
        //If there is no to date, set date to default
        var temp_date = new Date();
        album_to = temp_date.getFullYear() + '-' + ('0' + (temp_date.getMonth()+1)).slice(-2) + '-' + ('0' + temp_date.getDate()).slice(-2);
    }
    if(album_from > album_to){
        //If user input from date is larger than to date, we set dates to default.
        album_from = '1950-01-01'
        var temp_date = new Date();
        album_to = temp_date.getFullYear() + '-' + ('0' + (temp_date.getMonth()+1)).slice(-2) + '-' + ('0' + temp_date.getDate()).slice(-2);
    }
    //Input is Any Genre
    if(genre == 0){
        genre = ' '
    }else{
        genre = ` AND songs.song_genre='${genre}'`
    } 
    //Rating Default 5
    if(rating_to>5 || rating_to < 0 || rating_to.length==0){
        rating_to = 5
    }
    //Rating Default 0
    if(rating_from>5 || rating_from < 0 || rating_from.length==0 || rating_from > rating_to){
        rating_from = 0
    }
    //Playcount to default max
    if(playcount_to.length == 0 || playcount_to < 0){
        playcount_to = 0
    }
    //Playcount from default 0
    if(playcount_from.length ==0 || playcount_from < 0 || playcount_from < playcount_to){
        playcount_from = 0
    }
    //Checks for values and passes
    if(typeof playcount_to !== 'undefined' && typeof playcount_from !== 'undefined' && playcount_from >= 0 && playcount_to > 0){
        playString = ` AND playcount.count between ${playcount_from} and ${playcount_to}`
    }else{
        playString = ` AND playcount.count>=${playcount_from}`
    }


    try {
        var word = await pool.query(
            `SELECT album.date_created, album.album_name, songs.song_name, songs.song_genre, CEIL(AVG(playcount.count)) AS total_playcount, cast(AVG(rating.song_rate) as dec (2,1)) AS avgrating
            FROM album, songs, album_songs, playcount, rating
            WHERE album.album_id = album_songs.album_id AND album_songs.song_id = songs.song_id AND rating.song_id = songs.song_id AND playcount.song_id = songs.song_id AND album.date_created between '${album_from}' and '${album_to}'${genre} ${playString}
            GROUP by album.album_name, songs.song_name, album.date_created, songs.song_genre
            HAVING cast(AVG(rating.song_rate) as dec (2,1)) between ${rating_from} AND ${rating_to}
            ORDER BY date_created`
            )

        for(let g=0; g<word.rows.length; g++){
            //Used Edd's helpful date slicer code here!!
            date = JSON.stringify(word.rows[g].date_created)
            month = date.slice(6,8)
            day = date.slice(9,11)
            year = date.slice(3,5)
            dateCreated = month + '/' + day + '/' + year
            word.rows[g].date_created = dateCreated
        }
        res.render("insights", {z: word.rows})
    } catch (e) {
        console.log(e);
        res.render("insights", {z: empty});
    }

});

route.get("/", function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash("success_msg", "Successfully logged out");
      res.redirect("/login");
    });
});

module.exports = route;