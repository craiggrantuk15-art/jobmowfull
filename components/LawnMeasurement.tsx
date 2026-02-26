import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Trash2, Maximize2, MousePointer2 } from 'lucide-react';

interface LawnMeasurementProps {
    apiKey: string;
    center?: { lat: number; lng: number };
    onAreaMeasured: (area: number, lat?: number, lng?: number) => void;
}

declare global {
    interface Window {
        google: any;
        initMap: () => void;
    }
}

const LawnMeasurement: React.FC<LawnMeasurementProps> = ({ apiKey, center, onAreaMeasured }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<any>(null);
    const [drawingManager, setDrawingManager] = useState<any>(null);
    const [polygon, setPolygon] = useState<any>(null);
    const [area, setArea] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!apiKey) {
            setError("Google Maps API Key is missing. Please contact support.");
            setIsLoading(false);
            return;
        }

        const loadGoogleMaps = () => {
            if (window.google && window.google.maps) {
                initMap();
                return;
            }

            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=drawing,geometry&callback=initMap`;
            script.async = true;
            script.defer = true;
            window.initMap = initMap;
            document.head.appendChild(script);

            script.onerror = () => {
                setError("Failed to load Google Maps. Please check your connection or API key.");
                setIsLoading(false);
            };
        };

        const initMap = () => {
            if (!mapRef.current) return;

            const defaultCenter = center || { lat: 51.5074, lng: -0.1278 }; // London default

            const newMap = new window.google.maps.Map(mapRef.current, {
                center: defaultCenter,
                zoom: 19,
                mapTypeId: 'satellite',
                tilt: 0,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: true,
            });

            const newDrawingManager = new window.google.maps.drawing.DrawingManager({
                drawingMode: window.google.maps.drawing.OverlayType.POLYGON,
                drawingControl: true,
                drawingControlOptions: {
                    position: window.google.maps.ControlPosition.TOP_CENTER,
                    drawingModes: [window.google.maps.drawing.OverlayType.POLYGON],
                },
                polygonOptions: {
                    fillColor: '#16a34a',
                    fillOpacity: 0.4,
                    strokeWeight: 2,
                    strokeColor: '#16a34a',
                    clickable: true,
                    editable: true,
                    zIndex: 1,
                },
            });

            newDrawingManager.setMap(newMap);
            setMap(newMap);
            setDrawingManager(newDrawingManager);
            setIsLoading(false);

            window.google.maps.event.addListener(newDrawingManager, 'overlaycomplete', (event: any) => {
                if (event.type === window.google.maps.drawing.OverlayType.POLYGON) {
                    // Remove previous polygon if exists
                    if (polygon) {
                        polygon.setMap(null);
                    }

                    const newPolygon = event.overlay;
                    setPolygon(newPolygon);
                    newDrawingManager.setDrawingMode(null); // Switch to hand tool

                    calculateArea(newPolygon);

                    // Add listeners for editing
                    const path = newPolygon.getPath();
                    window.google.maps.event.addListener(path, 'set_at', () => calculateArea(newPolygon));
                    window.google.maps.event.addListener(path, 'insert_at', () => calculateArea(newPolygon));
                }
            });
        };

        loadGoogleMaps();

        return () => {
            // Cleanup if needed
            if (window.initMap) delete (window as any).initMap;
        };
    }, [apiKey]);

    // Update center if it changes
    useEffect(() => {
        if (map && center) {
            map.setCenter(center);
            map.setZoom(20);
        }
    }, [center, map]);

    const calculateArea = (poly: any) => {
        const areaInSqMeters = window.google.maps.geometry.spherical.computeArea(poly.getPath());
        const roundedArea = Math.round(areaInSqMeters);
        setArea(roundedArea);

        // Get center of the polygon to store as lead coordinates
        const bounds = new window.google.maps.LatLngBounds();
        poly.getPath().forEach((latLng: any) => bounds.extend(latLng));
        const polyCenter = bounds.getCenter();

        onAreaMeasured(roundedArea, polyCenter.lat(), polyCenter.lng());
    };

    const clearDrawing = () => {
        if (polygon) {
            polygon.setMap(null);
            setPolygon(null);
            setArea(0);
            onAreaMeasured(0);
            if (drawingManager) {
                drawingManager.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON);
            }
        }
    };

    if (error) {
        return (
            <div className="h-64 flex flex-col items-center justify-center bg-red-50 rounded-2xl border-2 border-red-100 p-6 text-center">
                <p className="text-red-600 font-bold mb-2">{error}</p>
                <p className="text-xs text-red-400 font-medium uppercase tracking-wide">Error initializing MowVision™</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-lawn-100 text-lawn-600 flex items-center justify-center">
                        <Maximize2 size={18} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">MowVision™ Area Measurement</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Draw a boundary around your lawn area</p>
                    </div>
                </div>

                {area > 0 && (
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-slate-200">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Measured Area:</span>
                            <span className="text-lg font-black">{area} m²</span>
                        </div>
                        <button
                            onClick={clearDrawing}
                            className="p-2.5 bg-white text-rose-500 rounded-xl border-2 border-slate-100 hover:border-rose-100 hover:bg-rose-50 transition-all shadow-sm"
                            title="Clear Drawing"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                )}
            </div>

            <div className="relative group">
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-[2rem]">
                        <Loader2 className="animate-spin text-lawn-600 mb-4" size={48} />
                        <p className="text-slate-900 font-black uppercase tracking-widest text-xs">Initializing Satellite Vision...</p>
                    </div>
                )}

                <div
                    ref={mapRef}
                    className="w-full h-[400px] rounded-[2rem] border-4 border-white shadow-2xl overflow-hidden cursor-crosshair"
                />

                {!polygon && !isLoading && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-200 shadow-xl flex items-center gap-3 animate-bounce">
                        <MousePointer2 size={18} className="text-lawn-600" />
                        <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Click points on the map to start drawing</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                    <div className="p-2 bg-white rounded-lg text-slate-400">
                        <Info size={16} />
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed uppercase tracking-tight">
                        For best accuracy, ensure the entire lawn is within view. You can drag the markers to refine your measurement.
                    </p>
                </div>
                <div className="p-4 bg-lawn-50 rounded-2xl border border-lawn-100 flex items-start gap-3">
                    <div className="p-2 bg-white rounded-lg text-lawn-600">
                        <Zap size={16} />
                    </div>
                    <p className="text-[10px] text-lawn-700 font-medium leading-relaxed uppercase tracking-tight">
                        Our AI uses this precise area to provide our most accurate price guarantee for your property.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LawnMeasurement;

const Info: React.FC<{ size: number, className?: string }> = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

const Zap: React.FC<{ size: number, className?: string }> = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);
