const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { BlobServiceClient } = require('@azure/storage-blob');
const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {

    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const uploadAlbumImg = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadAlbumImage = uploadAlbumImg.single('image');

exports.resizeAlbumImage = catchAsync(async (req, res, next) => {
  console.log(req.file);
  if (!req.file) {
    return next();
  }
  if (req.params.id) {
    req.file.filename = `album_${req.params.id}.jpeg`;
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

exports.createNewAlbum = catchAsync(async (req, res, next) => {

  const containerName = 'albumimages';
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const blobName = req.file.filename;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    console.log('\nUploading to Azure storage as blob:\n\t', blobName);
    const data = req.file.buffer;
    await blockBlobClient.upload(data, data.length);

  res.status(200).json({
    status: 'success',
    data: 
      null,
  });
});

exports.deleteAlbums = catchAsync(async (req, res, next) => {
  const containerName = 'albumimages';
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING
  );
  const containerClient = blobServiceClient.getContainerClient(containerName);
  if (req.query) {
    const queryObj = { ...req.query };
    const queryLength = Object.keys(queryObj).length;
   
    for (var i = 0; i < queryLength; i++) {
      const blobName = `album_${Object.keys(queryObj)[i]}.jpeg`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      console.log(blobName);
      await blockBlobClient.delete().catch(function (error) {
        //do nothing
        console.log(`Cannot find file! \n error: ${error}`);
      });
    }
  } else {
    const blobName = `album_${req.params.id}.jpeg`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.delete().catch(function (error) {
      console.log(`Cannot find file! \n error: ${error}`);
    });
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.updateAlbum = catchAsync(async (req, res, next) => {
    const containerName = 'albumimages';
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const blobName = req.file.filename;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    console.log('\nUpdating to Azure storage as blob:\n\t', blobName);
    const data = req.file.buffer;
    const uploadBlobResponse = await blockBlobClient.upload(data, data.length);
    console.log('Blob was updated successfully.');
  
  res.status(200).json({
    status: 'success',
    data: 
      null,
  });
});
