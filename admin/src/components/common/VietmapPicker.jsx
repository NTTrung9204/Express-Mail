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
      placeholder = "Nhập địa chỉ để tìm kiếm...",
      hideSearch = false,
      postOffices = [], 
    },
    ref
  ) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markerInstance = useRef(null); 
    const postOfficeMarkersRef = useRef([]);
    
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoadingScripts, setIsLoadingScripts] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [mapError, setMapError] = useState(false);
    const [mapReady, setMapReady] = useState(false);
    const hasInitialized = useRef(false);
    const debounceTimer = useRef(null);
    const searchInputRef = useRef(null);

    const apiKeyLoadMap = import.meta.env.VITE_VIETMAP_API_KEY_LOAD_MAP;
    const apiKeySuggestPlace = import.meta.env.VITE_VIETMAP_API_KEY_SUGGEST_PLACE;

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
      if (hasInitialized.current || !apiKeyLoadMap) return;

      hasInitialized.current = true;
      setIsLoadingScripts(true);
      setMapError(false);

      loadCss("vietmap-gl-css", "https://unpkg.com/@vietmap/vietmap-gl-js@6.0.0/dist/vietmap-gl.css");

      loadScript("vietmap-gl-js", "https://unpkg.com/@vietmap/vietmap-gl-js@6.0.0/dist/vietmap-gl.js")
        .then(() => {
          window.vietmapgl.accessToken = apiKeyLoadMap;
          setMapReady(true);
          setIsLoadingScripts(false);
        })
        .catch(() => {
          setMapError(true);
          setIsLoadingScripts(false);
          toast.error("Không tải được Vietmap SDK!");
        });
    }, [apiKeyLoadMap]);

    // Khởi tạo Map và Marker chính
    useEffect(() => {
      if (!mapReady || !mapRef.current || mapInstance.current || disabled) return;

      const lat = latitude ? parseFloat(latitude) : 16.069939;
      const lng = longitude ? parseFloat(longitude) : 108.211595;

      const map = new window.vietmapgl.Map({
        container: mapRef.current,
        style: `https://maps.vietmap.vn/maps/styles/tm/style.json?apikey=${apiKeyLoadMap}`,
        center: [lng, lat],
        zoom: 13,
      });

      mapInstance.current = map;

      // Marker chính (draggable) - màu đỏ
      const marker = new window.vietmapgl.Marker({ 
        draggable: !disabled,
        color: '#ef4444' // Màu đỏ để phân biệt với markers bưu cục
      })
        .setLngLat([lng, lat])
        .addTo(map);

      markerInstance.current = marker;

      const update = async (lngLat) => {
        if (disabled) return;
        
        markerInstance.current.setLngLat(lngLat);
        mapInstance.current.flyTo({
          center: lngLat,
          zoom: 16,
          essential: true,
        });

        try {
          const res = await fetch(
            `https://maps.vietmap.vn/api/reverse/v3?apikey=${apiKeySuggestPlace}&lng=${lngLat.lng}&lat=${lngLat.lat}`
          );
          const data = await res.json();
          
          let newAddress = "";
          
          if (data.display) {
            newAddress = data.display;
          } else if (data.name) {
            newAddress = data.name;
          } else if (data.address) {
            newAddress = data.address;
          } else if (Array.isArray(data) && data.length > 0) {
            newAddress = data[0].display || data[0].name || data[0].address;
          }
          
          if (!newAddress) {
            newAddress = `${lngLat.lat.toFixed(6)}, ${lngLat.lng.toFixed(6)}`;
          }
          
          onChange({
            latitude: lngLat.lat.toFixed(6),
            longitude: lngLat.lng.toFixed(6),
            address: newAddress,
          });
        } catch (error) {
          console.error("Lỗi reverse geocoding:", error);
          onChange({
            latitude: lngLat.lat.toFixed(6),
            longitude: lngLat.lng.toFixed(6),
            address: `${lngLat.lat.toFixed(6)}, ${lngLat.lng.toFixed(6)}`,
          });
        }
      };

      map.on("click", (e) => update(e.lngLat));
      marker.on("dragend", () => update(marker.getLngLat()));

      map.on("load", () => {
        addPostOfficeMarkers(postOffices);
      });

    }, [mapReady, latitude, longitude, disabled, apiKeyLoadMap, apiKeySuggestPlace, onChange]);

    const addPostOfficeMarkers = (offices) => {
      if (!mapInstance.current || !offices || offices.length === 0) return;

      postOfficeMarkersRef.current.forEach(m => m.remove());
      postOfficeMarkersRef.current = [];

      offices.forEach((office) => {
        const lat = parseFloat(office.latitude);
        const lng = parseFloat(office.longitude);

        if (isNaN(lat) || isNaN(lng)) return;

        const el = document.createElement('div');
        el.className = 'post-office-marker';
        el.style.cssText = `
          width: 32px;
          height: 32px;
          background-color: #3b82f6;
          border: 3px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          font-size: 11px;
        `;
        el.textContent = 'PO';

        const marker = new window.vietmapgl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(mapInstance.current);

        const popup = new window.vietmapgl.Popup({
          offset: 35,
          closeButton: false,
          closeOnClick: false,
          maxWidth: '300px'
        });

        el.onmouseenter = () => {
          popup
            .setLngLat([lng, lat])
            .setHTML(`
              <div style="font-family: sans-serif; padding: 8px 12px;">
                <div style="font-weight: bold; font-size: 14px; color: #1a1a1a; margin-bottom: 6px;">
                  📍 ${office.name}
                </div>
                <div style="font-size: 12px; color: #666; line-height: 1.5; margin-bottom: 4px;">
                  ${office.address}
                </div>
                <div style="font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 4px; margin-top: 4px;">
                  ID: ${office.id} | 📌 ${lat.toFixed(6)}, ${lng.toFixed(6)}
                </div>
              </div>
            `)
            .addTo(mapInstance.current);
        };

        el.onmouseleave = () => {
          popup.remove();
        };

        el.onclick = () => {
          mapInstance.current.flyTo({
            center: [lng, lat],
            zoom: 16,
            essential: true
          });
        };

        postOfficeMarkersRef.current.push(marker);
      });

      if (offices.length > 0) {
        const bounds = new window.vietmapgl.LngLatBounds();
        offices.forEach(office => {
          const lat = parseFloat(office.latitude);
          const lng = parseFloat(office.longitude);
          if (!isNaN(lat) && !isNaN(lng)) {
            bounds.extend([lng, lat]);
          }
        });
        mapInstance.current.fitBounds(bounds, { padding: 50, maxZoom: 13 });
      }
    };

    useEffect(() => {
      if (mapReady && mapInstance.current) {
        addPostOfficeMarkers(postOffices);
      }
    }, [postOffices, mapReady]);

    const fetchSuggestions = async (query) => {
      if (!query.trim()) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoadingSuggestions(true);
      
      try {
        const focusLat = latitude || 16.069939;
        const focusLng = longitude || 108.211595;
        
        const res = await fetch(
          `https://maps.vietmap.vn/api/autocomplete/v4?apikey=${apiKeySuggestPlace}&text=${encodeURIComponent(query)}&focus=${focusLat},${focusLng}`
        );
        const data = await res.json();
                
        if (data && Array.isArray(data)) {
          setSuggestions(data);
          setShowSuggestions(data.length > 0);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error("Lỗi tải gợi ý:", error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    const handleSearchChange = (e) => {
      const value = e.target.value;
      setSearchQuery(value);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      if (value.trim()) {
        debounceTimer.current = setTimeout(() => {
          fetchSuggestions(value);
        }, 500);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const handleSelectSuggestion = (suggestion) => {
      let lat, lng, placeName;
      
      if (suggestion.lat !== undefined && suggestion.lng !== undefined) {
        lat = suggestion.lat;
        lng = suggestion.lng;
      } else if (suggestion.geometry?.coordinates) {
        lng = suggestion.geometry.coordinates[0];
        lat = suggestion.geometry.coordinates[1];
      } else if (suggestion.ref_id) {
        fetchPlaceDetail(suggestion.ref_id);
        return;
      } else {
        toast.error("Không tìm thấy tọa độ địa điểm");
        return;
      }

      placeName = suggestion.display || suggestion.name || suggestion.address || searchQuery;

      const newLat = parseFloat(lat).toFixed(6);
      const newLng = parseFloat(lng).toFixed(6);

      onChange({
        latitude: newLat,
        longitude: newLng,
        address: placeName,
      });

      if (markerInstance.current && mapInstance.current) {
        const pos = [parseFloat(lng), parseFloat(lat)];
        markerInstance.current.setLngLat(pos);
        mapInstance.current.flyTo({
          center: pos,
          zoom: 16,
          essential: true,
        });
      }

      setSearchQuery(placeName);
      setSuggestions([]);
      setShowSuggestions(false);
    };

    const fetchPlaceDetail = async (refId) => {
      try {
        const res = await fetch(
          `https://maps.vietmap.vn/api/place/v3?apikey=${apiKeySuggestPlace}&refid=${refId}`
        );
        const data = await res.json();
        
        if (data && data.lat && data.lng) {
          const newLat = parseFloat(data.lat).toFixed(6);
          const newLng = parseFloat(data.lng).toFixed(6);
          const placeName = data.display || data.name || data.address;

          onChange({
            latitude: newLat,
            longitude: newLng,
            address: placeName,
          });

          if (markerInstance.current && mapInstance.current) {
            const pos = [parseFloat(data.lng), parseFloat(data.lat)];
            markerInstance.current.setLngLat(pos);
            mapInstance.current.flyTo({
              center: pos,
              zoom: 16,
              essential: true,
            });
          }

          setSearchQuery(placeName);
        }
      } catch (error) {
        console.error("Lỗi tải chi tiết:", error);
        toast.error("Không thể tải thông tin địa điểm");
      } finally {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
          setShowSuggestions(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    useEffect(() => {
      return () => {
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }
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
          <div className="relative" ref={searchInputRef}>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={placeholder}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  className="w-full p-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
                {isLoadingSuggestions && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="px-4 py-3 hover:bg-orange-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0">
                        <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {suggestion.display || suggestion.name}
                        </p>
                        {suggestion.address && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {suggestion.address}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="relative">
          <div
            ref={mapRef}
            className="w-full h-80 border-2 border-orange-300 rounded-lg overflow-hidden shadow-sm"
            style={{ minHeight: "320px" }}
          >
            {(isLoadingScripts || (!mapReady && !mapError)) && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-10">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-orange-600 font-medium">Đang tải bản đồ...</p>
                </div>
              </div>
            )}

            {mapError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/90 text-red-600 p-4 text-center z-10">
                <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-bold text-lg">Lỗi tải bản đồ</p>
                <p className="text-sm mt-1">Kiểm tra API key hoặc mạng.</p>
              </div>
            )}
          </div>
        </div>

        {/* Chú thích */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
              <span className="text-gray-700">Vị trí hiện tại</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-white text-[8px] font-bold">
                PO
              </div>
              <span className="text-gray-700">Bưu cục ({postOffices.length})</span>
            </div>
          </div>
        </div>

        {address && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-orange-700">Địa chỉ:</span> {address}
            </p>
          </div>
        )}
      </div>
    );
  }
);

export default VietmapPicker;