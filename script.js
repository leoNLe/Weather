
// let previousCity = {};
let apiKey = "2f9162c82cbad8d75e95e9ca80aac97f";
let dataPerDay = 8;
let prevSearch = []

init();

function init() {
    /*
        Search for if there is already PrevSearch in localStorage.  if there it load it back into prevSearch has an array. 
        else load with default City Irvine
    */
    if(localStorage.getItem("prevSearch")) {
        prevSearch = localStorage.getItem("prevSearch").split(",");
    } else {
        prevSearch = ["Irvine US"];
    }

    //Load initial variables 
    getCurrentWeather(prevSearch[0]);
    getFutureWeather(prevSearch[0]);
    createCityBtns();
}

function createCityBtns() {
    let cityList = $(".cityList");
    cityList.empty();

    for(let i = 0; i < prevSearch.length; i++) {
        cityList.append(`<li data-name="${prevSearch[i]}"> ${prevSearch[i]}</li>`)
    }
    //Eventlistener have to be added back each time b/c li are destroyed and created after every search.
    $("ul li").on("click", function(){
        let cityName = $(this).attr("data-name");
        getCurrentWeather(cityName);
        getFutureWeather(cityName);
    })
}

//Return formatted dates with unixTime given by API
function getDate(unixTime) {
    let fDate = new Date(unixTime *1000);
    let month = fDate.getMonth() >= 9 ? fDate.getMonth()+1: `0${fDate.getMonth()+1}`;
    let date = fDate.getDate() >= 9 ? fDate.getDate()+1: `0${fDate.getDate()+1}`; 
    
    return `${month}/${date}/${fDate.getFullYear()}`;
}

//Get and display weather for next 5 days.
function getFutureWeather(cityName){
    cityName = cityName.replace(" ", ",");
    let futureQuery = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=Imperial`;

    $.ajax({
        url: futureQuery,
        method: "GET"
    }).then( function(resp) {

        let city = resp.list;
        let futureDiv = $(".future-div")
        let totalTemp = 0;
        let totalHumid = 0;
        let date = "";
        futureDiv.empty();
        //loop will go to 1 past last index to calculate average.
        let iconLink;
        for(let i = 0; i <= resp.list.length; i++) {
            //if index reaches next day.
            if(i % dataPerDay === 0 ) {
                //prevent it displaying average when index is at zero
                if( i !== 0) {
                    //When it is % === 0 average for the day can be calculated and display to user.
                    let avgTemp = (totalTemp / dataPerDay).toFixed(2);
                    let avgHumid = (totalHumid / dataPerDay).toFixed(2);
                    
                    futureDiv.append(`<div class="future">
                                        <h5>${date}</h5>
                                        <img class="weather-icon" src=${iconLink}> 
                                        <p> Temp: ${avgTemp} &#8457 </p>
                                        <p>Humidity: ${avgHumid}% </p>
                                    </div>
                                    `) 
                }
                //prevent it from parsing information when i is 1 pass max index 
                if(i < resp.list.length) {
                    date = getDate(parseInt(city[i].dt));
                    totalTemp = city[i].main.temp;
                    totalHumid = city[i].main.humidity;
                    iconLink = `http://openweathermap.org/img/wn/${city[i].weather[0].icon}.png`;
                }
            } else  {
                totalTemp += city[i].main.temp;
                totalHumid += city[i].main.humidity;
            }
        }
    })
}

function getCurrentWeather(cityName) {
    
    cityName = cityName.replace(" ", ",");
    let currentQuery = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=Imperial`
    
    $.ajax({
        url: currentQuery,
        method: "GET"
    }).then(function(resp){

        let iconLink = `http://openweathermap.org/img/wn/${resp.weather[0].icon}.png`;

        $(".current").html(`<h2>${resp.name} <img src="${iconLink}"></img> </h2>
                            <p>Temperature: ${resp.main.temp} &#8457 </p>
                            <p>Humidity: ${resp.main.humidity} %</p>
                            <p>Wind Speed: ${resp.wind.speed}
                            <p> UV Index: How can I make this fun?`);

        //Delete previous entry in the array if it is present 
        if(prevSearch.includes(`${resp.name} ${resp.sys.country}`)) {
            prevSearch.splice(prevSearch.indexOf(`${resp.name} ${resp.sys.country}`), 1);
        } 

        prevSearch.unshift(`${resp.name} ${resp.sys.country}`);
        localStorage.setItem("prevSearch",prevSearch);
        createCityBtns();
})


}
$(".search").on("click", function() {
    let searchBar = $(this).siblings(".cityQuery");
    let cityName = searchBar.val();
    searchBar.val("");

    if(cityName !=="") {
        getCurrentWeather(cityName);
        getFutureWeather(cityName)
    }
})

