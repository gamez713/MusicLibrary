const express = require("express");
const route = express.Router();
const { pool } = require("../dbConfig");
const { checkAuth } = require("../helpers/userAuth");
const query = pool.query('LISTEN delete_notification');
const notify = require('pg-notify');
var alert = require('alert');
const { delay } = require("@azure/core-util");
var app = express();

route.get("/", checkAuth, async (req, res) => {
  try {
    const dict = {}
    const dict2 = {}
    //counts number of playlist from specified user.
    const playlist_count = await pool.query("SELECT COUNT(playlist.playlist_name) FROM playlist WHERE id =" + x)
    //gets the playlist_names sorted by date created.
    const playlist_names = await pool.query("SELECT playlist.playlist_name FROM playlist WHERE id = " + x + " ORDER BY date_created")
        for (let b = 0; b < playlist_count.rows[0].count; b++) {
            //Song count of a playlist
            const songs_count = await pool.query("SELECT COUNT(songs.song_name) FROM playlist, playlist_songs, songs WHERE id = "+ x + " AND playlist.playlist_id = playlist_songs.playlist_id AND songs.song_id = playlist_songs.song_id AND playlist_name ="+ "'"+ playlist_names.rows[b].playlist_name + "'" )
            //Get the songs from each playlist
            const songs = await pool.query("SELECT songs.song_name FROM playlist, playlist_songs, songs WHERE id = "+ x + " AND playlist.playlist_id = playlist_songs.playlist_id AND songs.song_id = playlist_songs.song_id AND playlist_name =" + "'" + playlist_names.rows[b].playlist_name + "'" )
            dict[b] = [];
            dict2[b] = [];
            for (let g = 0; g < songs_count.rows[0].count; g++){
                dict2[b].push(songs.rows[g].song_link)
                dict[b].push(songs.rows[g].song_name)
            }
        }
        dash = "/dashListener";
        res.render("dashListener", {user: req.user.fname, test: dict, test2: dict2, playlist: playlist_names.rows, pcount: playlist_count.rows[0].count});
    } catch (e) {
            console.log(e);
            res.send("There was an error");
        }
});

async function pid_generator(){
     //Playlist ID generator
    var playlist_id_result = 'P_';
    var characters = "1234567890"
    for ( var d = 0; d < 8; d++ ) {
        playlist_id_result += characters.charAt(Math.floor(Math.random() * 8));
    }

    var playlist_id_array = await pool.query('SELECT playlist_id FROM playlist')
    var temp = [];

    playlist_id_array.rows.forEach(p=>{
        temp.push(p.playlist_id)
    })
    var hasVal = Object.values(temp).includes(playlist_id_result);
    if (hasVal==true){
        pid_generator()
    }else{
        return playlist_id_result;
    }
}

route.post("/", async (req, res) => {
    let { playlist_name, playlist_name2, playlist_name3, song_name, playlist_name4, song_name2, playlist_name5 } = req.body;
    data2 = req.user.role.charAt(0).toUpperCase()+ req.user.role.slice(1);
    if(typeof playlist_name !== 'undefined'){
        try {
            var duplicate = await pool.query("SELECT playlist_name FROM playlist WHERE playlist_name= "+"'"+playlist_name+"'"+" AND id= "+x)
            if(duplicate.rows.length == 0)
            {
                await pool.query(
                    `INSERT INTO playlist (id, playlist_id, playlist_name)
                    VALUES ($1, $2, $3)`, 
                    [x[0], await pid_generator() , playlist_name])
                res.redirect("/dashListener")
            }else{
                res.redirect("/dashListener")
            }
            } catch (e) {
            console.log(e);
            res.redirect("/dashListener");
        }
    }
    if(typeof playlist_name2 !== 'undefined'){
        try {
            /*await pool.query(
                'DELETE FROM playlist_songs WHERE playlist_id in (SELECT playlist_id FROM playlist WHERE playlist_name = '+"'"+playlist_name2+"'"+' AND id ='+ x +');')*/
            await pool.query(
                'DELETE FROM playlist WHERE playlist_name= '+"'"+playlist_name2+"'"+' AND id ='+ x,
                (err, results) => {
                if (err) {
                    if(err = 'error: Please delete all songs in the playlist before deleting the playlist') {
                        alert('Trigger: Please delete all songs in the playlist before deleting the playlist!');
                        res.send("<script>alert('Trigger: You must delete all songs in this playlist before deleting the playlist!');window.location.href='/dashListener';</script>");
                    }
                } else {
                    alert('Trigger: Playlist successfully deleted!');
                    res.send("<script>alert('Trigger: Playlist successfully deleted!');window.location.href='/dashListener';</script>");
                }
            })
                pool.on('notification', async (data) => {
                    const payload = JSON.parse(data.playload);
                    console.log('Song deleted from a playlist', payload)

                });
        } catch (e) {
            console.log(e);
            res.redirect("/dashListener");
        }
    }
    if(typeof playlist_name3 !== 'undefined'){
        try {
            var songID = await pool.query('SELECT song_id FROM songs WHERE song_name = '+"'"+ song_name + "'"+'')
            var playlistID = await pool.query('SELECT playlist_id FROM playlist WHERE playlist_name = '+"'"+ playlist_name3 +"'"+' AND id='+ x)
            
            await pool.query('INSERT INTO playlist_songs VALUES ('+"'"+playlistID.rows[0].playlist_id+"', "+"'"+songID.rows[0].song_id+"'"+')')
            res.redirect("/dashListener")
        } catch (e) {
            console.log(e);
            res.redirect("/dashListener");
        }
    }
    if(typeof playlist_name4 !== 'undefined'){
        try {
            var songID = await pool.query('SELECT song_id FROM songs WHERE song_name = '+"'"+ song_name2 + "'"+'')
            var playlistID = await pool.query('SELECT playlist_id FROM playlist WHERE playlist_name = '+"'"+ playlist_name4 +"'"+' AND id='+ x)
            var errFlag = 'Y';
            await pool.query('DELETE FROM playlist_songs WHERE playlist_id= '+"'"+playlistID.rows[0].playlist_id+"' AND song_id = "+"'"+songID.rows[0].song_id+"'"+'',
            (err, results) => {
                if(err) {
                    console.log('An unexpected error occurred');
                    alert('An unexpected error occurred');
                }
                if (results.rowCount > 0) {
                    console.log(err);
                    alert('Trigger: song has been removed from playlist!');
                    res.send("<script>alert('Trigger: song has been removed from playlist!');window.location.href='/dashListener';</script>");
                }  else {
                    alert('Trigger: invalid song! please enter a song in that playlist.');
                    res.send("<script>alert('Trigger: invalid song! please enter a song in that playlist.');window.location.href='/dashListener';</script>");
                }
            console.log(results.rowCount);
            })
            //res.redirect("/dashMusician")
        } catch (e) {
            res.redirect("/dashListener");
        }
    }
    if(typeof playlist_name5 !== 'undefined'){
        try {
            const songs_count = await pool.query("SELECT COUNT(playlist_songs.playlist_id) FROM playlist_songs, playlist WHERE playlist.playlist_name= "+"'"+playlist_name5+"'"+" AND playlist_songs.playlist_id = playlist.playlist_id AND id="+x)
            const songs = await pool.query("SELECT songs.song_id, songs.song_name AS name, songs.artist_f_name AS artist, songs.artist_l_name AS lname, song_link.song_link AS path FROM playlist, playlist_songs, songs, song_link WHERE id = "+ "'"+ x + "'" + " AND playlist.playlist_id = playlist_songs.playlist_id AND songs.song_id = playlist_songs.song_id  AND songs.song_id = song_link.song_id AND playlist_name = "+ "'"+ playlist_name5 +"'")
            for(let i=0; i<songs_count.rows[0].count; i++){
                Q = songs.rows[i].artist + " " + songs.rows[i].lname
                songs.rows[i].artist = Q
            }
            res.render("musicplayer", {userid: req.user.id, songs: songs.rows, scount: songs_count.rows[0].count, role:data2});
        } catch (e) {
            console.log(e);
            res.redirect("/dashListener");
        }
    }
});

module.exports = route;