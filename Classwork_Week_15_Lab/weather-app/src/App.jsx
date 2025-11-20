import { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Menu,
  Droplets,
  Sun,
  Sunrise,
  Sunset,
  Wind,
  Eye,
  Gauge,
  Thermometer,
  CloudRain,
  Moon,
  Bell,
  Settings,
  User,
  LayoutDashboard,
  History,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { format } from "date-fns";

function App() {
  const [city, setCity] = useState("Jakarta");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [days, setDays] = useState(3);
  const [history, setHistory] = useState([]);
  const [view, setView] = useState("landing");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [darkMode, setDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const API_KEY = "74b549feb0d5483c9e863902252011";

  const fetchWeather = async (queryCity, queryDays) => {
    setLoading(true);
    try {
      const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(
        queryCity
      )}&days=${queryDays}&aqi=yes&alerts=no`;
      const response = await axios.get(url);
      setWeather(response.data);
      setHistory((prev) => {
        const newHistory = [
          {
            city: queryCity,
            date: new Date().toLocaleString(),
            data: response.data,
          },
          ...prev,
        ];
        return newHistory.slice(0, 10); // Keep last 10
      });
      setView("dashboard");
    } catch (error) {
      alert("City not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (days < 1 || days > 14) {
      alert("Please enter a number of days between 1 and 14.");
      return;
    }
    if (searchQuery) {
      setCity(searchQuery);
      fetchWeather(searchQuery, days);
      setSearchQuery("");
    }
  };

  const handleLandingSearch = (e) => {
    e.preventDefault();
    if (days < 1 || days > 14) {
      alert("Please enter a number of days between 1 and 14.");
      return;
    }
    if (city) {
      fetchWeather(city, days);
    }
  };

  const handleHistoryClick = (item) => {
    setWeather(item.data);
    setCity(item.city);
    setView("dashboard");
  };

  if (view === "landing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4 font-sans">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-md space-y-8 transition-colors duration-300">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
              Weather App
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Check the forecast for your city
            </p>
          </div>

          <form onSubmit={handleLandingSearch} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                City Name
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Enter city (e.g. Jakarta)"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Forecast Days
                </label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Check Weather"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!weather || !weather.forecast || !weather.forecast.forecastday)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
        Loading...
      </div>
    );

  const current = weather.current;
  const location = weather.location;
  const forecastDay = weather.forecast.forecastday[0];

  const chartData = forecastDay.hour
    .filter((_, index) => index % 3 === 0)
    .map((hour) => ({
      time: format(new Date(hour.time), "h a").toLowerCase(),
      temp: Math.round(hour.temp_c),
      icon: hour.condition.icon,
    }));

  const CustomXAxisTick = ({ x, y, payload }) => {
    const data = chartData[payload.index];
    return (
      <g transform={`translate(${x},${y})`}>
        <image x={-12} y={0} width={24} height={24} href={data?.icon} />
        <text
          x={0}
          y={35}
          textAnchor="middle"
          className="text-xs fill-gray-500 dark:fill-gray-400"
          style={{ fontSize: "12px" }}
        >
          {data?.time}
        </text>
      </g>
    );
  };

  const getAqiLabel = (index) => {
    if (index <= 3) return "Good";
    if (index <= 6) return "Moderate";
    return "Unhealthy";
  };

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 font-sans text-gray-800 dark:text-white transition-colors duration-300 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}
      >
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            Nimbus
          </h1>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button
            onClick={() => setView("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              view === "dashboard"
                ? "bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </button>
          <button
            onClick={() => setView("history")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              view === "history"
                ? "bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <History className="w-5 h-5" />
            <span className="font-medium">History</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              U
            </div>
            <div>
              <p className="text-sm font-bold">User Name</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                user@example.com
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center shadow-sm gap-4 transition-colors">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                <span className="hidden md:inline">
                  📍 {location.name}, {location.country}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-end">
              <button
                onClick={() => setView("landing")}
                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-4 py-2 rounded-full text-sm text-gray-600 dark:text-gray-300 transition-colors w-full md:w-auto justify-center"
              >
                <Search className="w-4 h-4" />
                <span>Search Location</span>
              </button>

              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full transition-colors"
                >
                  {darkMode ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                  <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>
          </header>

          {view === "history" ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Search History
              </h2>
              {history.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl text-center text-gray-500 dark:text-gray-400">
                  No history available yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {history.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => handleHistoryClick(item)}
                      className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-blue-500 group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-blue-500 transition-colors">
                            {item.city}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {item.date}
                          </p>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-gray-700 rounded-full text-blue-500 dark:text-blue-400">
                          <History className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <img
                          src={item.data.current.condition.icon}
                          alt="weather icon"
                          className="w-12 h-12"
                        />
                        <div>
                          <p className="text-2xl font-bold text-gray-800 dark:text-white">
                            {Math.round(item.data.current.temp_c)}°
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {item.data.current.condition.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Dashboard Grid */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column (Main Info) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Current Weather Card */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm relative overflow-hidden transition-colors">
                  <div className="relative z-10 flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 mb-1">
                        Current Weather
                      </p>
                      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                        {format(new Date(location.localtime), "h:mm a")}
                      </h2>
                      <div className="flex items-center gap-4 mt-6">
                        <img
                          src={current.condition.icon}
                          alt={current.condition.text}
                          className="w-16 h-16"
                        />
                        <span className="text-6xl font-bold text-gray-800 dark:text-white">
                          {Math.round(current.temp_c)}°
                        </span>
                        <div className="text-gray-500 dark:text-gray-400">
                          <p className="text-lg font-medium">
                            {current.condition.text}
                          </p>
                          <p>Feels Like {Math.round(current.feelslike_c)}°</p>
                        </div>
                      </div>
                      <p className="mt-6 text-gray-600 dark:text-gray-300">
                        There will be {current.condition.text.toLowerCase()}{" "}
                        skies. The high will be{" "}
                        {Math.round(forecastDay.day.maxtemp_c)}°.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hourly Forecast Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm transition-colors">
                  <h3 className="text-gray-500 dark:text-gray-400 font-medium mb-4">
                    Temperature Trend
                  </h3>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={chartData}
                        margin={{ top: 20, right: 10, left: 10, bottom: 30 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorTemp"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#6366f1"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#6366f1"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="time"
                          axisLine={false}
                          tickLine={false}
                          tick={<CustomXAxisTick />}
                          interval={0}
                        />
                        <Area
                          type="monotone"
                          dataKey="temp"
                          stroke="#6366f1"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorTemp)"
                        >
                          <LabelList
                            dataKey="temp"
                            position="top"
                            offset={10}
                            fill={darkMode ? "#E5E7EB" : "#374151"}
                            fontSize={12}
                            formatter={(value) => `${value}°`}
                          />
                        </Area>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Air Quality */}
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex flex-col justify-between h-32 transition-colors">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                      <Wind className="w-5 h-5" />
                      <span className="text-sm font-medium">Air Quality</span>
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-gray-800 dark:text-white">
                        {current.air_quality?.["us-epa-index"] || "N/A"}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                        {getAqiLabel(
                          current.air_quality?.["us-epa-index"] || 1
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Wind */}
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex flex-col justify-between h-32 transition-colors">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                      <Wind className="w-5 h-5" />
                      <span className="text-sm font-medium">Wind</span>
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-gray-800 dark:text-white">
                        {current.wind_kph}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                        km/h
                      </span>
                    </div>
                  </div>

                  {/* Humidity */}
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex flex-col justify-between h-32 transition-colors">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                      <Droplets className="w-5 h-5" />
                      <span className="text-sm font-medium">Humidity</span>
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-gray-800 dark:text-white">
                        {current.humidity}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Visibility */}
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex flex-col justify-between h-32 transition-colors">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                      <Eye className="w-5 h-5" />
                      <span className="text-sm font-medium">Visibility</span>
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-gray-800 dark:text-white">
                        {current.vis_km}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                        km
                      </span>
                    </div>
                  </div>

                  {/* Pressure */}
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex flex-col justify-between h-32 transition-colors">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                      <Gauge className="w-5 h-5" />
                      <span className="text-sm font-medium">Pressure</span>
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-gray-800 dark:text-white">
                        {current.pressure_mb}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                        hPa
                      </span>
                    </div>
                  </div>

                  {/* Dew Point */}
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex flex-col justify-between h-32 transition-colors">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                      <Thermometer className="w-5 h-5" />
                      <span className="text-sm font-medium">Dew Point</span>
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-gray-800 dark:text-white">
                        {Math.round(current.dewpoint_c)}°
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sun & Moon Summary */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm transition-colors">
                  <h3 className="text-gray-500 dark:text-gray-400 font-medium mb-6">
                    Sun & Moon Summary
                  </h3>
                  <div className="flex justify-between items-center px-4">
                    <div className="flex items-center gap-4">
                      <Sun className="w-10 h-10 text-yellow-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Sunrise
                        </p>
                        <p className="font-bold text-gray-800 dark:text-white">
                          {forecastDay.astro.sunrise}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Moon className="w-10 h-10 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Sunset
                        </p>
                        <p className="font-bold text-gray-800 dark:text-white">
                          {forecastDay.astro.sunset}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (Forecast) */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm h-full transition-colors">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800 dark:text-white text-lg">
                    Forecast
                  </h3>
                  <button className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-1 rounded-full">
                    {days} Days
                  </button>
                </div>

                <div className="space-y-4">
                  {weather.forecast.forecastday.map((day, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-2xl transition-colors"
                    >
                      <img
                        src={day.day.condition.icon}
                        alt="icon"
                        className="w-10 h-10"
                      />

                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 dark:text-white text-sm truncate">
                          {index === 0
                            ? "Today"
                            : index === 1
                            ? "Tomorrow"
                            : format(new Date(day.date), "EEE")}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {day.day.condition.text}
                        </p>
                      </div>

                      <div className="text-right whitespace-nowrap">
                        <span className="font-bold text-gray-800 dark:text-white">
                          {Math.round(day.day.maxtemp_c)}°
                        </span>
                        <span className="text-gray-400 text-sm ml-1">
                          / {Math.round(day.day.mintemp_c)}°
                        </span>
                      </div>

                      <div className="flex flex-col items-end text-xs text-gray-500 dark:text-gray-400 space-y-1">
                        <div className="flex items-center gap-1">
                          <Wind className="w-3 h-3" />
                          <span>{Math.round(day.day.maxwind_kph)} km/h</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Droplets className="w-3 h-3" />
                          <span>{day.day.avghumidity}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
