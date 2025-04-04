const apiKey = "5b4567cb2f16c6684716922a53f3a1b3"; // OpenWeather API Key
const weatherApiUrl = "https://api.openweathermap.org/data/2.5/weather"; // Current weather
const forecastApiUrl = "https://api.openweathermap.org/data/2.5/forecast"; // 5-day forecast
const airQualityUrl = "https://api.openweathermap.org/data/2.5/air_pollution";

// ✅ Fetch Weather Data
function getWeather(city=document.getElementById("cityInput").value) {
    const url = `${weatherApiUrl}?q=${city}&units=metric&appid=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            updateWeatherUI(data);
            getAirQuality(data.coord.lat, data.coord.lon);
            getForecast(city); // Fetch 5-day forecast
        })
        .catch(error => console.error("Weather API Error:", error));
}

// ✅ Fetch 5-Day Forecast
function getForecast(city) {
    const url = `${forecastApiUrl}?q=${city}&units=metric&appid=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => updateForecastUI(data))
        .catch(error => console.error("Forecast API Error:", error));
}

// ✅ Update UI with Current Weather
function updateWeatherUI(data) {
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();
    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
    //const feelsLike = new (data.main.feels_like).toLocaleTimeString();
    
    document.getElementById("city-name").innerText = `Location - ${data.name}`;
    document.getElementById("temperature").innerText = `Temperature: ${data.main.temp}°C`;
    document.getElementById("weather-condition").innerText = `Condition: ${data.weather[0].description}`;
    document.getElementById("humidity").innerText = `Humidity: ${data.main.humidity}%`;
    document.getElementById("wind-speed").innerText = `Wind Speed: ${data.wind.speed} km/h`;
    document.getElementById("visibility").innerText = `Visibility: ${(data.visibility / 1000).toFixed(1)} km`;
    document.getElementById("sunrise").innerText = `Sunrise: ${sunrise}`;
    document.getElementById("sunset").innerText = `Sunset: ${sunset}`;
    document.getElementById("feels-like").innerText = `Feels Like: ${data.main.feels_like}°C`;
    document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
}

// ✅ Update UI with Air Quality Data
function getAirQuality(lat, lon) {
    const url = `${airQualityUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => updateAirQualityUI(data))
        .catch(error => console.error("Air Quality API Error:", error));
}

function updateAirQualityUI(data) {
    if (!data.list || data.list.length === 0) return;

    const airData = data.list[0].components;

    document.getElementById("aqi").innerText = `AQI: ${data.list[0].main.aqi}`;
    document.getElementById("pm10").innerText = `PM10: ${airData.pm10} µg/m³`;
    document.getElementById("pm25").innerText = `PM2.5: ${airData.pm2_5} µg/m³`;
    document.getElementById("co").innerText = `CO: ${airData.co} ppm`;
}

// ✅ Extract and Display 5-Day Forecast
function updateForecastUI(data) {
    const dailyForecast = {}; // Store forecast summary by date

    data.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0]; // Extract date (YYYY-MM-DD)
        if (!dailyForecast[date]) {
            dailyForecast[date] = {
                temp_min: item.main.temp_min,
                temp_max: item.main.temp_max,
                condition: item.weather[0].description,
                icon: item.weather[0].icon
            };
        } else {
            dailyForecast[date].temp_min = Math.min(dailyForecast[date].temp_min, item.main.temp_min);
            dailyForecast[date].temp_max = Math.max(dailyForecast[date].temp_max, item.main.temp_max);
        }
    });

    // Convert to array and limit to 5 days
    const forecastArray = Object.entries(dailyForecast).slice(0, 5);

    let forecastHTML = `<h2>5 Day Forecast</h2>`;
    forecastArray.forEach(([date, details]) => {
        forecastHTML += `
            <div class="forecast-day">
                <p><strong>${date}</strong></p>
                <img src="https://openweathermap.org/img/wn/${details.icon}.png" alt="Weather Icon">
                <p>Condition: ${details.condition}</p>
                <p>Min: ${details.temp_min.toFixed(1)}°C | Max: ${details.temp_max.toFixed(1)}°C</p>
            </div>`;
    });

    document.getElementById("forecast").innerHTML = forecastHTML;
}

// ✅ Fetch Weather Based on User's Location
function getLiveLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getWeatherByCoordinates(lat, lon);
            },
            (error) => {
                alert("Location access denied. Showing default weather.");
                getWeather();
            }
        );
    } else {
        getWeather();
    }
}

// ✅ Fetch Weather Using Latitude & Longitude
function getWeatherByCoordinates(lat, lon) {
    const url = `${weatherApiUrl}?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            updateWeatherUI(data);
            getAirQuality(lat, lon);
            getForecast(data.name);
        })
        .catch(error => console.error("Weather API Error:", error));
}

// ✅ Fetch weather on page load
getLiveLocation();

// ✅ Search Weather on Enter Key Press
document.getElementById("cityInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        getWeather(document.getElementById("cityInput").value);
    }
});

document.getElementById("cityInput").addEventListener("onclick", function(event) {
    if (event.key === "Enter") {
        getWeather(document.getElementById("cityInput").value);
    }
});

document.addEventListener("DOMContentLoaded", function () {
    let title = "Weather App";
    let index = 0;
    let speed = 150; // Adjust speed of typing (lower = faster)

    function typeEffect() {
        if (index < title.length) {
            document.getElementById("header-title").innerHTML += title.charAt(index);
            index++;
            setTimeout(typeEffect, speed);
        }
    }

    typeEffect(); // Start the animation when the page loads
});
