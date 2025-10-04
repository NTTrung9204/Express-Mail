import axios from 'axios';

const locationApi = axios.create({
  baseURL: import.meta.env.VITE_LOCATION_API_URL
});

export const fetchProvinces = async () => {
  try {
    const response = await locationApi.get('/p/');
    return response.data;
  } catch (error) {
    console.error("Error loading provinces:", error);
    throw error;
  }
};

export const fetchDistricts = async (provinceCode) => {
  try {
    const response = await locationApi.get(`/p/${provinceCode}`, {
      params: { depth: 2 }
    });
    return response.data.districts || [];
  } catch (error) {
    console.error("Error loading districts:", error);
    throw error;
  }
};

export const fetchWards = async (districtCode) => {
  try {
    const response = await locationApi.get(`/d/${districtCode}`, {
      params: { depth: 2 }
    });
    return response.data.wards || [];
  } catch (error) {
    console.error("Error loading wards:", error);
    throw error;
  }
};