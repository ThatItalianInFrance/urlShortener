const express = require('express');
const router = express.Router();
const urlController = require('../controllers/url.controller');

router.post('/shorten', urlController.shortenUrl);
router.get('/shorten-list', urlController.getShortenList);
router.get('/:shortCode', urlController.redirectUrl);


module.exports = router;