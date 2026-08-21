// ==========================================
// WEATHERAPI.COM
// ==========================================

// IMPORTANT:
// Generate a NEW key if your previous key was exposed.
// Never upload the real key to GitHub.

const API_KEY = "API";

const BASE_URL =
    "https://api.weatherapi.com/v1";


// ==========================================
// DOM ELEMENTS
// ==========================================

const cityInput =
    document.getElementById("cityInput");

const searchBtn =
    document.getElementById("searchBtn");

const locationBtn =
    document.getElementById("locationBtn");

const weatherContent =
    document.getElementById("weatherContent");

const loading =
    document.getElementById("loading");

const errorBox =
    document.getElementById("error");

const themeBtn =
    document.getElementById("themeBtn");


// ==========================================
// SEARCH
// ==========================================

searchBtn.addEventListener(
    "click",
    () => {

        const city =
            cityInput.value.trim();

        if (!city) {

            showError(
                "Please enter a city name."
            );

            return;
        }

        fetchWeather(city);

    }
);


// ==========================================
// ENTER KEY
// ==========================================

cityInput.addEventListener(
    "keypress",
    event => {

        if (event.key === "Enter") {

            searchBtn.click();

        }

    }
);


// ==========================================
// GPS LOCATION
// ==========================================

locationBtn.addEventListener(
    "click",
    () => {

        if (!navigator.geolocation) {

            showError(
                "Geolocation is not supported."
            );

            return;
        }


        navigator.geolocation.getCurrentPosition(

            position => {

                const lat =
                    position.coords.latitude;

                const lon =
                    position.coords.longitude;

                fetchWeather(
                    `${lat},${lon}`
                );

            },

            () => {

                showError(
                    "Unable to access your location."
                );

            }

        );

    }
);


// ==========================================
// FETCH WEATHER
// ==========================================

async function fetchWeather(query) {

    showLoading();

    try {

        const url =
            `${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(query)}&days=5&aqi=yes&alerts=yes`;


        const response =
            await fetch(url);


        const data =
            await response.json();


        if (!response.ok) {

            if (response.status === 401) {

                throw new Error(
                    "Invalid WeatherAPI key. Generate a new API key."
                );

            }


            if (response.status === 400) {

                throw new Error(
                    data.error?.message ||
                    "Invalid city or location."
                );

            }


            throw new Error(
                data.error?.message ||
                "Unable to fetch weather."
            );

        }


        displayWeather(data);

        displayForecast(data);


    }
    catch (error) {

        console.error(
            "Weather API Error:",
            error
        );

        showError(
            error.message
        );

    }
    finally {

        hideLoading();

    }

}


// ==========================================
// DISPLAY CURRENT WEATHER
// ==========================================

function displayWeather(data) {

    weatherContent.classList.remove(
        "hidden"
    );

    errorBox.classList.add(
        "hidden"
    );


    const location =
        data.location;

    const current =
        data.current;


    // CITY
    document.getElementById(
        "cityName"
    ).textContent =
        `${location.name}, ${location.country}`;


    // DATE
    document.getElementById(
        "date"
    ).textContent =
        new Date().toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );


    // LOCAL TIME
    document.getElementById(
        "localTime"
    ).textContent =
        `🕐 Local time: ${location.localtime}`;


    // TEMPERATURE
    document.getElementById(
        "temperature"
    ).textContent =
        Math.round(current.temp_c);


    // FEELS LIKE
    document.getElementById(
        "feelsLike"
    ).textContent =
        Math.round(current.feelslike_c);


    // DESCRIPTION
    document.getElementById(
        "description"
    ).textContent =
        current.condition.text;


    // ICON
    let icon =
        current.condition.icon;


    if (icon.startsWith("//")) {

        icon =
            "https:" + icon;

    }


    document.getElementById(
        "weatherIcon"
    ).src = icon;


    // HUMIDITY
    document.getElementById(
        "humidity"
    ).textContent =
        `${current.humidity}%`;


    // WIND
    document.getElementById(
        "wind"
    ).textContent =
        `${current.wind_kph} km/h`;


    // PRESSURE
    document.getElementById(
        "pressure"
    ).textContent =
        `${current.pressure_mb} hPa`;


    // VISIBILITY
    document.getElementById(
        "visibility"
    ).textContent =
        `${current.vis_km} km`;


    // SUNRISE / SUNSET
    const today =
        data.forecast.forecastday[0];


    document.getElementById(
        "sunrise"
    ).textContent =
        today.astro.sunrise;


    document.getElementById(
        "sunset"
    ).textContent =
        today.astro.sunset;


    // RAIN CHANCE
    document.getElementById(
        "rainChance"
    ).textContent =
        `${today.day.daily_chance_of_rain}%`;


    // UV
    document.getElementById(
        "uv"
    ).textContent =
        current.uv;

}


// ==========================================
// 5 DAY FORECAST
// ==========================================

function displayForecast(data) {

    const container =
        document.getElementById(
            "forecast"
        );


    container.innerHTML = "";


    data.forecast.forecastday
        .slice(0, 5)
        .forEach(day => {


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "forecast-card";


            let icon =
                day.day.condition.icon;


            if (icon.startsWith("//")) {

                icon =
                    "https:" + icon;

            }


            card.innerHTML = `

                <h3>
                    ${formatDate(day.date)}
                </h3>

                <img
                    src="${icon}"
                    alt="${day.day.condition.text}"
                >

                <p>
                    ${day.day.condition.text}
                </p>

                <strong>
                    ${Math.round(
                        day.day.maxtemp_c
                    )}°C
                </strong>

                <p>
                    Low:
                    ${Math.round(
                        day.day.mintemp_c
                    )}°C
                </p>

                <p>
                    💧
                    ${day.day.avghumidity}%
                </p>

                <p>
                    🌧️
                    ${day.day.daily_chance_of_rain}%
                </p>

            `;


            container.appendChild(
                card
            );

        });

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(dateString) {

    return new Date(
        dateString
    ).toLocaleDateString(
        "en-IN",
        {
            weekday: "short",
            day: "numeric",
            month: "short"
        }
    );

}


// ==========================================
// LOADING
// ==========================================

function showLoading() {

    loading.classList.remove(
        "hidden"
    );

    weatherContent.classList.add(
        "hidden"
    );

    errorBox.classList.add(
        "hidden"
    );

}


function hideLoading() {

    loading.classList.add(
        "hidden"
    );

}


// ==========================================
// ERROR
// ==========================================

function showError(message) {

    loading.classList.add(
        "hidden"
    );

    weatherContent.classList.add(
        "hidden"
    );


    errorBox.textContent =
        `❌ ${message}`;


    errorBox.classList.remove(
        "hidden"
    );

}


// ==========================================
// DARK / LIGHT MODE
// ==========================================

themeBtn.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark"
        );


        const dark =
            document.body.classList.contains(
                "dark"
            );


        themeBtn.textContent =
            dark ? "☀️" : "🌙";


        localStorage.setItem(
            "weatherTheme",
            dark ? "dark" : "light"
        );

    }
);


// ==========================================
// LOAD THEME
// ==========================================

if (
    localStorage.getItem(
        "weatherTheme"
    ) === "dark"
) {

    document.body.classList.add(
        "dark"
    );

    themeBtn.textContent =
        "☀️";

}
