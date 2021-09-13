const express = require('express');
const adminController = require('../controllers/adminController');
const router = express.Router();

/************
 * Album API
 *************/
//These routers has rendering task, will not work with another method
router
  .route('/album/:id')
  .patch(
    adminController.uploadAlbumImage,
    adminController.resizeAlbumImage,
    adminController.updateAlbum
  )
  .post(
    adminController.uploadAlbumImage,
    adminController.resizeAlbumImage,
    adminController.createNewAlbum
  );
router.delete('/album', adminController.deleteAlbum)

/************
 * Artist API
 *************/
//These routers has rendering task, will not work with another method
router
  .route('/artist/:id')
  .patch(
    adminController.uploadArtistImage,
    adminController.resizeArtistImage,
    adminController.updateArtist
  )
  .post(
    adminController.uploadArtistImage,
    adminController.resizeArtistImage,
    adminController.createNewArtist
  );
router.delete("/artist", adminController.deleteArtist);

/************
 * Producer API
 *************/
//These routers has rendering task, will not work with another method
router
  .route('/producer/:id')
  .patch(
    adminController.uploadProducerImage,
    adminController.resizeProducerImage,
    adminController.updateProducer
  )
  .post(
    adminController.uploadProducerImage,
    adminController.resizeProducerImage,
    adminController.createNewProducer
  );
router.delete("/producer", adminController.deleteProducer);

/************
 * Track API
 *************/

router
  .route('/track/:id')
  .patch(
    adminController.editTrack,
    adminController.uploadTracks,
    adminController.updateTrack
  )
  .post(
    adminController.createTrackContainer,
    adminController.uploadTracks,
    adminController.createNewTrack
  )
  router.delete('/track', adminController.deleteTracks);


/************
 * Patch API
 *************/

router
  .route('/patch/:id')
  .post(
    adminController.createPatchBlob,
    adminController.uploadPatch,
    adminController.createNewPatch
  )
  .patch(
    adminController.editPatchBlob,
    adminController.uploadPatch,
    adminController.updatePatch
  );
  router.delete('/patch', adminController.deletePatches)

/************
 * Pad API
 *************/

router
  .route('/pad/:id')
  .post(
    adminController.createPadContainer,
    adminController.uploadPads,
    adminController.createNewPad
  )
  .patch(
    adminController.editPadBlob,
    adminController.uploadPads,
    adminController.updatePad
  );
  router.delete('/pad', adminController.deletePads);

module.exports = router;
