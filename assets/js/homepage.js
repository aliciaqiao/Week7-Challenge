var userFormEl = document.querySelector('#user-form');
var nameInputEl = document.querySelector('#cityname');
var searchNamesContainerEl = document.querySelector('#Search-history');
var currentdayWeatherList = document.querySelector('#Selected-City');
var fivedayWeatherList = document.querySelector('#Five-Day-Forecast');

var longtitude = null;
var latitude = null;

var todayWeatherInfo;

var fiveDayWeatherArraySave = [];
var currentDayWeatherSave = null;


var formSubmitHandler = function (event) {
    event.preventDefault();
  
    var cityname = nameInputEl.value.trim();
  
    if (cityname) {
      getCityInfo(cityname);
  
      searchNamesContainerEl.textContent = '';
      nameInputEl.value = '';
    }
};

var getCityInfo = function (cityName) {
    //http://api.openweathermap.org/geo/1.0/direct?q=London&limit=5&appid=d30eb409adf6829e86efa6d32c0dfe62
    var apiUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=' + cityName + '&limit=5&appid=d30eb409adf6829e86efa6d32c0dfe62';

    //console.log("Step 1. apiUrl " + apiUrl);
  
    fetch(apiUrl)
      .then(function (response) {
        if (response.ok) {
          console.log(response);
          response.json().then(function (data) {
            console.log(data);
            //Get latitude & longtitude
            getLatLong(data);
            getTodayWeatherInfo(longtitude, latitude, cityName);
          });
        } else {
          alert('Error: ' + response.statusText);
        }
      })
      .catch(function (error) {
        alert('Unable to connect to API Server');
      });
};

function getLatLong(cityNames)
{
    if (cityNames.length != 0)
    {
        //london
        //"lat": 51.5073219,
        //"lon": -0.1276474,
        longtitude = cityNames[0].lon;
        latitude = cityNames[0].lat;
        console.log("longtitude " + longtitude);
        console.log("latitude " + latitude);
    }
}

function getTodayWeatherInfo(long, lat, cityName)
{
    if ((lat != null) && (long != null))
    {
        //https://api.openweathermap.org/data/2.5/forecast?lat=51.5073219&lon=-0.1276474&appid=d30eb409adf6829e86efa6d32c0dfe62
        var apiUrl = 'https://api.openweathermap.org/data/2.5/forecast?lat=' + lat + '&lon=' + long + '&appid=d30eb409adf6829e86efa6d32c0dfe62';

        //console.log("Step 2 apiUrl " + apiUrl);

        fetch(apiUrl)
        .then(function (response) {
        if (response.ok) {
            console.log(response);
            response.json().then(function (data) {
            //console.log(data);
            var todayWeatherInfo;
            todayWeatherInfo = getTodayWeather(data);
            //console.log(todayWeatherInfo);
            if (todayWeatherInfo != null)
            {
                showTodayWeatherInfo(todayWeatherInfo, cityName);
                showNextFiveDayWeatherInfo(data, cityName);
                saveWeatherInfo(cityName, todayWeatherInfo, data);
            }
            saveSearchedCity(cityName);
            });
        } else {
            alert('Error: ' + response.statusText);
        }
        })
        .catch(function (error) {
        alert('Unable to connect to API Server');
        });
    }
}

function getTodayWeather(data)
{
    if (data.list.length != 0)
    {
        var todayWeatherInfo = data.list[0];
        var temp = todayWeatherInfo.main.temp + " F";
        var wind = todayWeatherInfo.main.humidity + " %";
        var humidity = todayWeatherInfo.wind.speed + " MPH";
        var iconid = todayWeatherInfo.weather[0].icon;

        var obj = {
            Temp:  temp,
            Wind: wind,
            Humidity: humidity,
            Iconid: iconid
        };

        return obj;
    }
    else
    {
        return null;
    }
}

function showNextFiveDayWeatherInfo(data, cityName)
{
    fivedayWeatherList.innerHTML = "";

    if (data.list.length != 0)
    {
        console.log("Step 4. Show list of days " + data.list.length);

        //index 8, 16, 24,32, 39
        for (var index = 8; index < data.list.length;)
        {
            var currentWeatherInfo = data.list[index];
            var temp = currentWeatherInfo.main.temp + " F";
            var wind = currentWeatherInfo.main.humidity + " %";
            var humidity = currentWeatherInfo.wind.speed + " MPH";
            var date = currentWeatherInfo.dt_txt.split(" ")[0];
            var iconId = currentWeatherInfo.weather[0].icon;

            console.log("Current: cityName " + cityName);
            console.log("Current: date " + date);
            console.log("Current: temp " + temp);
            console.log("Current: wind " + wind);
            console.log("Current: humidity " + humidity);
            console.log("Current: iconId " + iconId);

            var dayInfoElement = document.createElement('p');
            dayInfoElement.textContent = cityName + " " + date;
        
            var tempElement = document.createElement('span');
            tempElement.innerHTML = "<br>" + "Temp: " + temp;
        
            dayInfoElement.appendChild(tempElement);
        
            var windElement = document.createElement('span');
            windElement.innerHTML = "<br>" + "Wind: " + wind;
        
            dayInfoElement.appendChild(windElement);
        
            var humidityElement = document.createElement('span');
            humidityElement.innerHTML = "<br>" + "Huminitidy: " + humidity;

            dayInfoElement.appendChild(humidityElement);

            var iconURL = 'http://openweathermap.org/img/wn/' + iconId + '@2x.png';
            var iconElement = document.createElement('div');
            iconElement.innerHTML = "<img src=" + iconURL + ">";

            dayInfoElement.appendChild(iconElement);

            index = index + 8;

            if (index == data.list.length)
            {
                index = data.list.length - 1;
            }

            fivedayWeatherList.appendChild(dayInfoElement);
        }
    }
}

function showTodayWeatherInfo(weatherInfo, cityName)
{
    console.log("Step 3. Show today's weather" + weatherInfo);
    var currentdate = moment().format("YYYY-MM-DD");

    currentdayWeatherList.innerHTML = "";

    var dayInfoElement = document.createElement('p');
    dayInfoElement.textContent = cityName + " " + currentdate;

    var tempElement = document.createElement('span');
    tempElement.innerHTML = "<br>" + "Temp: " + weatherInfo.Temp;

    dayInfoElement.appendChild(tempElement);

    var windElement = document.createElement('span');
    windElement.innerHTML = "<br>" + "Wind: " + weatherInfo.Wind;

    dayInfoElement.appendChild(windElement);

    var humidity = document.createElement('span');
    humidity.innerHTML = "<br>" + "Huminitidy: " + weatherInfo.Humidity;

    dayInfoElement.appendChild(humidity);

    var iconURL = 'http://openweathermap.org/img/wn/' + weatherInfo.Iconid + '@2x.png';
    var iconElement = document.createElement('div');
    iconElement.innerHTML = "<img src=" + iconURL + ">";

    dayInfoElement.appendChild(iconElement);

    currentdayWeatherList.appendChild(dayInfoElement);
}

function saveSearchedCity(cityName)
{
    loadSearchedCity();

    var count = localStorage.getItem("count");

    count++;

    //var cityNameElement = document.createElement('span');
    //cityNameElement.innerHTML = "<br>" + cityName;
    var cityNameElement = document.createElement('button');
    cityNameElement.innerHTML = cityName;
    cityNameElement.setAttribute("id",cityName);
    cityNameElement.setAttribute("class","buttonClass");

    searchNamesContainerEl.appendChild(cityNameElement);

    localStorage.setItem(count.toString(), cityName);
    localStorage.setItem("count", count);
}

function saveWeatherInfo(cityName, currentWeatherInfo, data)
{
    var currentWeatherObj = {
        Temp:  currentWeatherInfo.Temp,
        Wind: currentWeatherInfo.Wind,
        Humidity: currentWeatherInfo.Humidity,
        Iconid: currentWeatherInfo.Iconid
    };

    localStorage.setItem(cityName + "current", JSON.stringify(currentWeatherObj));
    localStorage.setItem(cityName + "five", JSON.stringify(data));
}

function loadSearchedCity()
{
    var count = localStorage.getItem("count");
    for (var index = 1; index <= count; index++)
    {
        var cityName = localStorage.getItem(index);
        console.log("Load city " + cityName);

        //var cityNameElement = document.createElement('span');
        //cityNameElement.innerHTML = "<br>" + cityName;

        var buttonElement = document.createElement('button');
        buttonElement.innerHTML = cityName;
        buttonElement.setAttribute("id",cityName);
        buttonElement.setAttribute("class","buttonClass");
       
        searchNamesContainerEl.appendChild(buttonElement);
    }
}

var buttonClickHandler = function (event) {

    event.preventDefault();
    buttonClass = event.target.getAttribute('class');

    if (buttonClass === "buttonClass")
    {
        var cityName = event.target.getAttribute('id');
        console.log("Clicked City Name " + cityName);

        var currentWeatherInfo = JSON.parse(localStorage.getItem(cityName + "current"));
        var data = JSON.parse(localStorage.getItem(cityName + "five"));

        console.log(currentWeatherInfo);
        console.log(data);

        showTodayWeatherInfo(currentWeatherInfo, cityName);
        showNextFiveDayWeatherInfo(data, cityName);
    }
};

//localStorage.clear();

loadSearchedCity();

userFormEl.addEventListener('submit', formSubmitHandler);
searchNamesContainerEl.addEventListener('click', buttonClickHandler);