const express = require('express')
const mongoose = require('mongoose')
//  const database = require('./database')
const routes = require('./app/routes')
require('dotenv').config()

const app = express()

const mongoString = process.env.DATABASE_URL

mongoose.connect(mongoString)
const database = mongoose.connection

database.on('error', (error) => {
  console.log(error)
})

database.once('connected', () => {
  console.log('Database Connected');
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/', routes.countriesRouter)

const port = process.env.PORT
app.listen(port, () => {
  console.log('Server started at', port);
})