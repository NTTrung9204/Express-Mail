import { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { fetchProvinces, fetchDistricts, fetchWards } from '../api/locationService';
import { orderService } from '../api/orderService';

export const useOrderCreationStore = () => {

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [loadingCreateOrder, setLoadingCreateOrder] = useState(false);

  useEffect(() => {
    setLoadingProvinces(true);
    fetchProvinces()
      .then(setProvinces)
      .catch(err => {
        console.error("Lỗi tải Tỉnh/Thành:", err);
        toast.error("Không thể tải danh sách Tỉnh/Thành.");
      })
      .finally(() => setLoadingProvinces(false));
  }, []);

  const fetchDistrictsAction = async (provinceCode) => {
    if (!provinceCode) {
      setDistricts([]);
      setWards([]);
      return;
    }
    setLoadingDistricts(true);
    try {
      const data = await fetchDistricts(provinceCode);
      setDistricts(data);
      setWards([]);
    } catch (error) {
      console.error("Lỗi tải Quận/Huyện:", error);
      toast.error("Không thể tải danh sách Quận/Huyện.");
    } finally {
      setLoadingDistricts(false);
    }
  };

  const fetchWardsAction = async (districtCode) => {
    if (!districtCode) {
      setWards([]);
      return;
    }
    setLoadingWards(true);
    try {
      const data = await fetchWards(districtCode);
      setWards(data);
    } catch (error) {
      console.error("Lỗi tải Phường/Xã:", error);
      toast.error("Không thể tải danh sách Phường/Xã.");
    } finally {
      setLoadingWards(false);
    }
  };

  const createOrderAction = async (orderDataFromComponent) => {
    setLoadingCreateOrder(true);

    try {
      const provinceName = provinces.find(
        p => p.code == orderDataFromComponent.receiver_province_city
      )?.name || "";
      
      const districtName = districts.find(
        d => d.code == orderDataFromComponent.receiver_district
      )?.name || "";
      
      const wardName = wards.find(
        w => w.code == orderDataFromComponent.receiver_ward_commune
      )?.name || "";

      const cleanedProducts = orderDataFromComponent.products.map(p => {
        const productPayload = {
          name: p.name,
          quantity: parseInt(p.quantity, 10) || 1,
          weight: parseFloat(p.weight) || 0.1,
          img_url: p.img_url 
        };

        if (!productPayload.img_url) {
          delete productPayload.img_url;
        }

        return productPayload;
      });

      const apiPayload = {
        ...orderDataFromComponent,

        receiver_province_city: provinceName,
        receiver_district: districtName,
        receiver_ward_commune: wardName,

        length: parseFloat(orderDataFromComponent.length) || null,
        width: parseFloat(orderDataFromComponent.width) || null,
        height: parseFloat(orderDataFromComponent.height) || null,
        weight: parseFloat(orderDataFromComponent.weight) || 0,
        cod: parseFloat(orderDataFromComponent.cod) || 0,

        products: cleanedProducts, 
      };

      const newOrder = await orderService.createOrder(apiPayload);
      
      return newOrder; 
      
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      throw error; 
    } finally {
      setLoadingCreateOrder(false);
    }
  };

  return {
    provinces,
    districts,
    wards,

    loadingProvinces,
    loadingDistricts,
    loadingWards,
    loadingCreateOrder,

    fetchDistrictsAction,
    fetchWardsAction,
    createOrderAction,
  };
};