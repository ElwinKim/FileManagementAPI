const multer = require('multer');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { BlobServiceClient } = require('@azure/storage-blob');
const MulterAzureStorage = require('multer-azure-blob-storage')
  .MulterAzureStorage;
const formidable = require('formidable');

// Set Azure blob storage connection variables.
const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;
const AZURE_STORAGE_ACCOUNT_ACCESS_KEY =
  process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY;
const AZURE_STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;

var container; // global variable for container name
var objectId; // global variable ObjectID for mongoDB


exports.editPadBlob = async (req, res, next) => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING
  );
  var form = formidable.IncomingForm();
  objectId = req.params.id;
  console.log(objectId);
  form.parse(req, async function (err, fields, files) {
    if (files['pads[]'] && files['pads[]'].size !== 0) {
      container = 'pad-' + objectId;
      const containerClient = blobServiceClient.getContainerClient(container);
      for await (const blob of containerClient.listBlobsFlat()) {
        await containerClient.deleteBlob(blob.name);
        console.log('deleting blobs..');
      }
    }
  });
  next();
};

exports.createPadContainer = async (req, res, next) => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING
  );
    objectId = req.params.id;
    container = 'pad-' + objectId;
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
  if(file.mimetype.startsWith('image'))
  {
    container = 'padimages';
  } else{
    container = `pad-${objectId}`;
  }
    
    return container;
};

// Return blob name
const resolveBlobName = (req, file) => {
  return new Promise((resolve, reject) => {
    const blobName = generateBlobName(req, file);
    resolve(blobName);
  });
};

let pads = []; // global variable for track names
//Each file name will store to tracks array
const generateBlobName = (req, file) => {
  console.log('uploading...');
  if (file.mimetype.startsWith('image')) {
    return `pad-${objectId}.jpeg`;
  } else {
    pads.push(file.originalname);
    return file.originalname;
  }
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

const uploadPads = multer({
  storage: azureStorage,
});

exports.uploadPad = uploadPads.fields([
  {
    name: 'pads[]',
    maxCount: 25,
  },
  {
    name: 'image',
    maxCount: 1,
  },
]);

exports.resizePadImage = catchAsync(async (req, res, next) => {
  if (!req.files || !req.files['image']) {
    console.log("something wrong..");
    return next();
  }
  if (req.params.id) {
    req.files['image'].filename = `pad-${req.params.id}.jpeg`;
    console.log(req.files['image'].filename);
  } else {
    next();
  }

  await sharp(req.files['image'].buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toBuffer()
    .then((data) => {
      req.files['image'].buffer = data;
    });
  next();
});

exports.createNewPad = catchAsync(async (req, res, next) => {
  pads = [];
  res.status(200).json({
    status: 'success',
  });
});

/****************
 * Delete Patchs
 ****************/

exports.deletePads = catchAsync(async (req, res, next) => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING
  );
  if (req.query) {
    const queryObj = { ...req.query };
    const queryLength = Object.keys(queryObj).length;
    for (var i = 0; i < queryLength; i++) {
      container = 'pad-' + Object.keys(queryObj)[i];
      console.log(container);
      var containerClient = blobServiceClient.getContainerClient(container);
      await containerClient.delete();
      container = 'padimages';
      containerClient = blobServiceClient.getContainerClient(container);
      await containerClient.deleteBlob(
        `pad-${Object.keys(queryObj)[i]}.jpeg`
      );
    }
  } else {
    container = 'pad-' + req.params.id;
    var containerClient = blobServiceClient.getContainerClient(container);
    await containerClient.delete();
    container = 'padimages';
    containerClient = blobServiceClient.getContainerClient(container);
    await containerClient.deleteBlob(`pad-${req.params.id}.jpeg`);
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.updatePad = catchAsync(async (req, res, next) => {
  pads = [];
  res.status(200).json({
    status: 'success',
  });
});
