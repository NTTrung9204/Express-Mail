import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { toast } from "react-toastify";

const loadCss = (id, href) => {
  if (!document.getElementById(id)) {
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }
};

const loadScript = (id, src) => {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
};

const VietmapPicker = forwardRef(
  (
    {
      latitude,
      longitude,
      address = "",
      onChange,
      disabled = false,
      placeholder = "Nhập địa chỉ rồi nhấn Enter...",
      hideSearch = false, 
    },
    ref
  ) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markerInstance = useRef(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoadingScripts, setIsLoadingScripts] = useState(false);
    const [mapError, setMapError] = useState(false);
    const [mapReady, setMapReady] = useState(false);
    const hasInitialized = useRef(false);

    const apiKey = import.meta.env.VITE_VIETMAP_API_KEY;

    useImperativeHandle(ref, () => ({
      flyTo: (lngLat) => {
        if (!mapInstance.current || !markerInstance.current) return;
        markerInstance.current.setLngLat(lngLat);
        mapInstance.current.flyTo({
          center: lngLat,
          zoom: 16,
          essential: true,
        });
      },
    }));

    useEffect(() => {
      if (hasInitialized.current || !apiKey) return;

      hasInitialized.current = true;
      setIsLoadingScripts(true);
      setMapError(false);

      loadCss("vietmap-gl-css", "https://unpkg.com/@vietmap/vietmap-gl-js@6.0.0/dist/vietmap-gl.css");

      loadScript("vietmap-gl-js", "https://unpkg.com/@vietmap/vietmap-gl-js@6.0.0/dist/vietmap-gl.js")
        .then(() => {
          window.vietmapgl.accessToken = apiKey;
          setMapReady(true);
          setIsLoadingScripts(false);
        })
        .catch(() => {
          setMapError(true);
          setIsLoadingScripts(false);
          toast.error("Không tải được Vietmap SDK!");
        });
    }, [apiKey]);

    useEffect(() => {
      if (!mapReady || !mapRef.current || mapInstance.current || disabled) return;

      const lat = latitude ? parseFloat(latitude) : 21.0285;
      const lng = longitude ? parseFloat(longitude) : 105.8542;

      const map = new window.vietmapgl.Map({
        container: mapRef.current,
        style: `https://maps.vietmap.vn/maps/styles/tm/style.json?apikey=${apiKey}`,
        center: [lng, lat],
        zoom: 15,
      });

      mapInstance.current = map;

      const marker = new window.vietmapgl.Marker({ draggable: !disabled })
        .setLngLat([lng, lat])
        .addTo(map);

      markerInstance.current = marker;

      const update = (lngLat) => {
        if (disabled) return;
        onChange({
          latitude: lngLat.lat.toFixed(6),
          longitude: lngLat.lng.toFixed(6),
        });
        markerInstance.current.setLngLat(lngLat);
        mapInstance.current.flyTo({
          center: lngLat,
          zoom: 16,
          essential: true,
        });
      };

      map.on("click", (e) => update(e.lngLat));
      marker.on("dragend", () => update(marker.getLngLat()));
    }, [mapReady, latitude, longitude, disabled, apiKey, onChange]);

    const searchAddress = async (query) => {
      if (!query.trim()) return;
      try {
        const res = await fetch(
          `https://maps.vietmap.vn/api/search?text=${encodeURIComponent(query)}&apikey=${apiKey}`
        );
        const data = await res.json();
        const features = data?.data?.features || data?.features || [];
        if (features.length > 0) {
          const [lng, lat] = features[0].geometry.coordinates;
          const placeName = features[0].place_name || query;

          const newLat = lat.toFixed(6);
          const newLng = lng.toFixed(6);

          onChange({
            latitude: newLat,
            longitude: newLng,
            address: placeName,
          });

          if (markerInstance.current && mapInstance.current) {
            const pos = [lng, lat];
            markerInstance.current.setLngLat(pos);
            mapInstance.current.flyTo({
              center: pos,
              zoom: 16,
              essential: true,
            });
          }

          setSearchQuery("");
        } else {
          toast.warn("Không tìm thấy địa chỉ.");
        }
      } catch {
        toast.error("Lỗi tìm kiếm.");
      }
    };

    useEffect(() => {
      return () => {
        if (mapInstance.current) {
          try {
            mapInstance.current.remove();
          } catch (err) {
            console.error("Lỗi hủy map:", err);
          }
          mapInstance.current = null;
          markerInstance.current = null;
        }
      };
    }, []);

    return (
      <div className="space-y-3">
        {!disabled && !hideSearch && (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchQuery && searchAddress(searchQuery)}
              className="flex-1 p-2 border rounded-md text-sm"
            />
            <button
              onClick={() => searchQuery && searchAddress(searchQuery)}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm"
              disabled={!searchQuery}
            >
              Tìm
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <input
              value={latitude || ""}
              readOnly
              placeholder="Vĩ độ"
              className="w-full p-2 border rounded-md bg-gray-50"
            />
          </div>
          <div>
            <input
              value={longitude || ""}
              readOnly
              placeholder="Kinh độ"
              className="w-full p-2 border rounded-md bg-gray-50"
            />
          </div>
        </div>

        <div className="relative">
          <div
            ref={mapRef}
            className="w-full h-80 border-2 border-orange-300 rounded-lg overflow-hidden"
            style={{ minHeight: "320px" }}
          >
            {(isLoadingScripts || (!mapReady && !mapError)) && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80">
                <p className="text-orange-600">Đang tải bản đồ...</p>
              </div>
            )}

            {mapError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/90 text-red-600 p-4 text-center">
                <p className="font-bold text-lg">Lỗi tải bản đồ</p>
                <p className="text-sm">Kiểm tra API key hoặc mạng.</p>
              </div>
            )}
          </div>
        </div>

        {address && (
          <p className="text-sm text-gray-600 mt-1">
            <strong>Địa chỉ:</strong> {address}
          </p>
        )}
      </div>
    );
  }
);

export default VietmapPicker;