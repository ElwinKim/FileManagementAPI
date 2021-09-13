const albumHandler = require('./albumHandler');
const trackHandler = require('./trackHandler');
const patchHandler = require('./patchHandler');
const padHandler = require('./padHandler');
const artistUploader = require('./ArtistImageUploader');
const producerHandler = require('./ProducerImageHandler');

//Controllers for Album
exports.createNewAlbum = albumHandler.createNewAlbum;
exports.deleteAlbum = albumHandler.deleteAlbums;
exports.updateAlbum = albumHandler.updateAlbum;
exports.uploadAlbumImage = albumHandler.uploadAlbumImage;
exports.resizeAlbumImage = albumHandler.resizeAlbumImage;

//Controllers for Artist Image
exports.createNewArtist = artistUploader.createNewImage;
exports.deleteArtist = artistUploader.deleteImage;
exports.updateArtist = artistUploader.updateImage;
exports.uploadArtistImage = artistUploader.uploadImage;
exports.resizeArtistImage = artistUploader.resizeImage;

//Controllers for Producer Image
exports.createNewProducer = producerHandler.createNewImage;
exports.deleteProducer = producerHandler.deleteImage;
exports.updateProducer = producerHandler.updateImage;
exports.uploadProducerImage = producerHandler.uploadImage;
exports.resizeProducerImage = producerHandler.resizeImage;

//Controlers for Track
exports.createNewTrack = trackHandler.createNewTrack;
exports.deleteTracks = trackHandler.deleteTracks;
exports.updateTrack = trackHandler.updateTrack;
exports.uploadTracks = trackHandler.uploadTrack;
exports.extractZipFile = trackHandler.extractTrack;
exports.mergeTracks = trackHandler.mergeTracks;
exports.createTrackContainer = trackHandler.createTrackContainer;
exports.editTrack = trackHandler.editTrackBlob;

//Controlers for Patch

exports.createNewPatch = patchHandler.createNewPatch;
exports.deletePatches = patchHandler.deletePatches;
exports.updatePatch = patchHandler.updatePatch;
exports.uploadPatch = patchHandler.uploadPatch;
exports.resizePatchImage = patchHandler.resizePatchImage;
exports.generateId = patchHandler.generateId;
exports.editPatchBlob = patchHandler.editPatchBlob;
exports.createPatchBlob = patchHandler.createPatchBlob;
//Controlers for Pad

exports.createNewPad = padHandler.createNewPad;
exports.deletePads = padHandler.deletePads;
exports.updatePad = padHandler.updatePad;
exports.uploadPads = padHandler.uploadPad;
exports.resizePadImage = padHandler.resizePadImage;
exports.extractPadFile = padHandler.extractPad;
exports.createPadContainer= padHandler.createPadContainer;
exports.editPadBlob = padHandler.editPadBlob;

