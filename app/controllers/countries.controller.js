const models = require('../models')
const { gasInventory } = models
let Validator = require('validatorjs');
const { ObjectId } = require('mongoose').Types
const _ = require('lodash')
const cache = require('memory-cache');

const validator = (data, rules, errorMessages) => {
  const validation = new Validator(data, rules, errorMessages)
  return {
    isValid: validation.passes(),
    errors: validation.errors
  }
}

const validateQuery = (queries) => {
  let startYear = 1000, endYear = new Date().getFullYear(), category = ''
  startYear = queries.startYear ? queries.startYear : startYear
  endYear = queries.endYear ? queries.endYear : endYear
  category = queries.category ? queries.category : category

  const queryRules = {
    startYear: 'integer|between:1000,9999',
    endYear: `integer|min:${startYear}|between:1000,9999`,
    category: 'string'
  }
  const validation = validator({ startYear, endYear, category }, queryRules, {
    between: ':attribute must be a valid year',
    min: 'invalid year range'
  })
  if (validation.isValid) {
    return {
      startYear,
      endYear,
      category
    }
  } else {
    return {
      errors: validation.errors
    }
  }
}

/* if category is 'methane_ch4_emissions_without_land_use_land_use_change_and_forestry_lulucf_in_kilotonne_co2_equivalent'
  category is considered as 'methane_ch4_'(anything that comes before the word 'emission')
  so if a user passes ch4 as category, we consider that case as true.
*/
const filterUsingCategory = (data, category) => {
  return _.filter(data, (d) => {
    const c = d.category.substring(0, d.category.indexOf('emissions'))
    const categories = category.split(',') // in case multiple comma separated categories passed
    for (let ctg of categories) {
      if (ctg && c.toLowerCase().includes(ctg.toLowerCase())) {
        return d
      }
    }
  })
}

const getUrl = (req) => {
  console.log(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
  return `${req.protocol}://${req.get('host')}${req.originalUrl}`
}

module.exports.getAll = async (req, res) => {
  const isQueryValid = validateQuery(req.query)
  if (!isQueryValid.errors) {
    const { startYear, endYear, category } = isQueryValid
    try {
      const cachedReq = cache.get(getUrl(req))
      if (cachedReq) {
        res.send(cachedReq)
      } else {
        let data = await gasInventory.find({
          year: {
            $gte: `${startYear}`,
            $lt: `${endYear}`
          }
        }).sort({ year: 'asc' })

        if (category) {
          data = filterUsingCategory(data, category)
        }
        if (data.length < 1) {
          res.status(404).send('not found')
        } else {
          cache.put(getUrl(req), data)
          res.send(data)
        }
      }
    } catch (error) {
      res.status(500).json(error)
    }
  } else {
    res.status(400).json(isQueryValid.errors)
  }
}

module.exports.getById = async (req, res) => {
  const { id } = req.params
  let validId = false
  try {
    if (new ObjectId(id).toString() == id) validId = true
  } catch (error) {
    res.status(400).json({
      id: 'not a valid object id'
    })
  }
  if (validId) {
    const cachedReq = cache.get(getUrl(req))
    if (cachedReq) {
      res.send(cachedReq)
    } else {
      try {
        const response = await gasInventory.find({ _id: id })
        cache.put(getUrl(req), response)
        res.send(response)
      } catch (error) {
        res.status(500).json(error)
      }
    }
  }
}

module.exports.getByCountry = async (req, res) => {
  const { countries } = req.query
  const rules = {
    countries: 'required|string'
  }
  const validation = validator({ countries }, rules)
  if (validation.isValid) {
    let allCountries = countries.split(",")
    const cachedReq = cache.get(getUrl(req))
    if (cachedReq) {
      res.send(cachedReq)
    } else {
      try {
        const response = await gasInventory.find({ country_or_area: allCountries })
        if (response.length < 1) {
          res.status(404).send('not found')
        } else {
          cache.put(getUrl(req), response)
          res.send(response)
        }
      } catch (error) {
        res.status(500).json(error)
      }
    }
  } else {
    res.status(400).json(validation.errors)
  }

}