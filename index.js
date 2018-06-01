const axios = require('axios');
const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

var allSunglassesIDs = [];
var allSunglassesData = [];
var requestForIDsPromises = [];
var requestForFramesDetailsPromises = [];
var sunglassesDATA = [];


// Web request of all the sunglass data
for (var i = 0; i < 9; i++) {
  requestForIDsPromises.push(axios.get('https://www.foreyes.com/getproducts?val=' + i + '&glassesType=Sunglasses&tryOn=&brand=&price=&gender=&color=&search=&_=1527729753946'))
}
// Using jquery to fetch all the Sunglasses ID
axios.all(requestForIDsPromises)
  .then(function (results) {
    results.forEach(function (response) {
      var { window } = new JSDOM(response.data)
      const $ = require('jquery')(window)
      $('.tc.sel-content[data-sku]').each((index, el) => {
        allSunglassesIDs.push($(el).attr('data-sku'))
      });
    });
    return allSunglassesIDs
  })
  .then(function (idArray) {
    // Iteration on all the data on modal
    for (var i = 0; i < idArray.length; i++) {
      requestForFramesDetailsPromises.push(axios.post('https://www.foreyes.com/_framesdetails', {
        ProductSku: idArray[i]
      }));
    }

    return axios.all(requestForFramesDetailsPromises)

  })
  .then(function (results) {
    //Getting HTML of all the Sunglasses and extracting the data on the Modal
    results.forEach(function (response) {
      var justTheHTML = response.data.substring(response.data.indexOf('</style>') + 8, response.data.indexOf('<script>'))
      var { window } = new JSDOM(justTheHTML)
      const $ = require('jquery')(window)
      var currentFrames = {}

      // Getting the DATA and pushing to CurrenFrames Object
      $('.col.col-right > div:gt(0)').each((index, el) => {
        currentFrames[$(el).text().substring(0, $(el).text().indexOf(':'))] = $(el).text().substring($(el).text().indexOf(':') + 3).trim()
      });
      sunglassesDATA.push(currentFrames)
    });

    return sunglassesDATA;

  })
  .then(function (finalDATA) {
    // printing all data to file
    fs.writeFile('DATA.txt', JSON.stringify(finalDATA, null, 1), (err) => {
      if (err) throw err;
    });

  });
