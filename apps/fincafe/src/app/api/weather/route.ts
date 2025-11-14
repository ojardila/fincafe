import { NextRequest, NextResponse } from 'next/server';

// Weather API endpoint - uses OpenWeatherMap free tier
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const location = searchParams.get('location'); // municipality, department format

    if (!lat && !lon && !location) {
      return NextResponse.json(
        { error: 'Either coordinates (lat, lon) or location is required' },
        { status: 400 }
      );
    }

    // OpenWeatherMap API key - should be in environment variables
    const apiKey = process.env.OPENWEATHER_API_KEY || 'demo';

    let weatherUrl: string;

    if (lat && lon) {
      // Use coordinates
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    } else if (location) {
      // Use location name (municipality, department, CO)
      const query = `${location},CO`; // CO for Colombia
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&units=metric&appid=${apiKey}`;
    } else {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    const response = await fetch(weatherUrl);

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Location not found' },
          { status: 404 }
        );
      }
      throw new Error('Weather API request failed');
    }

    const data = await response.json();

    // Transform the data to a simpler format
    const weatherData = {
      location: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      windSpeed: data.wind.speed,
      pressure: data.main.pressure,
      clouds: data.clouds.all,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      coordinates: {
        lat: data.coord.lat,
        lon: data.coord.lon,
      },
    };

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}
