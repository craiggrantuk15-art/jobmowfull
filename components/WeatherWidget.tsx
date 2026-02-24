import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cloud, Sun, CloudRain, CloudLightning, Droplets } from 'lucide-react';
import { getLocalWeather, WeatherData } from '../services/weatherService';

import { useJobs } from '../context/JobContext';

const WeatherWidget: React.FC = () => {
    const { settings } = useJobs();
    const [forecast, setForecast] = useState<WeatherData[] | null>(null);

    useEffect(() => {
        const fetchWeather = async () => {
            const data = await getLocalWeather(settings);
            setForecast(data);
        };
        fetchWeather();
    }, [settings.weatherApiKey, settings.weatherCity, settings.temperatureUnit]);

    if (!forecast || forecast.length === 0) {
        return (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-full flex flex-col items-center justify-center text-center space-y-3">
                <div className="p-3 bg-slate-100 rounded-full text-slate-400">
                    <Cloud size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800">Weather Unavailable</h3>
                    <p className="text-xs text-slate-500 max-w-[180px]">Check your API key and City Name in Settings to see live forecasts.</p>
                </div>
                <Link to="/admin/settings" className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors">
                    Setup Weather
                </Link>
            </div>
        );
    }

    const today = forecast[0];
    const mowScore = today.mowabilityScore;

    const getIcon = (condition: string, size: number = 24) => {
        switch (condition) {
            case 'Sunny': return <Sun size={size} className="text-amber-300" />;
            case 'Cloudy': return <Cloud size={size} className="text-slate-300" />;
            case 'Rain': return <CloudRain size={size} className="text-blue-300" />;
            case 'Storm': return <CloudLightning size={size} className="text-purple-300" />;
            default: return <Sun size={size} className="text-amber-300" />;
        }
    }

    return (
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group transition-all hover:shadow-blue-200 hover:scale-[1.01]">
            {/* Background Pattern */}
            <div className="absolute -top-4 -right-4 opacity-10 rotate-12 transition-transform group-hover:rotate-0 duration-700">
                {getIcon(today.condition, 120)}
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            {getIcon(today.condition, 20)} MowCast
                        </h3>
                        <p className="text-blue-100 text-xs opacity-80">Local Forecast</p>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold tracking-tight">{today.temp}°{settings.temperatureUnit || 'C'}</p>
                        <p className="text-xs font-medium text-blue-100">{today.condition}</p>
                    </div>
                </div>

                {/* Mowability Score */}
                <div className="bg-white/10 rounded-lg p-3 mb-4 backdrop-blur-md border border-white/10">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-blue-50">Mowability</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-blue-200 flex items-center gap-1">
                                <span className="opacity-70">Wind:</span> {today.windSpeed}km/h
                            </span>
                            <span className={`text-xs font-bold ${mowScore > 70 ? 'text-emerald-300' : mowScore > 40 ? 'text-amber-300' : 'text-red-300'}`}>
                                {mowScore}/100
                            </span>
                        </div>
                    </div>
                    <div className="w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${mowScore > 70 ? 'bg-emerald-400' : mowScore > 40 ? 'bg-amber-400' : 'bg-red-400'}`}
                            style={{ width: `${mowScore}%` }}
                        ></div>
                    </div>
                    <p className="text-[10px] mt-2 text-blue-100/90 leading-tight">
                        {mowScore > 80 ? "Conditions are perfect! 🚜" :
                            mowScore > 50 ? "Conditions are okay. Proceed with care." :
                                mowScore > 30 ? "Poor conditions. Expect delays." :
                                    "Mowing not recommended. 🌧️"}
                    </p>
                </div>

                {/* Mini Forecast */}
                <div className="flex justify-between gap-2 text-center">
                    {forecast.slice(1, 4).map((day, i) => (
                        <div key={i} className="bg-black/10 rounded p-1.5 flex-1 backdrop-blur-sm hover:bg-white/10 transition-colors">
                            <p className="text-[10px] text-blue-100 mb-1 uppercase tracking-wider">
                                {new Date(day.date).toLocaleDateString('en-GB', { weekday: 'short' })}
                            </p>
                            <div className="flex justify-center mb-1">
                                {getIcon(day.condition, 16)}
                            </div>
                            <p className="text-xs font-medium">{day.temp}°{settings.temperatureUnit || 'C'}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WeatherWidget;