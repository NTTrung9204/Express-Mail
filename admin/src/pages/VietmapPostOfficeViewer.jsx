import React, { useEffect, useRef, useState } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Chip 
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import { postOfficeService } from "../api/postOfficeService";

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

const VietmapPostOfficeViewer = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const postOfficeMarkersRef = useRef([]);
  const hasInitialized = useRef(false);

  const [postOffices, setPostOffices] = useState([]);
  const [isLoadingScripts, setIsLoadingScripts] = useState(true);
  const [isLoadingOffices, setIsLoadingOffices] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const apiKeyLoadMap = import.meta.env.VITE_VIETMAP_API_KEY_LOAD_MAP;

  useEffect(() => {
    const styleId = "vietmap-custom-style";
    if (!document.getElementById(styleId)) {
      const styleCustom = document.createElement('style');
      styleCustom.id = styleId;
      styleCustom.innerHTML = `
        .vietmapgl-popup {
          z-index: 9999 !important; 
        }
        .post-office-marker {
          transition: background 0.2s, box-shadow 0.2s;
        }
        .vietmapgl-popup-content {
          border-radius: 8px;
          padding: 0;
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        }
      `;
      document.head.appendChild(styleCustom);
    }
  }, []);

  useEffect(() => {
    if (hasInitialized.current || !apiKeyLoadMap) return;
    hasInitialized.current = true;

    loadCss("vietmap-gl-css", "https://unpkg.com/@vietmap/vietmap-gl-js@6.0.0/dist/vietmap-gl.css");
    loadScript("vietmap-gl-js", "https://unpkg.com/@vietmap/vietmap-gl-js@6.0.0/dist/vietmap-gl.js")
      .then(() => {
        setMapReady(true);
        setIsLoadingScripts(false);
      })
      .catch(() => setIsLoadingScripts(false));
  }, [apiKeyLoadMap]);

  useEffect(() => {
    const fetchPostOffices = async () => {
      setIsLoadingOffices(true);
      try {
        const response = await postOfficeService.getPostOffices(1, 100);
        if (response?.results) setPostOffices(response.results);
      } catch (error) {
        console.error("Lỗi API:", error);
      } finally {
        setIsLoadingOffices(false);
      }
    };
    fetchPostOffices();
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current || mapInstance.current) return;

    window.vietmapgl.accessToken = apiKeyLoadMap;
    const map = new window.vietmapgl.Map({
      container: mapRef.current,
      style: `https://maps.vietmap.vn/maps/styles/tm/style.json?apikey=${apiKeyLoadMap}`,
      center: [106.660172, 10.762622],
      zoom: 5,
    });

    mapInstance.current = map;

    map.on("load", () => {
      map.resize(); 
      if (postOffices.length > 0) addPostOfficeMarkers(postOffices);
    });

    const handleResize = () => map.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [mapReady, apiKeyLoadMap, postOffices]);

  const addPostOfficeMarkers = (offices) => {
    if (!mapInstance.current || !window.vietmapgl) return;

    postOfficeMarkersRef.current.forEach((m) => m.remove());
    postOfficeMarkersRef.current = [];

    const bounds = new window.vietmapgl.LngLatBounds();
    let hasPoint = false;

    offices.forEach((office) => {
      const lat = parseFloat(office.latitude);
      const lng = parseFloat(office.longitude);
      if (isNaN(lat) || isNaN(lng)) return;
      hasPoint = true;

      const el = document.createElement("div");
      el.className = "post-office-marker";
      el.style.cssText = `
        width: 32px; height: 32px;
        background: #1976d2; color: white;
        border: 2px solid #fff; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-weight: bold; font-size: 10px; cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        z-index: 1;
      `;
      el.innerHTML = "PO";

      const popup = new window.vietmapgl.Popup({
        offset: 35,
        closeButton: false,
        closeOnClick: false,
        maxWidth: '320px'
      });

      el.onmouseenter = () => {
        el.style.zIndex = "100";
        el.style.background = "#1565c0";
        el.style.boxShadow = "0 0 0 6px rgba(25, 118, 210, 0.2)";
        
        popup.setLngLat([lng, lat])
          .setHTML(`
            <div style="padding: 12px; font-family: 'Roboto', sans-serif;">
              <div style="font-weight: bold; color: #1976d2; margin-bottom: 6px; font-size: 15px; display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 18px;">📍</span> ${office.name}
              </div>
              <div style="font-size: 13px; color: #444; line-height: 1.5; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 8px;">
                ${office.address || "Chưa có địa chỉ"}
              </div>
              <div style="font-size: 11px; color: #888; display: flex; justify-content: space-between;">
                <span>ID: <strong>${office.id}</strong></span>
                <span>📌 ${lat.toFixed(4)}, ${lng.toFixed(4)}</span>
              </div>
            </div>
          `)
          .addTo(mapInstance.current);
      };

      el.onmouseleave = () => {
        el.style.zIndex = "1";
        el.style.background = "#1976d2";
        el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
        popup.remove();
      };

      const marker = new window.vietmapgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(mapInstance.current);

      postOfficeMarkersRef.current.push(marker);
      bounds.extend([lng, lat]);
    });

    if (hasPoint) {
      mapInstance.current.fitBounds(bounds, { padding: 80, maxZoom: 14 });
    }
  };

  return (
    <Box sx={{ 
      width: "100%", 
      height: "100vh", 
      position: "relative", 
      overflow: "hidden" 
    }}>
      <Paper 
        elevation={4} 
        sx={{ 
          position: "absolute", 
          top: 20, 
          left: 20, 
          zIndex: 100, 
          p: "10px 20px", 
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          gap: 2,
          border: "1px solid rgba(0,0,0,0.05)",
          bgcolor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(4px)"
        }}
      >
        <MapOutlinedIcon color="primary" sx={{ fontSize: 28 }} />
        <Box>
          <Typography variant="subtitle1" fontWeight="700" lineHeight={1.2}>
            Bản đồ Bưu cục Việt Nam
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Hệ thống quản lý kho & điểm nhận
          </Typography>
        </Box>
        <Chip 
          icon={<LocationOnIcon sx={{ fontSize: '16px !important' }} />} 
          label={`${postOffices.length} điểm`} 
          color="primary" 
          size="small"
          sx={{ fontWeight: 'bold', ml: 1 }}
        />
      </Paper>

      <Box 
        ref={mapRef} 
        sx={{ 
          width: "100%", 
          height: "100%" 
        }} 
      />

      {isLoadingScripts && (
        <Box sx={{ 
          position: "absolute", 
          inset: 0, 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          justifyContent: "center", 
          bgcolor: "#fff", 
          zIndex: 1000 
        }}>
          <CircularProgress size={40} thickness={4} />
          <Typography sx={{ mt: 2, fontWeight: 500, color: "text.secondary" }}>
            Đang tải bản đồ...
          </Typography>
        </Box>
      )}

      {isLoadingOffices && (
        <Box sx={{ position: "absolute", bottom: 20, right: 20, zIndex: 100 }}>
          <Paper sx={{ p: 1, borderRadius: "50%", display: "flex", bgcolor: "rgba(255,255,255,0.8)" }} elevation={2}>
            <CircularProgress size={20} />
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default VietmapPostOfficeViewer;