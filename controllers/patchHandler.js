
const multer = require('multer');
const ObjectID = require('mongodb').ObjectID;
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const MulterAzureStorage = require('multer-azure-blob-storage')
  .MulterAzureStorage;
const { BlobServiceClient } = require('@azure/storage-blob');
const formidable = require('formidable');
const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;
const AZURE_STORAGE_ACCOUNT_ACCESS_KEY =
  process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY;
const AZURE_STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;

var container; // global variable for container name
var objectId; // global variable ObjectID for mongoDB

exports.editPatchBlob = async (req, res, next) => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING
  );
  var form = formidable.IncomingForm();
  paramId = req.params.id;
  var fileName = paramId.split('-')[1];
  var id = paramId.split('-')[0];
  console.log(id);
  console.log(fileName);
  form.parse(req, async function (err, fields, files) {
    if (files['patches[]'] && files['patches[]'].size !== 0) {
      container = 'patchaudio';
      const containerClient = blobServiceClient.getContainerClient(container);
      await containerClient.deleteBlob(
        `${id}-${fileName}`
      );
    }
  });
  objectId = id;
  next();
};

exports.createPatchBlob = async (req, res, next) => {
  objectId = req.params.id;
  console.log(objectId);
  next();
}

// Multer Azure storage get only function. So it returns container name
const getContainer = async (req, file) => {
  if (file.mimetype.startsWith('image')) {
    container = 'patchimages';
  } else {
      container = 'patchaudio';
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

//Each file name will store to tracks array
const generateBlobName = (req, file) => {
  if (file.mimetype.startsWith('image')) {
    console.log('uploading image..');
    return `patch-${objectId}.jpeg`;
  } else {
    console.log('uploading patch..');
    return `${objectId}-${file.originalname}`;
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

const uploadPatchFiles = multer({
  storage: azureStorage,
});

exports.uploadPatch = uploadPatchFiles.fields([
  {
    name: 'patches[]',
    maxCount: 1,
  },
  {
    name: 'image',
    maxCount: 1,
  },
]);

exports.resizePatchImage = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  if (req.params.id) {
    req.file.filename = `patch-${req.params.id}.jpeg`;
  } else {
    next();
  }

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toBuffer()
    .then((data) => {
      req.file.buffer = data;
    });

  next();
});

exports.createNewPatch = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
  });
});

/****************
 * Delete Patchs
 ****************/

exports.deletePatches = catchAsync(async (req, res, next) => {
  if (req.query) {
    const queryObj = { ...req.query };
    const queryLength = Object.keys(queryObj).length;
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );
    for (var i = 0; i < queryLength; i++) {
      const fileName = Object.keys(queryObj)[i].split("-")[1];
      const id = Object.keys(queryObj)[i].split("-")[0];
      console.log(fileName);
      console.log(id);
      container = 'patchimages';
      var containerClient = blobServiceClient.getContainerClient(container);
      await containerClient.deleteBlob(
        `patch-${id}.jpeg`
      );

      container = 'patchaudio';
      containerClient = blobServiceClient.getContainerClient(container);
      await containerClient.deleteBlob(
        `${id}-${fileName}`
      );

    }
  } else {

    container = 'patchimages';
    var containerClient = blobServiceClient.getContainerClient(container);
    await containerClient.deleteBlob(
      `patch-${Object.keys(queryObj)[i]}.jpeg`
    );


    container = 'patchaudio';
    containerClient = blobServiceClient.getContainerClient(container);
    await containerClient.deleteBlob(
      `patch-${Object.keys(queryObj)[i]}.jpeg`
    );

  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.updatePatch = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
  });
});
