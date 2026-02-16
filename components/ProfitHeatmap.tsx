import React from 'react';
import { useJobs } from '../context/JobContext';
import { MapPin, TrendingUp, AlertCircle } from 'lucide-react';
import { JobStatus, Job } from '../types';

interface ZoneStats {
  name: string;
  totalRevenue: number;
  totalHours: number;
  revenuePerHour: number;
  jobCount: number;
}

interface ZoneStatsMap {
  [key: string]: ZoneStats;
}

const ProfitHeatmap: React.FC = () => {
  const { jobs, settings } = useJobs();

  const validJobs = jobs.filter(j => 
    j.status === JobStatus.SCHEDULED || 
    j.status === JobStatus.COMPLETED
  );

  const initialStats: ZoneStatsMap = {};
  
  const zoneStatsMap = validJobs.reduce((acc: ZoneStatsMap, job: Job) => {
    // Grouping strategy: Use the assigned zone first, otherwise parse from address
    let zoneName = 'Unknown';
    if (job.zone) {
        zoneName = job.zone;
    } else if (job.address.includes(',')) {
        zoneName = job.address.split(',')[1].trim();
    }
    
    if (!acc[zoneName]) {
      acc[zoneName] = {
        name: zoneName,
        totalRevenue: 0,
        totalHours: 0,
        revenuePerHour: 0,
        jobCount: 0
      };
    }

    acc[zoneName].totalRevenue += job.priceQuote;
    acc[zoneName].totalHours += (job.durationMinutes / 60);
    acc[zoneName].jobCount += 1;

    return acc;
  }, initialStats);

  const zoneList: ZoneStats[] = Object.values(zoneStatsMap);
  const zones = zoneList.map((zone) => {
    return {
      ...zone,
      revenuePerHour: zone.totalHours > 0 ? zone.totalRevenue / zone.totalHours : 0
    };
  }).sort((a, b) => b.revenuePerHour - a.revenuePerHour);

  if (zones.length === 0) {
      return (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col justify-center items-center text-center text-slate-400">
              <MapPin size={32} className="mb-2 opacity-50" />
              <p>No job data available for heatmap.</p>
          </div>
      );
  }

  const maxRPH = Math.max(...zones.map(z => z.revenuePerHour)) || 1;

  const getHeatColor = (rph: number) => {
      const high = settings.efficiencyThresholdHigh;
      const low = settings.efficiencyThresholdLow;
      if (rph >= high) return 'bg-emerald-500';
      if (rph >= low) return 'bg-blue-500';
      return 'bg-red-500';
  };

  const getHeatText = (rph: number) => {
      const high = settings.efficiencyThresholdHigh;
      const low = settings.efficiencyThresholdLow;
      if (rph >= high) return 'text-emerald-600';
      if (rph >= low) return 'text-blue-600';
      return 'text-red-600';
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <MapPin size={20} className="text-rose-500" />
                Profit Heatmap
            </h3>
            <p className="text-sm text-slate-500">Revenue per Hour by Neighborhood</p>
        </div>
        <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
            <TrendingUp size={20} />
        </div>
      </div>

      <div className="space-y-5">
        {zones.map((zone) => (
          <div key={zone.name} className="group">
            <div className="flex justify-between items-end mb-1">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{zone.name}</span>
                    <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {zone.jobCount} jobs
                    </span>
                </div>
                <div className={`font-bold text-sm ${getHeatText(zone.revenuePerHour)}`}>
                    {settings.currency}{zone.revenuePerHour.toFixed(0)}<span className="text-xs text-slate-400 font-normal">/hr</span>
                </div>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ${getHeatColor(zone.revenuePerHour)}`} 
                    style={{ width: `${(zone.revenuePerHour / maxRPH) * 100}%` }}
                ></div>
            </div>
            <div className="flex justify-between mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-slate-400">Avg Job: {settings.currency}{(zone.totalRevenue / zone.jobCount).toFixed(0)}</span>
                {zone.revenuePerHour < settings.efficiencyThresholdLow && (
                    <span className="text-[10px] text-red-500 flex items-center gap-1">
                        <AlertCircle size={10} /> Low Efficiency
                    </span>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfitHeatmap;