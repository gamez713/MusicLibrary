const express = require("express");
const route = express.Router();
const { pool } = require("../dbConfig");
const { appendFile } = require("fs");
const { checkAuth } = require("../helpers/userAuth");

route.get("/", checkAuth, async(req, res) => {
  data = req.user.role.charAt(0).toUpperCase()+ req.user.role.slice(1);
try {
  //counts number of playlist from specified user.
  const songs_count = await pool.query("SELECT COUNT(songs.song_name) FROM songs")
  //gets the playlist_names sorted by date created.
  const songs = await pool.query("SELECT DISTINCT s.song_id, s.song_name AS name, s.artist_f_name AS artist, s.artist_l_name AS lname, sl.song_link AS path FROM songs AS s, song_link as sl WHERE s.song_id = sl.song_id")
  
   for(let i=0; i<songs_count.rows[0].count; i++){
       Q = songs.rows[i].artist + " " + songs.rows[i].lname
       songs.rows[i].artist = Q
  }
  console.log(data);
  res.render("musicplayer", {userid: req.user.id, songs: songs.rows, scount: songs_count.rows[0].count, role: data});
  } catch (e) {
      console.log(e);
      res.send("There was an error");
  }
});
route.post("/updateplaycount", async (req, res) => {
  let { user_id, song_id } = req.body;
  table_count(user_id, song_id);
});

async function table_count(userid,songid){
  pool.query(
        `SELECT * FROM playcount WHERE playcount.id = $1 AND playcount.song_id = $2`, 
        [userid, songid],
        (err, results) => {
            if (err) {
                throw err;
            }
            if(results.rowCount == 0){
              insert_count(userid,songid);
            }
            else{
              update_count(userid,songid);
            }
        });
}

async function insert_count(userid,songid){
  pool.query(
    `INSERT INTO playcount (id, song_id, count) VALUES ($1, $2, $3)`, 
    [userid, songid, 1],
    (err, results) => {
        if (err) {
            throw err;
        }
    });
}

async function update_count(userid,songid){
  pool.query(
    `UPDATE playcount SET count = count + 1 WHERE id = $1 AND song_id = $2`, 
    [userid, songid],
    (err, results) => {
        if (err) {
            throw err;
        }
    });    
}
module.exports = route;