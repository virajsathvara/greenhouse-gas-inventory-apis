# greenhouse-gas-inventory-apis

> This is an express app with Mongodb as database.
dataset taken from https://www.kaggle.com/unitednations/international-greenhouse-gas-emissions

## APIs you will find 
  1. /countries - get all countries in the dataset (names, ids and their possible values for startYear and endYear)
  2. /country/id?queries=explained-below

    temporal queries - startYear | endYear
    parameters queries - one or parameters (e.g, CO2 or CO2 and NO2)
    should return all values for the selected parameters between startYear and endYear

  3. Appropriate checks for queries and erroneous values
