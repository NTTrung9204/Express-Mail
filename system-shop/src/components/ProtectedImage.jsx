// components/ProtectedImage.jsx
import { useState, useEffect } from 'react';
import img_placeholder from "../assets/img_placeholder.jpg";

const ProtectedImage = ({ src, alt, className }) => {
  const [imageSrc, setImageSrc] = useState(img_placeholder);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!src) return;

    let objectUrl = null;

    const fetchImage = async () => {
      try {
        const token = localStorage.getItem('accessToken');

        const response = await fetch(src, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch image');

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setImageSrc(objectUrl);
      } catch (err) {
        console.error('Error loading protected image:', err);
        setImageSrc(img_placeholder);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  return (
    <img 
      src={imageSrc} 
      alt={alt} 
      className={className}
    />
  );
};

export default ProtectedImage;