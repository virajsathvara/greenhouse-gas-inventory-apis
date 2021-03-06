const express = require('express');
const { countries } = require('../controllers')
const router = express.Router()

router.get('/countries', countries.getAll)
router.get('/countries/findByName', countries.getByCountry)
router.get('/country/:id/', countries.getById)
module.exports = router;