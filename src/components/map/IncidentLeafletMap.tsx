import React, { useCallback, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents
} from 'react-leaflet';
import { Incident, RescueTeam } from '../../types';
import { useApp } from '../../context/AppContext';
import { Crosshair, Layers, WifiOff } from 'lucide-react';
import { MapInstanceBridge, MapZoomControls } from './MapZoomControls';

const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const COIMBATORE: L.LatLngExpression = [11.0168, 76.9558];

const severityColors: Record<Incident['severity'], string> = {
  Critical: '#DC2626',
  High: '#EA580C',
  Medium: '#CA8A04',
  Low: '#16A34A'
};

const incidentIcon = (severity: Incident['severity']) =>
  L.divIcon({
    className: 'rescuegrid-incident-marker',
    html: `<span style="background:${severityColors[severity]}">${severity[0]}</span>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -15]
  });

const currentLocationIcon = L.divIcon({
  className: 'rescuegrid-location-marker',
  html: '<span></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

interface IncidentMapProps {
  incidents: Incident[];
  teams: RescueTeam[];
  selectedIncidentId?: string;
  onSelectIncident?: (id: string) => void;
  heightClass?: string;
}

const MapSizeInvalidator: React.FC = () => {
  const map = useMap();

  useEffect(() => {
    const invalidate = () => map.invalidateSize({ pan: false });
    const observer = new ResizeObserver(invalidate);
    observer.observe(map.getContainer());
    window.addEventListener('resize', invalidate);
    const frame = window.requestAnimationFrame(invalidate);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', invalidate);
      window.cancelAnimationFrame(frame);
    };
  }, [map]);

  return null;
};

const IncidentMarker: React.FC<{
  incident: Incident;
  selected: boolean;
  assignedTeam?: string;
  onSelectIncident?: (id: string) => void;
}> = ({ incident, selected, assignedTeam, onSelectIncident }) => {
  const map = useMap();
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (selected && markerRef.current) {
      map.flyTo(markerRef.current.getLatLng(), 15);
      markerRef.current.openPopup();
    }
  }, [map, selected]);

  return (
    <Marker
      ref={markerRef}
      position={[incident.location.latitude, incident.location.longitude]}
      icon={incidentIcon(incident.severity)}
      eventHandlers={{
        click: () => onSelectIncident?.(incident.id)
      }}
    >
      <Popup>
        <div className="min-w-52 space-y-1.5 text-xs">
          <div className="flex items-center justify-between gap-2">
            <strong className="font-mono">{incident.id}</strong>
            <span className="font-bold" style={{ color: severityColors[incident.severity] }}>
              {incident.severity}
            </span>
          </div>
          <h3 className="font-bold">{incident.category}: {incident.title}</h3>
          <p>{incident.description}</p>
          <p><strong>Status:</strong> {incident.status}</p>
          <p><strong>Location:</strong> {incident.location.address}</p>
          <p><strong>Reported:</strong> {new Date(incident.reportedAt).toLocaleString()}</p>
          <p><strong>Team:</strong> {assignedTeam || 'Not assigned'}</p>
          <p className="font-mono text-slate-500">
            {incident.location.latitude.toFixed(5)}, {incident.location.longitude.toFixed(5)}
          </p>
          {onSelectIncident && (
            <button
              type="button"
              onClick={() => onSelectIncident(incident.id)}
              className="mt-1 w-full rounded bg-slate-900 px-2 py-1.5 font-semibold text-white"
            >
              View incident details
            </button>
          )}
        </div>
      </Popup>
    </Marker>
  );
};

const CurrentLocationController: React.FC<{
  location: L.LatLngExpression | null;
  onMapClick: (location: L.LatLng) => void;
}> = ({ location, onMapClick }) => {
  const map = useMap();
  useMapEvents({ click: (event) => onMapClick(event.latlng) });

  useEffect(() => {
    if (location) map.flyTo(location, Math.max(map.getZoom(), 14));
  }, [location, map]);

  return location ? (
    <Marker position={location} icon={currentLocationIcon}>
      <Popup>Current location (from your device)</Popup>
    </Marker>
  ) : null;
};

export const IncidentLeafletMap: React.FC<IncidentMapProps> = ({
  incidents,
  teams,
  selectedIncidentId,
  onSelectIncident,
  heightClass = 'h-[450px] sm:h-[600px]'
}) => {
  const { isOnline } = useApp();
  const [tileError, setTileError] = useState(false);
  const [tileLoaded, setTileLoaded] = useState(false);
  const [tileRetryKey, setTileRetryKey] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<L.LatLngExpression | null>(null);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const handleMapReady = useCallback((map: L.Map | null) => setMapInstance(map), []);

  const useCurrentLocation = () => {
    setLocationMessage(null);
    if (!navigator.geolocation) {
      setLocationMessage('Location services are unavailable in this browser. You can select an incident from the list.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCurrentLocation([coords.latitude, coords.longitude]);
        setLocating(false);
      },
      (error) => {
        setLocating(false);
        setLocationMessage(
          error.code === error.PERMISSION_DENIED
            ? 'Location permission was denied. You can still choose an incident from the list.'
              : error.code === error.POSITION_UNAVAILABLE
                ? 'Your device could not determine its location. Check location services or choose an incident from the list.'
                : 'The location request timed out. Try again or choose an incident from the list.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleMapClick = (location: L.LatLng) => {
    if (currentLocation) setCurrentLocation([location.lat, location.lng]);
  };

  const plottedIncidents = incidents.filter(
    (incident) =>
      Number.isFinite(incident.location.latitude) &&
      Number.isFinite(incident.location.longitude) &&
      Math.abs(incident.location.latitude) <= 90 &&
      Math.abs(incident.location.longitude) <= 180
  );
  const criticalIncidents = plottedIncidents.filter((incident) => incident.severity === 'Critical');

  return (
    <div className={`relative w-full ${heightClass} rounded-xl overflow-hidden border border-slate-200 bg-slate-100`}>
      <MapContainer
        center={COIMBATORE}
        zoom={12}
        minZoom={3}
        maxZoom={19}
        zoomSnap={1}
        zoomDelta={1}
        zoomControl={false}
        scrollWheelZoom
        className="h-full w-full"
        aria-label="Interactive OpenStreetMap showing emergency incidents"
      >
        <TileLayer
          key={tileRetryKey}
          url={OSM_TILE_URL}
          maxZoom={19}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          eventHandlers={{
            tileerror: () => setTileError(true),
            tileload: () => setTileLoaded(true)
          }}
        />
        <MapInstanceBridge onReady={handleMapReady} />
        <MapSizeInvalidator />
        <CurrentLocationController location={currentLocation} onMapClick={handleMapClick} />

        {plottedIncidents.map((incident) => {
          const assignedTeam =
            teams.find((team) => team.id === incident.assignedTeamId)?.name ||
            incident.assignedTeamName;

          return (
            <IncidentMarker
              key={incident.id}
              incident={incident}
              selected={selectedIncidentId === incident.id}
              assignedTeam={assignedTeam}
              onSelectIncident={onSelectIncident}
            />
          );
        })}
      </MapContainer>
      <MapZoomControls map={mapInstance} />

      <div className="absolute left-3 top-3 z-[1000] flex flex-col gap-2">
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={locating}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-md disabled:opacity-60"
        >
          <Crosshair className="h-4 w-4 text-blue-600" />
          {locating ? 'Finding location...' : 'Use My Current Location'}
        </button>
        {locationMessage && (
          <p role="status" className="max-w-64 rounded-lg bg-white p-2 text-xs text-slate-700 shadow-md">
            {locationMessage}
          </p>
        )}
      </div>

      {(!isOnline || tileError) && (
        <div
          role="status"
          className="absolute right-3 top-24 z-[1000] flex max-w-sm items-start gap-2 rounded-lg border border-amber-200 bg-white/95 px-3 py-2 text-xs text-slate-800 shadow-md"
        >
          <WifiOff className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div>
            {!isOnline ? (
              <>
                <strong>Offline.</strong> Incident data remains available locally; live OpenStreetMap
                tiles require an internet connection.
              </>
            ) : (
              <>
                <strong>Map tiles could not load.</strong> Check your internet connection.
                <button
                  type="button"
                  onClick={() => {
                    setTileError(false);
                    setTileLoaded(false);
                    setTileRetryKey((key) => key + 1);
                  }}
                  className="ml-2 font-bold text-blue-700 underline"
                >
                  Retry
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {isOnline && !tileError && (
        <div
          role="status"
          className="absolute right-3 top-24 z-[1000] rounded-lg border border-slate-200 bg-white/95 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 shadow-md"
        >
          <span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${tileLoaded ? 'bg-emerald-500' : 'animate-pulse bg-amber-500'}`} />
          {tileLoaded ? 'OpenStreetMap tiles loaded' : 'Loading map tiles...'}
        </div>
      )}

      <div className="absolute bottom-3 left-3 z-[1000] flex max-w-[calc(100%-24px)] flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-[11px] text-slate-700 shadow-md">
        <span className="flex items-center gap-1 font-semibold text-slate-900">
          <Layers className="h-3.5 w-3.5 text-blue-600" /> Severity
        </span>
        {(['Critical', 'High', 'Medium', 'Low'] as const).map((severity) => (
          <span key={severity} className="flex items-center gap-1">
            <i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: severityColors[severity] }} />
            {severity}
          </span>
        ))}
        <span className="flex items-center gap-1">
          <i className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Current location
        </span>
        <span className="hidden md:inline text-slate-500">
          Team/volunteer coordinates aren&apos;t saved in this data set
        </span>
        <span className="hidden sm:inline border-l border-slate-300 pl-2">
          {plottedIncidents.length} incidents · {criticalIncidents.length} critical
        </span>
      </div>
    </div>
  );
};
