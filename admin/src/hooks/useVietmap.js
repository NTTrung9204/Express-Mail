import { useEffect } from "react";

let isScriptLoaded = false;

export const useVietmap = (callback) => {
  useEffect(() => {
    const apiKey = import.meta.env.VITE_VIETMAP_API_KEY;
    if (!apiKey) {
      console.error("Missing VITE_VIETMAP_API_KEY");
      return;
    }

    if (isScriptLoaded && window.vietmapgl) {
      window.vietmapgl.accessToken = apiKey;
      callback?.();
      return;
    }

    const scriptId = "vietmap-gl-js";
    const cssId = "vietmap-gl-css";

    if (document.getElementById(scriptId)) {
      const check = setInterval(() => {
        if (window.vietmapgl) {
          clearInterval(check);
          window.vietmapgl.accessToken = apiKey;
          isScriptLoaded = true;
          callback?.();
        }
      }, 50);
      return;
    }

    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/@vietmap/vietmap-gl-js@6.0.0/dist/vietmap-gl.css";
      document.head.appendChild(link);
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://unpkg.com/@vietmap/vietmap-gl-js@6.0.0/dist/vietmap-gl.js";
    script.async = true;

    script.onload = () => {
      window.vietmapgl.accessToken = apiKey;
      isScriptLoaded = true;
      callback?.();
    };

    script.onerror = () => {
      console.error("Failed to load Vietmap GL JS");
    };

    document.body.appendChild(script);
  }, [callback]);
};