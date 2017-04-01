// This will perform a search. The object passed into this function
// can contain all the perameters the API accepts in the `POST /v2/search` endpoint
var NutritionixClient = require('nutritionix');
var nutritionix = new NutritionixClient({
    appId: 'e69dc162',
    appKey: '865932f4797453026efba0204cc585bd'
    // debug: true, // defaults to false
});

function getFatInfo (food) {
  // This will perform a search. The object passed into this function
  // can contain all the perameters the API accepts in the `POST /v2/search` endpoint
  return nutritionix.search({
    q:food,
    // use these for paging
    limit: 1,
    offset: 0,

    // controls the basic nutrient returned in search
    search_nutrient: 'fat'
  }).then(results => {
    var fullString = results.results[0].nutrient_name + ': ' + (results.results[0].nutrient_value || 0);
    console.log(fullString)
    return fullString;
  });
}

  function getCaloriesInfo (food) {
    // This will perform a search. The object passed into this function
    // can contain all the perameters the API accepts in the `POST /v2/search` endpoint
    return nutritionix.search({
      q:food,
      // use these for paging
      limit: 1,
      offset: 0,

      // controls the basic nutrient returned in search
      search_nutrient: 'calories'
    }).then(results => {
      var fullString = results.results[0].nutrient_name + ': ' + (results.results[0].nutrient_value || 0);
      return fullString;
    });
  }

  function getCarbInfo (food) {
      // This will perform a search. The object passed into this function
      // can contain all the perameters the API accepts in the `POST /v2/search` endpoint
      return nutritionix.search({
        q:food,
        // use these for paging
        limit: 1,
        offset: 0,

        // controls the basic nutrient returned in search
        search_nutrient: 'carb'
      }).then(results => {
        var fullString = results.results[0].nutrient_name + ': ' + (results.results[0].nutrient_value || 0);
        return fullString;
      });
    }

function getNutrition (food) {
  return Promise.all([getFatInfo(food), getCarbInfo(food), getCaloriesInfo(food)]).then(values=> {
    return 'Nutrition info for ' + food + ' : ' + 
        values[0] + ' / ' +
        values[1] + ' / ' +
        values[2];
  })

}

module.exports = getNutrition;