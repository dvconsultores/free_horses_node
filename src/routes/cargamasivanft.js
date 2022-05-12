const express = require('express')
const router = express.Router()
const { cargaMasivaNft } = require('../controllers/cargamasivanft')

router.post('/cargamasivanft/', cargaMasivaNft)

module.exports = router