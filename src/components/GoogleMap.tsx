import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { motion } from 'motion/react';
import { MapPin, Settings } from 'lucide-react';

const RAW_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

// Trim and remove any accidental quotes
const API_KEY = RAW_KEY.trim().replace(/^["']|["']$/g, '');

const hasValidKey = 
  Boolean(API_KEY) && 
  API_KEY !== 'YOUR_API_KEY' && 
  API_KEY !== 'undefined' && 
  API_KEY !== 'null' &&
  API_KEY.length > 20; // Real Google Maps keys are typically ~39 characters

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  className?: string;
}

export function GoogleMap({ 
  center = { lat: -4.263889, lng: 15.193139 }, 
  zoom = 14, 
  height = '400px',
  className = '' 
}: GoogleMapProps) {
  if (!hasValidKey) {
    return (
      <div 
        className={`relative flex items-center justify-center bg-[var(--bg-primary)] rounded-[60px] overflow-hidden border border-[var(--border-color)] group cursor-default ${className}`}
        style={{ height }}
      >
        <div className="absolute inset-0 grayscale opacity-40 pointer-events-none">
           {/* Fallback pattern for map */}
           <div className="w-full h-full bg-[radial-gradient(var(--border-color)_1px,transparent_1px)] [background-size:20px_20px]" />
        </div>
        
        <div className="relative z-10 max-w-md px-10 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-3xl shadow-xl flex items-center justify-center text-[#D4AF37]">
              <MapPin size={32} />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-serif font-bold text-[var(--text-primary)]">Configuration Google Maps Requise</h3>
            <div className="text-sm text-[var(--text-secondary)] font-light leading-relaxed text-left space-y-4">
              <p>
                <strong>Étape 1:</strong> <a href="https://console.cloud.google.com/google/maps-apis/start" target="_blank" rel="noopener" className="text-[#D4AF37] underline">Obtenez une clé API</a>
              </p>
              <p><strong>Étape 2:</strong> Ajoutez votre clé comme secret dans AI Studio:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Ouvrez <strong>Paramètres</strong> (icône ⚙️, coin supérieur droit)</li>
                <li>Sélectionnez <strong>Secrets</strong></li>
                <li>Tapez <code>GOOGLE_MAPS_PLATFORM_KEY</code> comme nom de secret</li>
                <li>Collez votre clé API comme valeur et appuyez sur <strong>Entrée</strong></li>
              </ul>
              <p className="text-[10px] italic">L'application se reconstruira automatiquement après l'ajout du secret.</p>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-2 h-2 bg-[#D4AF37] opacity-20" />
        <div className="absolute bottom-20 right-40 w-4 h-4 bg-[#D4AF37] opacity-10" />
      </div>
    );
  }

  return (
    <div className={`rounded-[60px] overflow-hidden border border-[var(--border-color)] ${className}`} style={{ height }}>
      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
          defaultCenter={center}
          defaultZoom={zoom}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
          gestureHandling={'greedy'}
          disableDefaultUI={false}
        >
          <AdvancedMarker position={center}>
            <Pin background="#D4AF37" borderColor="#1A1A1A" glyphColor="#FFF" />
          </AdvancedMarker>
        </Map>
      </APIProvider>
    </div>
  );
}
