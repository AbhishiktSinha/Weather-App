// LOAD DATA FROM ROOT FOLDER
let ISO_Country_Codes;
getISOCodes();
async function getISOCodes() {
    const response = await fetch('./ISO_Country_Codes.txt');
    ISO_Country_Codes = await response.json();
}

function getCountry(countryCode) {
    return ISO_Country_Codes[countryCode.toUpperCase()];
}



const api_key = 'd202b03c2952f4d83f77ff52f618dc9d';
const baseURL = `https://api.openweathermap.org/data/2.5`;

let searchedCitiesArr = [
    // {
    //     cityName: 'GHAZIABAD',
    //     currTemp: '17',
    //     cardElement: '<div>....</div>'
    // }
]

getDeviceLocationWeather();


function getDeviceLocationWeather() {
    let deviceLocation, error;
    
    try {

        navigator.geolocation.getCurrentPosition((position)=>{
            deviceLocation = {lat: position.coords.latitude, lon: position.coords.longitude};        
            console.log(deviceLocation);
            localStorage.setItem("deviceLocation", JSON.stringify(deviceLocation));
            
            addNewWeatherCity(null, deviceLocation);

        }, (error)=>{
            console.log(error);
        });

    }
    catch (error) {
        console.log(error);
    }

}

function addNewWeatherCity(query, deviceLocation) {

    getCurrWeatherDetails(query, deviceLocation).
        then((weatherDetails) => {

            if (weatherDetails) {
                insertNewCardContainer();

                const newWeatherCard = createNewWeatherCard(weatherDetails);
                const cardObject = {
                    cityName: weatherDetails.cityName,
                    currTemp: weatherDetails.currTemp,
                    cardElement: newWeatherCard
                };

                updateCitiesArray(cardObject);

                renderCardsFromArray();

                focusCard(newWeatherCard);
            }
            else {
                throw new Error('whoops in getting weatherDetails');
            }
        })
        .catch((error) => {
            console.log(error);
        })
}

async function getCurrWeatherDetails(searchQuery, position) {

    let url;

    if (position) {
        const {lat, lon} = position;
        url = `${baseURL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${api_key}`;
    }
    else {
        url = `${baseURL}/weather?q=${searchQuery}&units=metric&appid=${api_key}`;
    }

    let responseObject, currWeatherData;

    try {
        responseObject = await fetch(url);

        if (responseObject.ok) {
            currWeatherData = await responseObject.json();
        }
        else {
            throw new Error('ERROR: NOT FOUND | Invalid Search Query');
        }
    } catch (e) {
        alert(e);
        return null;
    }


    const tempRangeObject = await getDailyWeatherDetails(); 

    // console.log(currWeatherData);

    const weatherDetails = {
        cityName: currWeatherData.name.toUpperCase(),
        countryName: getCountry(currWeatherData.sys.country),

        currTemp: parseInt(currWeatherData.main.temp),
        tempMin: parseInt(tempRangeObject.list[0].main.temp_min),
        tempMax: parseInt(tempRangeObject.list[0].main.temp_max),

        feelsLikeTemp: parseInt(currWeatherData.main.feels_like),
        humidity: parseInt(currWeatherData.main.humidity),

        description: currWeatherData.weather[0].main,
        detailedDescription: currWeatherData.weather[0].description,

        iconUrl: `https://openweathermap.org/img/wn/${currWeatherData.weather[0].icon}@2x.png`
    }
    console.log(weatherDetails);

    return weatherDetails;

    async function getDailyWeatherDetails() {
        let url;
        if (position) {
            const {lat, lon} = position;
            url = `${baseURL}/forecast?lat=${lat}&lon=${lon}&cnt=1&units=metric&appid=${api_key}`
        }
        else {
            url = `${baseURL}/forecast?q=${searchQuery}&cnt=1&units=metric&appid=${api_key}`;
        }


        const responseObj = await fetch(url);

        const dailyWeatherData = responseObj.json();

        console.log(dailyWeatherData);

        return dailyWeatherData;
    }

}

/*  RETURNED OBJECT
    {
        cityName: currWeatherData.name,
        countryName: getCountry(currWeatherData.sys.country),

        currTemp: currWeatherData.main.temp,
        tempMin: tempRangeObject.main.temp_min,
        tempMax: tempRangeObject.main.temp_max,

        description: currWeatherData.weather.main,
        detailedDescription: currWeatherData.weather.description,

        iconUrl: `https://openweathermap.org/img/wn/${currWeatherData.weather.icon}@2x.png`
    }
*/

// DOM OBJECTS
const searchForm = document.getElementById('search-form');
const cardsDisplaySection = document.querySelector('.weather-cards-display-section')
/*  on submit
        1) check presence
            if not present,
                a) fetch data
                    if fetched, 
                        insert a container
                        create card element
                        create array element
                        update array
                        render elements from sorted array

            if present,    
                scroll into view
                highlight
*/  

searchForm.addEventListener('submit', async (event)=> {
    event.preventDefault();

    const searchQuery = searchForm.searchInput.value.toUpperCase();

    const existingCard = searchedCitiesArr.find((element)=> {
        return (element.cityName.localeCompare(searchQuery) === 0)
    });


    if (existingCard) {
        focusCard(existingCard.cardElement);
    }
    else {

        addNewWeatherCity(searchQuery);
    }

    searchForm.reset();
})

function insertNewCardContainer() {
    const cardContainer = document.createElement('div');
    cardContainer.className = 'weather-card-outer-container';

    cardsDisplaySection.appendChild(cardContainer);
}

function handleDelete(cityName) {
    console.log('trying to delete');

    let deletedCityObj;

    searchedCitiesArr = searchedCitiesArr.filter((item)=>{
        if (item.cityName === cityName.toUpperCase()) {
            deletedCityObj = item;
        }
        return (item.cityName !== cityName.toUpperCase());
    });

    console.log(deletedCityObj);
    
    // we have the reference of the targeted card, we can just remove it from the DOM
    // since removing from a sorted array does not disturb the sorting

    deletedCityObj.cardElement.classList.add('delete-card');
    setTimeout(()=>{
        deletedCityObj.cardElement.parentElement.remove();
    }, 400);
}
function createNewWeatherCard(weatherObject) {
    
    const weatherCard = document.createElement('div');
    weatherCard.classList.add('weather-card');

    let { cityName, currTemp, feelsLikeTemp, humidity, iconUrl, tempMax, tempMin, countryName, description, detailedDescription} = weatherObject;

    cityName = cityName.charAt(0).toUpperCase() + cityName.slice(1).toLowerCase();

    function handleClick() {
        handleDelete(cityName);
    }
    weatherCard.innerHTML = `
    <button class="delete-card-btn hide material-symbols-outlined" data-city="${cityName}" onClick="handleDelete('${cityName}')">X</button>

                    <div class="top-row">
                        <div class="main-temp-container">
                            <div class="curr-temp"><span class="curr-temp-value">${currTemp}</span>&deg</div>
                            <div class="feels-like-temp">Feels like: <span class="feels-like-temp-value">${feelsLikeTemp}</span><span>&deg</span></div>
                            <div class="humidity">Humidity: <span class="humidity-value">${humidity}</span><span style="font-size: var(--subtext)"</span>%</div>
                        </div>
                        <div class="weather-icon-container">
                            <img src="${iconUrl}" alt="">
                        </div>
                    </div>

                    <div class="bottom-row">
                        <div class="bottom-left">
                            <div class="temp-range-container">H:${tempMax}&deg<span class="temp-max"></span> L:${tempMin}&deg<span class="temp-min"></span></div>
                            <div class="location-container"><span class="city-name">${cityName}</span>, <span class="country-name">${countryName}</span></div>
                        </div>
                        <div class="bottom-right">
                            <div class="main-description">${description}</div>
                            <div class="detailed-description">${detailedDescription}</div>
                        </div>
                    </div>
                `;

    return weatherCard;                
}

function focusCard(cardElement) {
    cardElement.scrollIntoView();
    cardElement.classList.add('highlighted');

    setTimeout(()=> {

        console.log('removing highlighted', cardElement);
        cardElement.classList.remove('highlighted');
    },1500);
}

function renderCardsFromArray() {
    const containersList = document.querySelectorAll('.weather-card-outer-container');
    console.log(containersList);
    console.log

    let index = 0;
    for (index = 0; index < searchedCitiesArr.length; index++) {
        
        if (index >= containersList.length) {
            insertNewCardContainer();            
        }
        const container = containersList[index];
        const card = searchedCitiesArr[index].cardElement;
        
        // FROM MDN: If the given child is a reference to an existing node in the document, 
        // appendChild() moves it from its current position to the new position.
        container.appendChild(card);
    }


}


function updateCitiesArray(cardObject) {
    if (cardObject) {
        searchedCitiesArr.push(cardObject);
    }
    
    searchedCitiesArr.sort((a,b)=> {
        return(a.currTemp - b.currTemp);
    })
}