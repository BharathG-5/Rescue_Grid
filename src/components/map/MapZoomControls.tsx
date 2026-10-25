import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

export const MapInstanceBridge: React.FC<{ onReady: (map: L.Map | null) => void }> = ({
  onReady
}) => {
  const map = useMap();

  useEffect(() => {
    onReady(map);
    return () => onReady(null);
  }, [map, onReady]);

  return null;
};

export const MapZoomControls: React.FC<{ map: L.Map | null }> = ({ map }) => {
  const [zoomLevel, setZoomLevel] = useState(map?.getZoom() ?? 12);

  useEffect(() => {
    if (!map) return;

    const updateZoomLevel = () => setZoomLevel(map.getZoom());
    updateZoomLevel();
    map.on('zoomend', updateZoomLevel);
    return () => {
      map.off('zoomend', updateZoomLevel);
    };
  }, [map]);

  if (!map) return null;

  return (
    <div
      className="absolute right-3 top-3 z-[1000] flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-md"
    >
      <button
        type="button"
        aria-label="Zoom in"
        onClick={() => map.setView(map.getCenter(), Math.min(map.getZoom() + 1, 19), { animate: false })}
        className="h-8 w-8 text-lg font-semibold leading-none text-slate-800 hover:bg-slate-100"
      >
        +
      </button>
      <span
        aria-label={`Zoom level ${zoomLevel}; maximum ${map.getMaxZoom()}`}
        className="border-t border-slate-200 py-1 text-center text-[10px] font-mono text-slate-500"
      >
        {zoomLevel}/{map.getMaxZoom()}
      </span>
      <button
        type="button"
        aria-label="Zoom out"
        onClick={() => map.setView(map.getCenter(), Math.max(map.getZoom() - 1, 3), { animate: false })}
        className="h-8 w-8 border-t border-slate-200 text-lg font-semibold leading-none text-slate-800 hover:bg-slate-100"
      >
        −
      </button>
    </div>
  );
};
