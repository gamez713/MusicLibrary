require("dotenv").config();
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
};



async function uploadFilToFiles() {
    const directoryClient = serviceClient.getShareClient(SHARE).getDirectoryClient(DIRECTORY);

    const content = "Hello World!";
    const fileName = "newfile" + new Date().getTime();
    const fileClient = directoryClient.getFileClient(fileName);
    await fileClient.create(content.length);
    console.log(`Create file ${fileName} successfully`);

    // Upload file range
    await fileClient.uploadRange(content, 0, content.length);
    console.log(`Upload file range "${content}" to ${fileName} successfully`);
}

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
    var time = 0 // compute song length
    var count = 0
    var rate = 0
    console.log("Debug", id, fName, lName, time, count, rate)
    file.name = `${id}_${title}`
    
    await uploadFileToBlob(file)

     pool.query(
        `INSERT INTO songs (song_id, song_name, song_genre, song_time, song_artist, total_count, average_rate)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`, 
        [id, title, genre, time, fName+ ' ' +lName, count, rate],
        (err, results) => {
            if (err) {
                throw err;
            }
            console.log(results.rows)
            
        }
    )
}

module.exports = {
    uploadSong
}