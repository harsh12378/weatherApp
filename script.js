function getWeather(city = "Bengaluru") {  
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            try {  
                const response = JSON.parse(this.responseText);

                // ✅ Update UI with current weather details
                document.getElementById("city-name").innerText = `Location - ${response.location.name}`;
                document.getElementById("temperature").innerText = `Temperature: ${response.current.temp_c}°C`;
                document.getElementById("feels-like").innerText = `Feels Like: ${response.current.feelslike_c}°C`;
                document.getElementById("weather-condition").innerText = `Condition: ${response.current.condition.text}`;
                document.getElementById("humidity").innerText = `Humidity: ${response.current.humidity}%`;
                document.getElementById("wind-speed").innerText = `Wind Speed: ${response.current.wind_kph} km/h`;
                document.getElementById("visibility").innerText = `Visibility: ${response.current.vis_km} km`;
                document.getElementById("sunrise").innerText = `Sunrise: ${response.forecast.forecastday[0].astro.sunrise}`;
                document.getElementById("sunset").innerText = `Sunset: ${response.forecast.forecastday[0].astro.sunset}`;
                document.getElementById("weather-icon").src = response.current.condition.icon;

                // ✅ Get Air Quality Data (AQI, PM10, PM2.5, CO)
                if (response.current.air_quality) {
                    document.getElementById("aqi").innerText = `AQI: ${response.current.air_quality["us-epa-index"] || "N/A"}`;
                    document.getElementById("pm10").innerText = `PM10: ${response.current.air_quality["pm10"] || "N/A"} µg/m³`;
                    document.getElementById("pm25").innerText = `PM2.5: ${response.current.air_quality["pm2_5"] || "N/A"} µg/m³`;
                    document.getElementById("co").innerText = `CO: ${response.current.air_quality["co"] || "N/A"} ppm`;
                }

                // ✅ Fetch Hourly Forecast & Weekly Forecast
                updateHourlyForecast(response.forecast.forecastday[0].hour);
                updateWeeklyForecast(response.forecast.forecastday);

                // ✅ Fetch 7-day historical weather
                getHistoricalWeather(city);

            } catch (error) {
                console.error("Error parsing JSON:", error);
            }
        }
    });

    // ✅ Fetch weather with AQI enabled
    xhr.open("GET", `https://weatherapi-com.p.rapidapi.com/forecast.json?q=${city}&days=7&aqi=yes&alerts=no`);
    xhr.setRequestHeader("x-rapidapi-key", "e975bc1bdbmsh98d916ba276841cp139410jsn788f3affa88c");
    xhr.setRequestHeader("x-rapidapi-host", "weatherapi-com.p.rapidapi.com");

    xhr.send();


// ✅ Update Hourly Forecast
function updateHourlyForecast(hourlyData) {
    const hourlyContainer = document.getElementById("hourlyContainer");
    hourlyContainer.innerHTML = ""; // Clear previous data

    hourlyData.forEach(hour => {
        const hourBlock = document.createElement("div");
        hourBlock.classList.add("hour-block");
        hourBlock.innerHTML = `
            <p><strong>${hour.time.split(" ")[1]}</strong></p>
            <img src="${hour.condition.icon}" alt="weather-icon">
            <p>${hour.temp_c}°C</p>
        `;
        hourlyContainer.appendChild(hourBlock);
    });
}

// ✅ Update Weekly Forecast
function updateWeeklyForecast(weeklyData) {
    const weeklyContainer = document.getElementById("weeklyContainer");
    weeklyContainer.innerHTML = ""; // Clear previous data

    weeklyData.forEach(day => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${day.date}</td>
            <td><img src="${day.day.condition.icon}" alt="weather-icon"> ${day.day.condition.text}</td>
            <td>${day.day.avgtemp_c}°C</td>
            <td>${day.day.avghumidity}%</td>
        `;
        weeklyContainer.appendChild(row);
    });
}


xhr.open("GET", `https://weatherapi-com.p.rapidapi.com/history.json?q=${city}&dt=${dateStr}`);
xhr.setRequestHeader("x-rapidapi-key", "e975bc1bdbmsh98d916ba276841cp139410jsn788f3affa88c");
xhr.setRequestHeader("x-rapidapi-host", "weatherapi-com.p.rapidapi.com");
xhr.send();


function getHistoricalWeather(city) {
    const today = new Date();
    let historyHTML = "<h3>Past 7 Days Weather</h3>";
    let completedRequests = 0; // Track the number of completed requests

    for (let i = 1; i <= 7; i++) {
        const pastDate = new Date();
        pastDate.setDate(today.getDate() - i);
        const dateStr = pastDate.toISOString().split("T")[0]; // Format: YYYY-MM-DD
        
        const xhr = new XMLHttpRequest();
        const apiKey = "YOUR_API_KEY"; // Replace with your actual API key
        const url = `https://api.weatherapi.com/v1/history.json?key=${apiKey}&q=${city}&dt=${dateStr}`;
        
        xhr.open("GET", url, true);
        xhr.withCredentials = true;

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) { // DONE
                completedRequests++;
                if (xhr.status === 200) {
                    try {
                        const response = JSON.parse(xhr.responseText);

                        if (response.forecast && response.forecast.forecastday.length > 0) {
                            const data = response.forecast.forecastday[0];
                            historyHTML += `
                                <p><strong>${data.date}:</strong> ${data.day.avgtemp_c}°C, ${data.day.condition.text}</p>
                            `;
                        }
                    } catch (error) {
                        console.error(`Error parsing historical data for ${dateStr}:`, error);
                    }
                } else {
                    console.error(`Request failed for ${dateStr} with status: ${xhr.status}`);
                }

                // Only update UI after all requests are completed
                if (completedRequests === 7) {
                    document.getElementById("history-data").innerHTML = historyHTML;
                }
            }
        };

        xhr.send();
    }
}


// ✅ Get User's Live Location and Fetch Weather
function getLiveLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                console.log(`User Location: ${lat}, ${lon}`);

                // Fetch weather using latitude & longitude
                getWeather(`${lat},${lon}`);
            },
            (error) => {
                console.error("Geolocation Error:", error);
                alert("Location access denied. Showing default weather.");
                getWeather();  // Fetch weather for default city
            }
        );
    } else {
        alert("Geolocation is not supported by your browser.");
        getWeather(); // Fetch weather for default city
    }
}

// ✅ Call the function on page load
getLiveLocation();
document.getElementById("cityInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {  // Check if "Enter" key is pressed
        getWeather(document.getElementById("cityInput").value);
    }
});

}