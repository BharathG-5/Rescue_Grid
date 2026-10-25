import React, { useCallback, useEffect, useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { WifiOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MapInstanceBridge, MapZoomControls } from './MapZoomControls';

const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const COIMBATORE: L.LatLngExpression = [11.0168, 76.9558];
const selectedLocationIcon = L.divIcon({
  className: 'rescuegrid-incident-marker',
  html: '<span style="background:#DC2626">+</span>',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

interface LocationPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationChange: (lat: number, lng: number) => void;
}

const PickerEvents: React.FC<{ onLocationChange: (lat: number, lng: number) => void }> = ({
  onLocationChange
}) => {
  useMapEvents({
    click: ({ latlng }) =>
      onLocationChange(Number(latlng.lat.toFixed(5)), Number(latlng.lng.toFixed(5)))
  });
  return null;
};

const PickerMapController: React.FC<{ location: L.LatLngExpression | null }> = ({ location }) => {
  const map = useMap();

  useEffect(() => {
    const invalidate = () => map.invalidateSize({ pan: false });
    const observer = new ResizeObserver(invalidate);
    observer.observe(map.getContainer());
    const frame = window.requestAnimationFrame(invalidate);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [map]);

  useEffect(() => {
    if (location) map.setView(location, Math.max(map.getZoom(), 13));
  }, [location, map]);

  return null;
};

export const LocationPickerLeafletMap: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  onLocationChange
}) => {
  const { isOnline } = useApp();
  const [tileError, setTileError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const handleMapReady = useCallback((map: L.Map | null) => setMapInstance(map), []);
  const hasLocation =
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);
  const location = hasLocation ? ([latitude, longitude] as L.LatLngExpression) : null;

  return (
    <div className="relative h-[450px] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:h-[600px]">
      <MapContainer
        center={location || COIMBATORE}
        zoom={13}
        minZoom={3}
        maxZoom={19}
        zoomSnap={1}
        zoomDelta={1}
        zoomControl={false}
        scrollWheelZoom
        className="h-full w-full"
        aria-label="Select the emergency location on the OpenStreetMap"
      >
        <TileLayer
          key={retryKey}
          url={OSM_TILE_URL}
          maxZoom={19}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          eventHandlers={{
            tileerror: () => setTileError(true),
          }}
        />
        <MapInstanceBridge onReady={handleMapReady} />
        <PickerMapController location={location} />
        <PickerEvents onLocationChange={onLocationChange} />
        {location && (
          <Marker
            position={location}
            icon={selectedLocationIcon}
            draggable
            eventHandlers={{
              dragend: (event) => {
                const marker = event.target as L.Marker;
                const selected = marker.getLatLng();
                onLocationChange(Number(selected.lat.toFixed(5)), Number(selected.lng.toFixed(5)));
              }
            }}
          />
        )}
      </MapContainer>
      <MapZoomControls map={mapInstance} />

      <div className="absolute left-3 top-3 z-[1000] rounded-lg bg-white/95 px-3 py-2 text-xs font-medium text-slate-700 shadow-md">
        {hasLocation
          ? `Selected: ${latitude.toFixed(5)}, ${longitude.toFixed(5)} · click map or drag pin to change`
          : 'Click the map to select the emergency location'}
      </div>

      {(!isOnline || tileError) && (
        <div
          role="status"
          className="absolute bottom-14 left-3 z-[1000] flex max-w-[calc(100%-24px)] items-center justify-between gap-2 rounded-lg border border-amber-200 bg-white/95 px-3 py-2 text-xs text-slate-800 shadow-md"
        >
          <span className="flex items-center gap-2">
            <WifiOff className="h-4 w-4 shrink-0 text-amber-600" />
            {!isOnline
              ? 'Offline: saved coordinates remain usable, but live map tiles need internet.'
              : 'Map tiles could not load. Check your internet connection.'}
          </span>
          {isOnline && tileError && (
            <button
              type="button"
              onClick={() => {
                setTileError(false);
                setRetryKey((key) => key + 1);
              }}
              className="font-bold text-blue-700 underline"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
};
