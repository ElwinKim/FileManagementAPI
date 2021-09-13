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

const uploadImg = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadImage = uploadImg.single('image');

exports.resizeImage = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  if (req.params.id) {
    req.file.filename = `producer_${req.params.id}.jpeg`;
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

exports.createNewImage = catchAsync(async (req, res, next) => {

  const containerName = 'producerimages';
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

exports.deleteImage = catchAsync(async (req, res, next) => {
  const containerName = 'producerimages';
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING
  );
  const containerClient = blobServiceClient.getContainerClient(containerName);
  if (req.query) {
    const queryObj = { ...req.query };
    const queryLength = Object.keys(queryObj).length;
   
    for (var i = 0; i < queryLength; i++) {
      const blobName = `producer_${Object.keys(queryObj)[i]}.jpeg`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      console.log(blobName);
      await blockBlobClient.delete().catch(function (error) {
        //do nothing
        console.log(`Cannot find file! \n error: ${error}`);
      });
    }
  } else {
    const blobName = `producer_${req.params.id}.jpeg`;
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

exports.updateImage = catchAsync(async (req, res, next) => {
    const containerName = 'producerimages';
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
