import SearchSection from "./components/SearchSection";
import CurrentWeather from "./components/CurrentWeather";
import HourlyWeatherItem from "./components/HourlyWeatherItem";
import { weatherCodes } from "./constants";
import { useEffect, useRef, useState } from "react";
import NoResultsDiv from "./components/NoResultsDiv";
const App = () => {
  const [currentWeather, setCurrentWeather] = useState({});
  const [hourlyForecasts, setHourlyForecasts] = useState([]);
  const [hasNoResults, setHasNoResults] = useState(false);
  const searchInputRef = useRef(null);
  const API_KEY = import.meta.env.VITE_API_KEY;
  const filterHourlyForecast = (hourlyData) => {
    const currentHour = new Date().setMinutes(0, 0, 0);
    const next24Hours = currentHour + 24 * 60 * 60 * 1000;
   
    const next24HoursData = hourlyData.filter(({ time }) => {
      const forecastTime = new Date(time).getTime();
      return forecastTime >= currentHour && forecastTime <= next24Hours;
    });
    setHourlyForecasts(next24HoursData);
  };

  const getWeatherDetails = async (API_URL) => {
    setHasNoResults(false);
    window.innerWidth <= 768 && searchInputRef.current.blur();
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error();
      const data = await response.json();
    
      const temperature = Math.floor(data.current.temp_c);
      const description = data.current.condition.text;
      const weatherIcon = Object.keys(weatherCodes).find((icon) => weatherCodes[icon].includes(data.current.condition.code));
      setCurrentWeather({ temperature, description, weatherIcon });
  
      const combinedHourlyData = [...data.forecast.forecastday[0].hour, ...data.forecast.forecastday[1].hour];
      searchInputRef.current.value = data.location.name;
      filterHourlyForecast(combinedHourlyData);
    } catch {
    
      setHasNoResults(true);
    }
  };

  useEffect(() => {
    const defaultCity = "Patna";
    const API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${defaultCity}&days=2`;
    getWeatherDetails(API_URL);
  }, []);
  return (
    <div className="container">
   
      <SearchSection getWeatherDetails={getWeatherDetails} searchInputRef={searchInputRef} />
     
      {hasNoResults ? (
        <NoResultsDiv />
      ) : (
        <div className="weather-section">
         
          <CurrentWeather currentWeather={currentWeather} />
        
          <div className="hourly-forecast">
            <ul className="weather-list">
              {hourlyForecasts.map((hourlyWeather) => (
                <HourlyWeatherItem key={hourlyWeather.time_epoch} hourlyWeather={hourlyWeather} />
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
export default App;