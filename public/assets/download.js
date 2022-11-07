// connect-with-connection-string.js
//require('dotenv').config()
const {BlobServiceClient } = require("@azure/storage-blob");

const connString = 'DefaultEndpointsProtocol=https;AccountName=musicplayeruh;AccountKey=Sp51SWh3WFDfLcE3Y3DTZyIi6dubk0b7ECLtX2BF4oSABO8EZQXpCCfNpQH1a9336LFMItFgDBmt+AStF38G3w==;EndpointSuffix=core.windows.net';
if (!connString) throw Error('Azure Storage Connection string not found');

const blobServiceClient = BlobServiceClient.fromConnectionString(connString);

async function main() {
  
  const containerName = 'newcontainer';
  const blobName = 'song1.mp3';

  const timestamp = Date.now();
  const fileName = 'song1.mp3';

  // create container client
  const containerClient = await blobServiceClient.getContainerClient(containerName);

  // create blob client
  const blobClient = await containerClient.getBlockBlobClient(blobName);

  // download file
  await blobClient.downloadToFile(fileName);

  console.log(`${fileName} downloaded`);
  
}

main()
  .then(() => console.log(`done`))
  .catch((ex) => console.log(ex.message));