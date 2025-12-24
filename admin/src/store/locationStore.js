import { useState, useEffect } from "react";
import { fetchProvinces, fetchDistricts, fetchWards } from "../api/locationService";

export const useLocationStore = () => {
  const [provinces, setProvinces] = useState([]);
  const [districtsMap, setDistrictsMap] = useState({});
  const [wardsMap, setWardsMap] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchProvinces();
        setProvinces(data);
      } catch (err) {
        console.error("Lỗi tải danh sách tỉnh/thành:", err);
      }
    })();
  }, []);

  const getDistricts = async (provinceCode) => {
    if (!provinceCode) return [];
    if (districtsMap[provinceCode]) return districtsMap[provinceCode];

    try {
      const data = await fetchDistricts(provinceCode);
      setDistrictsMap(prev => ({ ...prev, [provinceCode]: data }));
      return data;
    } catch (err) {
      console.error("Lỗi tải huyện:", err);
      return [];
    }
  };

  const getWards = async (districtCode) => {
    if (!districtCode) return [];
    if (wardsMap[districtCode]) return wardsMap[districtCode];

    try {
      const data = await fetchWards(districtCode);
      setWardsMap(prev => ({ ...prev, [districtCode]: data }));
      return data;
    } catch (err) {
      console.error("Lỗi tải xã/phường:", err);
      return [];
    }
  };

  const getNameByCode = (code, list) => {
    if (!code || !list) return code;
    const item = list.find(i => i.code === code);
    return item ? item.name : code;
  };

  return {
    provinces,
    getDistricts,
    getWards,
    getNameByCode,
  };
};
