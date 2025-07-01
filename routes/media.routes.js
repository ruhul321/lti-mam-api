const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/media.controller');
const fakeAuth = require('../middleware/fakeAuth');

router.post('/select',fakeAuth, mediaController.selectMedia);
router.get('/user/:userId',fakeAuth, mediaController.getMediaByUser);

module.exports = router;