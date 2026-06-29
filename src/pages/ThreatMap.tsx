import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../../lib/supabase';
import { AlertCircle, MapPin, Loader2, RefreshCw } from 'lucide-react';
import { Incident } from '../../types/database';

export default function ThreatMap() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMapData = async () => {
    setLoading(true);
    try {
      // Only fetch incidents that have location data
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIncidents(data || []);
    } catch (error) {
      console.error('Error fetching map data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ff0040'; // neon-red
      case 'high': return '#f97316'; // orange-500
      case 'medium': return '#fbbf24'; // amber-400
      case 'low': return '#00ff88'; // matrix-400
      default: return '#38bdf8'; // cyber-400
    }
  };

  return (
    <div className="flex-1 bg-dark-950 p-6 lg:p-8 relative min-h-screen pt-24">
      <div className="scanline-overlay z-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white tracking-wider flex items-center">
              <MapPin className="w-8 h-8 mr-3 text-neon-red" />
              LIVE THREAT MAP
            </h1>
            <p className="text-slate-400 font-mono mt-2 flex items-center">
              <span className="w-2 h-2 bg-neon-red rounded-full animate-pulse mr-2"></span>
              Tracking {incidents.length} active geo-located threat clusters across the region
            </p>
          </div>
          <button 
            onClick={fetchMapData}
            className="cyber-btn flex items-center"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            REFRESH SCAN
          </button>
        </div>

        <div className="cyber-frame bg-slate-900/50 p-1 relative overflow-hidden h-[65vh]">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-950/80 z-[400] backdrop-blur-sm">
              <Loader2 className="w-12 h-12 text-cyber-400 animate-spin mb-4" />
              <p className="text-cyber-400 font-mono tracking-widest animate-pulse">ESTABLISHING SATELLITE LINK...</p>
            </div>
          ) : null}

          {/* India Center Coordinates: 20.5937, 78.9629 */}
          <MapContainer 
            center={[20.5937, 78.9629]} 
            zoom={5} 
            scrollWheelZoom={true}
            className="w-full h-full z-0 bg-dark-900"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {incidents.map((incident) => (
              <CircleMarker
                key={incident.id}
                center={[incident.latitude!, incident.longitude!]}
                pathOptions={{ 
                  color: getSeverityColor(incident.severity),
                  fillColor: getSeverityColor(incident.severity),
                  fillOpacity: 0.6,
                  weight: 2
                }}
                radius={incident.severity === 'critical' ? 12 : incident.severity === 'high' ? 9 : 6}
              >
                <Popup className="cyber-popup">
                  <div className="p-1 min-w-[200px]">
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: getSeverityColor(incident.severity) }}>
                      {incident.severity} SEVERITY
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2 truncate">{incident.title}</h3>
                    <div className="text-xs text-slate-600 mb-2 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {incident.incident_type.replace('_', ' ').toUpperCase()}
                    </div>
                    {incident.ai_risk_score && (
                      <div className="text-xs bg-slate-100 rounded px-2 py-1 inline-block font-mono">
                        AI Risk Score: {incident.ai_risk_score}%
                      </div>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
          
          <div className="absolute bottom-4 left-4 z-[400] bg-dark-950/80 border border-cyber-500/30 p-4 rounded backdrop-blur-md">
            <h4 className="text-white font-mono text-sm mb-3">THREAT SEVERITY</h4>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center text-slate-300">
                <span className="w-3 h-3 rounded-full bg-[#ff0040] shadow-[0_0_5px_#ff0040] mr-2"></span> Critical
              </div>
              <div className="flex items-center text-slate-300">
                <span className="w-3 h-3 rounded-full bg-[#f97316] shadow-[0_0_5px_#f97316] mr-2"></span> High
              </div>
              <div className="flex items-center text-slate-300">
                <span className="w-3 h-3 rounded-full bg-[#fbbf24] shadow-[0_0_5px_#fbbf24] mr-2"></span> Medium
              </div>
              <div className="flex items-center text-slate-300">
                <span className="w-3 h-3 rounded-full bg-[#00ff88] shadow-[0_0_5px_#00ff88] mr-2"></span> Low
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
