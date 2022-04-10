
const mongoose = require('mongoose')

let gasInventorySchema = new mongoose.Schema({
  _id: {
    required: true,
    type: mongoose.Schema.Types.ObjectId
  },
  country_or_area: {
    type: String
  },
  year: {
    type: String
  },
  value: {
    type: String
  },
  category: {
    type: String
  }
})

module.exports = mongoose.model('gasInventory', gasInventorySchema, 'gasInventory')