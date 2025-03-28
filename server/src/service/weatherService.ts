import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

// TODO: Define an interface for the Coordinates object
class Coordinates {
  lat: any;
  lon: any;
  constructor(lat: any, lon: any) {
    this.lat = lat;
    this.lon = lon;
  }
}

// TODO: Define a class for the Weather object
class Weather {
  temp: any;
  wind: any;
  humidity: any;
  date: string;
  icon: any;
  constructor(temp: any, wind: any, humidity: any, date: string, icon: any) {
    this.temp = temp;
    this.wind = wind;
    this.humidity = humidity;
    this.date = date;
    this.icon = icon;
    
  }
}

// TODO: Complete the WeatherService class
class WeatherService {
  baseURL: string;
  apiKey: string | undefined;
  constructor() {
    // TODO: Define the baseURL, API key, and city name properties
    this.baseURL = process.env.API_BASE_URL as string;
    this.apiKey = process.env.API_KEY as string;
  }

  // TODO: Create fetchLocationData method
  async fetchLocationData(query: any) {
    try {
      const response = await axios.get(`${this.baseURL}/geo/1.0/direct`, {
        params: {
          q: query,
          limit: 1,
          appid: this.apiKey,
        },
      });
      return response.data[0]; 
    } catch (error) {
      throw new Error('Failed to fetch location data.');
    }
  }

  // TODO: Create destructureLocationData method
  destructureLocationData(locationData: { lat: any; lon: any; }) {
    return new Coordinates(locationData.lat, locationData.lon);
  }

  // TODO: Create buildGeocodeQuery method
  buildGeocodeQuery(city: string) {
    return `${this.baseURL}/geo/1.0/direct?q=${city}&limit=1&appid=${this.apiKey}`;
  }

  // TODO: Create buildWeatherQuery method
  buildWeatherQuery(coordinates: { lat: any; lon: any; }) {
    //......
    return `${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}`;
  }

  // TODO: Create fetchAndDestructureLocationData method
  async fetchAndDestructureLocationData(city: string) {
    const locationData = await this.fetchLocationData(city);
    return this.destructureLocationData(locationData);
  }

  // TODO: Create fetchWeatherData method
  async fetchWeatherData(coordinates: Coordinates) {
    try {
      const response = await axios.get(this.buildWeatherQuery(coordinates));
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch weather data.');
    }
  }

  // TODO: Build parseCurrentWeather method
  parseCurrentWeather(response: { list: any[]; city?: { name?: string }}) {
    if (!response.list || response.list.length === 0) {
      throw new Error("Weather data is unavailable");
    }
    const currentWeather = response.list[0];
    return new Weather(
      currentWeather.main.temp,
      currentWeather.wind.speed,
      currentWeather.main.humidity,
      new Date(currentWeather.dt * 1000).toLocaleDateString(),
      currentWeather.weather[0].icon
    );
  }


  buildForecastArray(currentWeather: Weather, weatherData: any) {
    const updatedCurrentWeather = new Weather(
        currentWeather.temp,
        currentWeather.wind,
        currentWeather.humidity,
        currentWeather.date,
        currentWeather.icon
    );

    (updatedCurrentWeather as any).name = weatherData.city.name;
    console.log("New payload",updatedCurrentWeather);
    return updatedCurrentWeather; 
}

  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
    const coordinates = await this.fetchAndDestructureLocationData(city);
    const weatherData = await this.fetchWeatherData(coordinates);
    console.log("weatherData:: ", weatherData)
    const currentWeather = this.parseCurrentWeather(weatherData);
    
    return this.buildForecastArray(currentWeather, weatherData);
  }
}

export default new WeatherService();