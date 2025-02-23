const API_KEY = '906d65f711f8fe5b3febe492e0c347b1'; 
const cityInput = document.getElementById('city_input');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const currentWeatherCard = document.querySelector('.weather-left .card');
const dayForecastCard = document.querySelector('.day-forecast');
const hourlyForecastDiv = document.querySelector('.hourly-forecast');
const errorContainer = document.querySelector('.error-container');
const suggestionBox = document.createElement('div');

// Add styles for the suggestion box
suggestionBox.style.position = 'absolute';
suggestionBox.style.backgroundColor = '#fff';
suggestionBox.style.border = '1px solid #ccc';
suggestionBox.style.zIndex = '1000';
suggestionBox.style.width = '100%';
suggestionBox.style.maxHeight = '200px';
suggestionBox.style.overflowY = 'auto';
suggestionBox.style.display = 'none'; // Initially hidden
document.body.appendChild(suggestionBox); // Append to body

let currentFocus = -1; // Track the currently focused suggestion

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const kelvinToCelsius = (kelvin) => (kelvin - 273.15).toFixed(1);

const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const showError = (message) => {
    errorContainer.style.display = 'block';
    errorContainer.querySelector('.error-text').textContent = message;
    setTimeout(() => {
        errorContainer.style.display = 'none';
    }, 3000);
};

const updateCurrentWeather = (data, cityName, countryCode) => {
    const date = new Date();
    const currentWeatherHTML = `
        <div class="current-weather">
            <div class="details">
                <p>Now</p>
                <h2>${kelvinToCelsius(data.main.temp)}°C</h2>
                <p>${data.weather[0].description}</p>
            </div>
            <div class="weather-icon">
                <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="weather-icon">
            </div>
        </div>
        <hr>
        <div class="card-footer">
            <p><i class="fa-regular fa-calendar-days"></i> ${DAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}, ${date.getFullYear()}</p>
            <p><i class="fa-solid fa-location-crosshairs"></i> ${cityName}, ${countryCode}</p>
        </div>`;
    
    currentWeatherCard.innerHTML = currentWeatherHTML;

    document.getElementById('humidityVal').textContent = `${data.main.humidity}%`;
    document.getElementById('pressureVal').textContent = `${data.main.pressure}hPa`;
    document.getElementById('visibilityVal').textContent = `${(data.visibility / 1000).toFixed(1)}km`;
    document.getElementById('windspeedVal').textContent = `${data.wind.speed}m/s`;
    document.getElementById('feelsVal').textContent = `${kelvinToCelsius(data.main.feels_like)}°C`;
};

const updateFiveDayForecast = (forecastList) => {
    const uniqueForecastDays = [];
    const fiveDaysForecast = forecastList.filter(forecast => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
            return uniqueForecastDays.push(forecastDate);
        }
        return false;
    });

    dayForecastCard.innerHTML = '';
    fiveDaysForecast.slice(1, 6).forEach(forecast => {
        const date = new Date(forecast.dt_txt);
        const forecastHTML = `
            <div class="forecast-item">
                <div class="icon-wrapper">
                    <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="weather-icon">
                    <span>${kelvinToCelsius(forecast.main.temp)}°C</span>
                </div>
                <p>${date.getDate()} ${MONTHS[date.getMonth()]}</p>
                <p>${DAYS[date.getDay()]}</p>
            </div>`;
        dayForecastCard.innerHTML += forecastHTML;
    });
};

const updateHourlyForecast = (forecastList) => {
    hourlyForecastDiv.innerHTML = '';
    forecastList.slice(0, 8).forEach(forecast => {
        const hourlyHTML = `
            <div class="card">
                <p>${formatTime(forecast.dt)}</p>
                <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="weather-icon">
                <p>${kelvinToCelsius(forecast.main.temp)}°C</p>
            </div>`;
        hourlyForecastDiv.innerHTML += hourlyHTML;
    });
};

const updateAirQuality = (data) => {
    // Log the entire data object to see its structure
    console.log(data);

    // Check if the AQI value is in the expected location
    const aqiValue = data.list[0].main.aqi; // Assuming data.list[0].main.aqi contains the AQI value
    console.log(`AQI Value: ${aqiValue}`); // Log the AQI value for debugging

    const aqiIndexElement = document.querySelector('.air-index');
    
    // Determine AQI status and class
    let aqiStatus = '';
    let aqiClass = '';

    if (aqiValue <= 50) {
        aqiStatus = 'Good';
        aqiClass = 'aqi-1'; // Class for Good
    } else if (aqiValue <= 100) {
        aqiStatus = 'Moderate';
        aqiClass = 'aqi-2'; // Class for Moderate
    } else if (aqiValue <= 150) {
        aqiStatus = 'Unhealthy for Sensitive Groups';
        aqiClass = 'aqi-3'; // Class for Unhealthy for Sensitive Groups
    } else if (aqiValue <= 200) {
        aqiStatus = 'Unhealthy';
        aqiClass = 'aqi-4'; // Class for Unhealthy
    } else if (aqiValue <= 300) {
        aqiStatus = 'Very Unhealthy';
        aqiClass = 'aqi-5'; // Class for Very Unhealthy
    } else {
        aqiStatus = 'Hazardous';
        aqiClass = 'aqi-5'; // Class for Hazardous
    }

    // Update the AQI index text and class
    aqiIndexElement.textContent = aqiStatus;
    aqiIndexElement.className = `air-index ${aqiClass}`; // Set the class for styling

    // Update the other air quality components
    document.getElementById('pm25Val').textContent = `${data.list[0].components.pm2_5} µg/m³`;
    document.getElementById('pm10Val').textContent = `${data.list[0].components.pm10} µg/m³`;
    document.getElementById('so2Val').textContent = `${data.list[0].components.so2} µg/m³`;
    document.getElementById('coVal').textContent = `${data.list[0].components.co} µg/m³`;
    document.getElementById('noVal').textContent = `${data.list[0].components.no} µg/m³`;
    document.getElementById('no2Val').textContent = `${data.list[0].components.no2} µg/m³`;
    document.getElementById('nh3Val').textContent = `${data.list[0].components.nh3} µg/m³`;
    document.getElementById('o3Val').textContent = `${data.list[0].components.o3} µg/m³`;
};

const updateSunriseSunset = (data) => {
    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-US');
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('en-US');
    document.getElementById('sunriseVal').textContent = sunrise;
    document.getElementById('sunsetVal').textContent = sunset;
};

const getWeatherDetails = async (lat, lon, cityName, countryCode) => {
    try {
        const [weatherResponse, forecastResponse, airQualityResponse] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`),
            fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`),
            fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
        ]);

        const weatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();
        const airQualityData = await airQualityResponse.json();

        if (weatherData.cod === '404' || forecastData.cod === '404') {
            showError('City not found!');
            return;
        }

        updateCurrentWeather(weatherData, cityName, countryCode);
        updateFiveDayForecast(forecastData.list);
        updateHourlyForecast(forecastData.list);
        updateAirQuality(airQualityData);
        updateSunriseSunset(weatherData);

    } catch (error) {
        showError('An error occurred while fetching the weather data!');
    }
};

const getCityCoordinates = async () => {
    const cityName = cityInput.value.trim();
    if (!cityName) {
        showError('Please enter a city name!');
        return;
    }

    try {
        const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`);
        const data = await response.json();

        if (!data.length) {
            showError('City not found!');
            return;
        }

        const { name, lat, lon, country } = data[0];
        getWeatherDetails(lat, lon, name, country);
        cityInput.value = '';

    } catch (error) {
        showError('An error occurred while fetching the coordinates!');
    }
};

// Function to fetch city suggestions
const fetchCitySuggestions = async (query) => {
    if (!query) {
        suggestionBox.style.display = 'none'; // Hide suggestions if input is empty
        return;
    }

    try {
        const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`);
        const suggestions = await response.json();

        // Clear previous suggestions
        suggestionBox.innerHTML = '';

        if (suggestions.length) {
            suggestions.forEach((suggestion, index) => {
                const suggestionItem = document.createElement('div');
                suggestionItem.textContent = `${suggestion.name}, ${suggestion.country}`;
                suggestionItem.style.cursor = 'pointer';
                suggestionItem.style.padding = '10px';
                suggestionItem.style.borderBottom = '1px solid #ccc';

                // Highlight the selected suggestion
                suggestionItem.addEventListener('mouseover', () => {
                    currentFocus = index;
                    highlightSuggestion();
                });

                // Add click event to select suggestion
                suggestionItem.addEventListener('click', () => {
                    cityInput.value = suggestion.name; // Set input value to selected suggestion
                    suggestionBox.style.display = 'none'; // Hide suggestions
                    getWeatherDetails(suggestion.lat, suggestion.lon, suggestion.name, suggestion.country); // Fetch weather details
                });

                suggestionBox.appendChild(suggestionItem);
            });
            suggestionBox.style.display = 'block'; // Show suggestions
        } else {
            suggestionBox.style.display = 'none'; // Hide if no suggestions
        }
    } catch (error) {
        console.error('Error fetching city suggestions:', error);
    }
};

// Highlight the currently focused suggestion
const highlightSuggestion = () => {
    const items = suggestionBox.children;
    for (let i = 0; i < items.length; i++) {
        items[i].style.backgroundColor = (i === currentFocus) ? '#e0e0e0' : '#fff'; // Change background color
    }
};

// Handle keyboard navigation
cityInput.addEventListener('keydown', (e) => {
    const items = suggestionBox.children;
    if (e.key === 'ArrowDown') {
        currentFocus++;
        if (currentFocus >= items.length) currentFocus = 0; // Loop back to the first suggestion
        highlightSuggestion();
    } else if (e.key === 'ArrowUp') {
        currentFocus--;
        if (currentFocus < 0) currentFocus = items.length - 1; // Loop back to the last suggestion
        highlightSuggestion();
    } else if (e.key === 'Enter') {
        if (currentFocus > -1 && items.length > 0) {
            items[currentFocus].click(); // Simulate click on the selected suggestion
        }
    }
});

// Event listener for input to fetch city suggestions
cityInput.addEventListener('input', (e) => {
    fetchCitySuggestions(e.target.value);
});

// Hide suggestion box when clicking outside
document.addEventListener('click', (e) => {
    if (e.target !== cityInput) {
        suggestionBox.style.display = 'none'; // Hide suggestions
    }
});

const getCurrentLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(
                        `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`
                    );
                    const data = await response.json();
                    const { name, country } = data[0];
                    getWeatherDetails(latitude, longitude, name, country);
                } catch (error) {
                    showError('An error occurred while fetching the location data!');
                }
            },
            (error) => {
                showError('Unable to get your location!');
            }
        );
    } else {
        showError('Your browser does not support geolocation!');
    }
};

searchBtn.addEventListener('click', getCityCoordinates);
locationBtn.addEventListener('click', getCurrentLocation);
cityInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        getCityCoordinates();
    }
});

window.addEventListener('load', () => {
    getCityCoordinates('London');
});