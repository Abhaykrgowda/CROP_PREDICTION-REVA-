import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import type { Farmer } from "@/lib/storage";
import { useI18n } from "@/lib/i18n";

interface IndiaMapProps {
  farmers: Farmer[];
}

// Fix leaflet default icon issue
delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const FitBounds = ({ farmers }: { farmers: Farmer[] }) => {
  const map = useMap();
  useEffect(() => {
    if (farmers.length > 0) {
      const bounds = L.latLngBounds(farmers.map((f) => [f.lat, f.lng]));
      map.fitBounds(bounds.pad(0.3));
    }
  }, [farmers, map]);
  return null;
};

const IndiaMap = ({ farmers }: IndiaMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  // Group farmers by approximate location
  const groups = new Map<
    string,
    {
      lat: number;
      lng: number;
      count: number;
      totalCredits: number;
      names: string[];
    }
  >();
  farmers.forEach((f) => {
    const key = `${f.lat.toFixed(1)},${f.lng.toFixed(1)}`;
    const existing = groups.get(key);
    if (existing) {
      existing.count++;
      existing.totalCredits += f.carbonCredits;
      existing.names.push(f.name);
    } else {
      groups.set(key, {
        lat: f.lat,
        lng: f.lng,
        count: 1,
        totalCredits: f.carbonCredits,
        names: [f.name],
      });
    }
  });

  return (
    <div
      ref={mapRef}
      className="relative w-full rounded-xl overflow-hidden"
      style={{ height: "500px" }}
    >
      <style>{`
        .leaflet-container {
          background: hsl(160, 30%, 6%) !important;
          font-family: 'Inter', sans-serif;
        }
        .leaflet-control-zoom a {
          background: hsla(160, 25%, 10%, 0.9) !important;
          color: hsl(150, 60%, 40%) !important;
          border-color: hsla(150, 30%, 25%, 0.4) !important;
          backdrop-filter: blur(10px);
        }
        .leaflet-control-zoom a:hover {
          background: hsla(160, 25%, 15%, 0.95) !important;
          color: hsl(45, 90%, 55%) !important;
        }
        .leaflet-control-attribution {
          background: hsla(160, 25%, 10%, 0.8) !important;
          color: hsl(150, 10%, 55%) !important;
          font-size: 10px !important;
          backdrop-filter: blur(10px);
        }
        .leaflet-control-attribution a {
          color: hsl(150, 60%, 40%) !important;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          background: hsla(160, 25%, 10%, 0.95) !important;
          color: hsl(150, 20%, 90%) !important;
          border: 1px solid hsla(150, 30%, 25%, 0.4) !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 32px hsla(150, 60%, 40%, 0.15), 0 0 20px hsla(150, 60%, 40%, 0.08) !important;
          backdrop-filter: blur(20px);
        }
        .custom-popup .leaflet-popup-tip {
          background: hsla(160, 25%, 10%, 0.95) !important;
          border: 1px solid hsla(150, 30%, 25%, 0.4) !important;
        }
        .custom-popup .leaflet-popup-close-button {
          color: hsl(150, 10%, 55%) !important;
        }
        .custom-popup .leaflet-popup-close-button:hover {
          color: hsl(150, 60%, 40%) !important;
        }
        .leaflet-tile-pane {
          filter: invert(1) hue-rotate(180deg) brightness(0.8) contrast(1.2) saturate(0.3) !important;
        }
      `}</style>

      {farmers.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center z-[1000] bg-background/50">
          <div className="text-center">
            <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">
              {t("map.noCredits")}
            </p>
          </div>
        </div>
      ) : null}

      <MapContainer
        center={[22.5, 82.5]}
        zoom={5}
        minZoom={4}
        maxZoom={18}
        maxBounds={[
          [6.5, 68.0],
          [37.5, 97.5],
        ]}
        maxBoundsViscosity={1.0}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds farmers={farmers} />

        {Array.from(groups.entries()).map(([key, group]) => {
          const radius = Math.min(8 + group.count * 4, 25);
          return (
            <CircleMarker
              key={key}
              center={[group.lat, group.lng]}
              radius={radius}
              pathOptions={{
                fillColor: "hsl(150, 60%, 40%)",
                fillOpacity: 0.7,
                color: "hsl(45, 90%, 55%)",
                weight: 2,
                opacity: 0.9,
              }}
            >
              <Popup className="custom-popup">
                <div style={{ minWidth: "160px" }}>
                  <div
                    style={{
                      fontFamily: "Orbitron, sans-serif",
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: "hsl(45, 90%, 55%)",
                      marginBottom: "8px",
                    }}
                  >
                    {t("map.creditsYear", { n: group.totalCredits.toFixed(1) })}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "hsl(150, 10%, 55%)",
                      marginBottom: "4px",
                    }}
                  >
                    {t("map.farmers", { n: group.count })}
                  </div>
                  {group.names.slice(0, 3).map((name, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: "11px",
                        color: "hsl(150, 20%, 80%)",
                        padding: "2px 0",
                      }}
                    >
                      • {name}
                    </div>
                  ))}
                  {group.names.length > 3 && (
                    <div
                      style={{ fontSize: "11px", color: "hsl(150, 10%, 55%)" }}
                    >
                      {t("map.more", { n: group.names.length - 3 })}
                    </div>
                  )}
                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "10px",
                      color: "hsl(150, 10%, 45%)",
                    }}
                  >
                    {group.lat.toFixed(4)}, {group.lng.toFixed(4)}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default IndiaMap;
