const multer = require('multer');
const MulterAzureStorage = require('multer-azure-blob-storage')
  .MulterAzureStorage;
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { BlobServiceClient } = require('@azure/storage-blob');
const formidable = require('formidable');

// Set Azure blob storage connection variables.
const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;
const AZURE_STORAGE_ACCOUNT_ACCESS_KEY =
  process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY;
const AZURE_STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;

var container; // global variable for container name
var objectId; // global variable ObjectID for mongoDB
let tracks = []; // global variable for track names

exports.editTrackBlob = exports.editTrack = async(req, res, next) => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING
  );
  objectId = req.params.id;

  container = 'track-' + objectId;
  const containerClient = blobServiceClient.getContainerClient(container);
  for await (const blob of containerClient.listBlobsFlat()) {
    await containerClient.deleteBlob(blob.name);
  }
  next();
} 

exports.createTrackContainer = async (req, res, next) => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING
  );

    objectId = req.params.id;
    container = 'track-' + objectId;
    const containerClient = blobServiceClient.getContainerClient(container);
    if(!containerClient.exists)
    {
      await containerClient.create();
      await containerClient.setAccessPolicy('blob');
    }

    next();
  
};

// Multer Azure storage get only function. So it returns container name
const getContainer = async (req, file) => {
  container = `track-${objectId}`;
  return container;
};

// Return blob name
const resolveBlobName = (req, file) => {
  return new Promise((resolve, reject) => {
    const blobName = generateBlobName(req, file);
    resolve(blobName);
  });
};


//Each file name will store to tracks array
const generateBlobName = (req, file) => {
  console.log('uploading...');
  tracks.push(file.originalname);
  return file.originalname;
};

// Multer Azure Storage access form
const azureStorage = new MulterAzureStorage({
  connectionString: AZURE_STORAGE_CONNECTION_STRING,
  accessKey: AZURE_STORAGE_ACCOUNT_ACCESS_KEY,
  accountName: AZURE_STORAGE_ACCOUNT_NAME,
  containerName: getContainer,
  blobName: resolveBlobName,
  containerAccessLevel: 'blob',
  urlExpirationTime: 60,
});

const uploadTrackFiles = multer({
  storage: azureStorage,
});

exports.uploadTrack = uploadTrackFiles.array('tracks[]', 25);


exports.createNewTrack = catchAsync(async (req, res, next) => {
  tracks = [];
  res.status(200).json({
    status: 'success',
  });
});

/****************
 * Delete Tracks
 ****************/

 exports.deleteTracks = catchAsync(async (req, res, next) => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING
  );

  if (req.query) {
    const queryObj = { ...req.query };
    const queryLength = Object.keys(queryObj).length;
    
    for (var i = 0; i < queryLength; i++) {
      const container = Object.keys(queryObj)[i];
      
      const containerClient = blobServiceClient.getContainerClient(container);
      await containerClient.delete().catch(function (error) {
        //do nothing
        console.log(`Cannot find file! \n error: ${error}`);
      });
    }
  } else {
    const container = req.params.Id;
    const containerClient = blobServiceClient.getContainerClient(container);
    await containerClient.delete().catch(function (error) {
      //do nothing
      console.log(`Cannot find file! \n error: ${error}`);
    });
  }

res.status(204).json({
  status: 'success',
  data: null,
});
});

/****************
 * Update Tracks
 ****************/

exports.updateTrack = catchAsync(async (req, res, next) => {
  tracks = [];
  res.status(200).json({
    status: 'success',
  });
});



