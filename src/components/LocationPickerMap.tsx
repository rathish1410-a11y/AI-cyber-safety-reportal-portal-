import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function MapPicker({ onLocationSelect, initialPos }: { onLocationSelect: (lat: number, lng: number) => void, initialPos: [number, number] | null }) {
  const [position, setPosition] = useState<[number, number] | null>(initialPos);

  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    if (initialPos && (!position || initialPos[0] !== position[0] || initialPos[1] !== position[1])) {
      setPosition(initialPos);
      map.setView(initialPos, map.getZoom());
    }
  }, [initialPos, map]);

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function LocationPickerMap({ 
  onLocationSelect, 
  latitude, 
  longitude 
}: { 
  onLocationSelect: (lat: number, lng: number) => void;
  latitude: number | null;
  longitude: number | null;
}) {
  const defaultCenter: [number, number] = [20.5937, 78.9629]; // India
  const center: [number, number] = latitude && longitude ? [latitude, longitude] : defaultCenter;

  return (
    <div className="h-[300px] w-full rounded-lg overflow-hidden border border-cyber-400/20 relative z-0 mt-4">
      <MapContainer 
        center={center} 
        zoom={latitude ? 13 : 4} 
        scrollWheelZoom={true} 
        className="h-full w-full bg-dark-900"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapPicker 
          onLocationSelect={onLocationSelect} 
          initialPos={latitude && longitude ? [latitude, longitude] : null} 
        />
      </MapContainer>
      <div className="absolute top-2 right-2 bg-dark-950/80 border border-[rgba(56,189,248,0.3)] text-cyber-400 text-xs px-3 py-1.5 rounded backdrop-blur z-[400] font-mono pointer-events-none shadow-[0_0_10px_rgba(56,189,248,0.1)]">
        Click on map to set location
      </div>
    </div>
  );
}
