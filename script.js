// LOAD DATA FROM ROOT FOLDER
let ISO_Country_Codes;
getISOCodes();
async function getISOCodes() {
    const response = await fetch('./ISO_Country_Codes.txt');
    ISO_Country_Codes = await response.json();
}

function getCountry(countyrCode) {
    return ISO_Country_Codes[countyrCode.toUpperCase()];
}



const api_key = 'd202b03c2952f4d83f77ff52f618dc9d';

const searchedCitiesArr = [
    // {
    //     cityName: 'GHAZIABAD',
    //     currTemp: '17',
    //     cardElement: '<div>....</div>'
    // }
]

async function getCurrWeatherDetails(searchQuery) {

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${searchQuery}&units=metric&appid=${api_key}`;

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

    console.log(currWeatherData);

    const weatherDetails = {
        cityName: currWeatherData.name.toUpperCase(),
        countryName: getCountry(currWeatherData.sys.country),

        currTemp: parseInt(currWeatherData.main.temp),
        tempMin: parseInt(tempRangeObject.list[0].main.temp_min),
        tempMax: parseInt(tempRangeObject.list[0].main.temp_max),

        description: currWeatherData.weather[0].main,
        detailedDescription: currWeatherData.weather[0].description,

        iconUrl: `https://openweathermap.org/img/wn/${currWeatherData.weather[0].icon}@2x.png`
    }

    return weatherDetails;

    async function getDailyWeatherDetails() {
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${searchQuery}&cnt=1&units=metric&appid=${api_key}`;

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
        focusExistingCard(existingCard.cardElement);
    }
    else {

        const weatherDetails = await getCurrWeatherDetails(searchQuery);

        // assuming no error in the awaited method
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
        }
    }
})

function insertNewCardContainer() {
    const cardContainer = document.createElement('div');
    cardContainer.className = 'weather-card-outer-container';

    cardsDisplaySection.appendChild(cardContainer);
}

function createNewWeatherCard(weatherObject) {
    
    const weatherCard = document.createElement('div');
    weatherCard.classList.add('weather-card');

    const cityName = weatherObject.cityName.charAt(0).toUpperCase() + weatherObject.cityName.slice(1).toLowerCase();

    weatherCard.innerHTML = `
    
                    <div class="top-row">
                        <div class="main-temp-container">
                            <span class="curr-temp-value">${weatherObject.currTemp}</span>&deg
                        </div>
                        <div class="weather-icon-container">
                            <img src="${weatherObject.iconUrl}" alt="">
                        </div>
                    </div>

                    <div class="bottom-row">
                        <div class="bottom-left">
                            <div class="temp-range-container">H:${weatherObject.tempMax}&deg<span class="temp-max"></span> L:${weatherObject.tempMin}&deg<span class="temp-min"></span></div>
                            <div class="location-container"><span class="city-name">${cityName}</span>, <span class="country-name">${weatherObject.countryName}</span></div>
                        </div>
                        <div class="bottom-right">
                            <div class="main-description">${weatherObject.description}</div>
                            <div class="detailed-description">${weatherObject.detailedDescription}</div>
                        </div>
                    </div>
                `;

    return weatherCard;                
}

function focusExistingCard(cardElement) {
    cardElement.scrollIntoView();
    cardElement.classList.add('highlighted');

    setTimeout(()=> {

        console.log('removing highlighted', cardElement);
        cardElement.classList.remove('highlighted');
    },1500);
}

function renderCardsFromArray() {
    const containersList = document.querySelectorAll('.weather-card-outer-container');

    for (let index = 0; index < containersList.length; index++) {
        
        const container = containersList[index];
        const card = searchedCitiesArr[index].cardElement;

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