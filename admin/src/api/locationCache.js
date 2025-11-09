import { fetchProvinces, fetchDistricts, fetchWards } from "./locationService";

const cache = {
  provinces: null,
  districts: new Map(), 
  wards: new Map(),     
};

export const getProvinces = async () => {
  if (cache.provinces) return cache.provinces;

  try {
    const data = await fetchProvinces();
    cache.provinces = Array.isArray(data) ? data : [];
    return cache.provinces;
  } catch (err) {
    console.error("Lỗi tải tỉnh:", err);
    cache.provinces = [];
    return [];
  }
};

export const getDistricts = async (provinceCode) => {
  if (!provinceCode) return [];
  const key = String(provinceCode);

  if (cache.districts.has(key)) {
    return cache.districts.get(key);
  }

  try {
    const data = await fetchDistricts(provinceCode);
    const result = Array.isArray(data) ? data : [];
    cache.districts.set(key, result);
    return result;
  } catch (err) {
    console.error(`Lỗi tải quận (tỉnh ${provinceCode}):`, err);
    cache.districts.set(key, []);
    return [];
  }
};

export const getWards = async (districtCode) => {
  if (!districtCode) return [];
  const key = String(districtCode);

  if (cache.wards.has(key)) {
    return cache.wards.get(key);
  }

  try {
    const data = await fetchWards(districtCode);
    const result = Array.isArray(data) ? data : [];
    cache.wards.set(key, result);
    return result;
  } catch (err) {
    console.error(`Lỗi tải phường (quận ${districtCode}):`, err);
    cache.wards.set(key, []);
    return [];
  }
};

export const preloadAllLocations = async () => {
  const provinces = await getProvinces();
  await Promise.all(provinces.map(p => getDistricts(p.code)));
};