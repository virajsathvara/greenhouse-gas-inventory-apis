let mongoose = require('mongoose');

class Database {
  constructor() {
  }

  _connect () {
    const connection = process.env.DATABASE_URL
    mongoose.connect(connection)
      .then(() => {
        console.log('Database connection successful')
      })
      .catch(err => {
        console.error('Database connection error', err)
      })
  }
}

module.exports = new Database()