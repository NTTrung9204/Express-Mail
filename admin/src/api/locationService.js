import axios from 'axios';

const locationApi = axios.create({
  baseURL: import.meta.env.VITE_LOCATION_API_URL || 'https://api.vnappmob.com/api/v2/',
  timeout: 10000,
});

const extractResults = (res) => res.data.results || [];

export const fetchProvinces = async () => {
  try {
    const response = await locationApi.get('/province/');
    return extractResults(response).map(p => ({
      code: p.province_id,
      name: p.province_name,
    }));
  } catch (error) {
    console.error("Error loading provinces:", error.message);
    throw error;
  }
};

export const fetchDistricts = async (provinceCode) => {
  try {
    const response = await locationApi.get(`/province/district/${provinceCode}`); 
    return extractResults(response).map(d => ({
      code: d.district_id,
      name: d.district_name,
    }));
  } catch (error) {
    console.error("Error loading districts:", error.message);
    throw error;
  }
};

export const fetchWards = async (districtCode) => {
  try {
    const response = await locationApi.get(`/province/ward/${districtCode}`); 
    return extractResults(response).map(w => ({
      code: w.ward_id,
      name: w.ward_name,
    }));
  } catch (error) {
    console.error("Error loading wards:", error.message);
    throw error;
  }
};