require("dotenv").config();
var alert = require('alert');
const Blob = require("@azure/storage-blob");
const fs = require('fs');
const { pool } = require("../dbConfig");
const { v4: uuidv4 } = require('uuid');

const sas = process.env.sas
const accountName = process.env.accountName
const SHARE = process.env.SHARE
const DIRECTORY = process.env.DIRECTORY
const CONTAINER = process.env.CONTAINER

const blobService = new Blob.BlobServiceClient(
    `https://${accountName}.blob.core.windows.net/?${sas}`
);

const uploadFileToBlob = async (file) => {
    const containerClient = blobService.getContainerClient(CONTAINER);
    await containerClient.createIfNotExists({ access: 'container' });

    const fileData = fs.readFileSync(file.path);
    const blockBlobClient = containerClient.getBlockBlobClient(file.name);
    const response = await blockBlobClient.upload(fileData, fileData.length);
    console.log(`Blob was uploaded successfully. requestId: ${response.requestId}`);

    fs.unlink(file.path, (err) => {
        if (err) {
            console.log('Error, could not clean up song file')
        };
        console.log('clean up complete');
    });
    return blockBlobClient;
};



async function uploadSong(file, title, genre, user) {
    if (!file) {
        console.log('No file to upload');
        return;
    }
    if (!user) {
        console.log('User not signed in');
        return;
    }
    if (!title || !genre) {
        console.log('Insufficient information to upload song');
        return;
    }
    var id =  'S_' + uuidv4().split('-')[0];
    var fName = user.fname
    var lName = user.lname 
    var count = 0
    var rate = 0
    console.log("Debug", id, fName, lName)
    file.name = `${id}_${title}.mp3`
    
    const blobinfo = await uploadFileToBlob(file)
    console.log(`created blob:\n\tname=${file.name}\n\turl=${blobinfo.url}`);
     pool.query(
        `INSERT INTO songs (song_id, song_name, song_genre, artist_f_name, artist_l_name)
        VALUES ($1, $2, $3, $4, $5)`, 
        [id, title, genre, fName, lName],
        (err, results) => {
            if (err) {
                if(err = 'error: Please wait atleast five minutes before uploading another song') {
                    alert('Trigger: Please wait atleast five minutes before uploading another song!');
                }
            } else {
                pool.query(
                    `INSERT INTO songbelong (song_id, id)
                    VALUES ($1, $2)`, 
                    [id, user.id],
                    (err, results) => {
                        if (err) {
                            throw err;
                        }
                        console.log(results.rows)
                        
                    }
                )
            
                pool.query(
                    `INSERT INTO song_link (song_id, song_link)
                    VALUES ($1, $2)`, 
                    [id, blobinfo.url],
                    (err, results) => {
                        if (err) {
                            throw err;
                        }
                        console.log(results.rows)
                        
                    }
                )
                alert('Trigger: Successfully uploaded song!'); 
            }
            //console.log(results.rows) 
        }
    )
}

module.exports = {
    uploadSong
}