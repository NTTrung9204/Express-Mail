import React, { useState, useEffect, useRef, useMemo } from 'react';
import { toast } from 'react-toastify';

import LocationOn from '@mui/icons-material/LocationOn';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';
import ViewInArOutlined from '@mui/icons-material/ViewInArOutlined';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import Add from '@mui/icons-material/Add';
import CameraAltOutlined from '@mui/icons-material/CameraAltOutlined';
import Close from '@mui/icons-material/Close';
import AttachMoney from '@mui/icons-material/AttachMoney';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import ExpandMore from '@mui/icons-material/ExpandMore';

import { useOrderCreationStore } from '../stores/useCreateOrderStore';
import VietmapPicker from '../components/VietmapPicker';

const LocationSelect = ({ label, value, onChange, options, loading, placeholder, disabled, name }) => (
  <div>
    <label className="block text-sm font-medium mb-1.5 text-gray-700">{label}</label>
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled || loading}
        className="w-full bg-gray-50 border border-orange-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none p-2.5 appearance-none pr-10 transition-colors"
      >
        <option value="">{loading ? "Đang tải..." : placeholder}</option>
        {options.map((option) => (
          <option key={option.code} value={option.code}>
            {option.name}
          </option>
        ))}
      </select>
      <ExpandMore className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  </div>
);

const ImageUploader = ({ previews = [], onChange, onRemove }) => {
  const inputId = useMemo(() => `file-upload-${Math.random()}`, []);
  
  return (
    <div className="w-full">
      <label htmlFor={inputId} className="cursor-pointer block">
        {previews.length > 0 ? (
          <div className="relative group w-full h-24 rounded-lg overflow-hidden border border-orange-300 bg-gray-100">
            <img 
              src={previews[0]} 
              alt="Ảnh sản phẩm"
              className="w-full h-full object-contain"
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onRemove(0);
              }}
              className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Close className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="w-full h-32 border-2 border-dashed border-orange-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
            <CameraAltOutlined className="w-8 h-8 mb-1" />
            <span className="text-sm font-medium">Tải ảnh lên</span>
            <span className="text-xs text-gray-400 mt-0.5">Tối đa 5MB</span>
          </div>
        )}
      </label>
      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onChange}
      />
    </div>
  );
};

const ProductItem = ({ product, index, onChange, onRemove, onImageChange, onImageRemove, errors }) => {
  useEffect(() => {
    return () => {
      if (product.localPreviews) {
        product.localPreviews.forEach(preview => URL.revokeObjectURL(preview));
      }
    };
  }, [product.localPreviews]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onImageChange(index, files[0]); 
    }
  };

  const removeImage = () => {
    onImageRemove(index);
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4 relative">
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="absolute top-0 right-0 w-7 h-7 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
      >
        <DeleteOutline className="w-5 h-5 mb-0.5 ml-0.5" />
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">
              Tên sản phẩm *
            </label>
            <input
              type="text"
              name="name"
              placeholder="Ví dụ: Laptop Dell XPS 13"
              value={product.name}
              onChange={(e) => onChange(index, e)}
              className={`w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:outline-none transition-colors ${
                errors.name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-orange-300 focus:ring-orange-500 focus:border-orange-500'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">
                Số lượng *
              </label>
              <input
                type="number"
                name="quantity"
                min="1"
                placeholder="1"
                value={product.quantity}
                onChange={(e) => onChange(index, e)}
                className={`w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:outline-none transition-colors ${
                  errors.quantity ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-orange-300 focus:ring-orange-500 focus:border-orange-500'
                }`}
              />
              {errors.quantity && (
                <p className="mt-1 text-xs text-red-600">{errors.quantity}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">
                Cân nặng (kg) *
              </label>
              <input
                type="number"
                name="weight"
                step="0.1"
                min="0.1"
                placeholder="1.2"
                value={product.weight}
                onChange={(e) => onChange(index, e)}
                className={`w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:outline-none transition-colors ${
                  errors.weight ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-orange-300 focus:ring-orange-500 focus:border-orange-500'
                }`}
              />
              {errors.weight && (
                <p className="mt-1 text-xs text-red-600">{errors.weight}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="md:col-span-1">
          <label className="block text-sm font-medium mb-1.5 text-gray-700">
            Hình ảnh {product.localPreviews?.length > 0 ? '(1)' : '(0)'}
          </label>
          <ImageUploader
            previews={product.localPreviews || []}
            onChange={handleFileChange}
            onRemove={removeImage}
          />
        </div>
      </div>
    </div>
  );
};

const CreateOrderPage = () => {
  const {
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
  } = useOrderCreationStore();

  const [orderData, setOrderData] = useState({
    receiver_name: "",
    receiver_phone: "",
    receiver_province_city: "",
    receiver_district: "",
    receiver_ward_commune: "",
    receiver_address: "",
    receiver_coordinate: "",
    length: "",
    width: "",
    height: "",
    weight: "",
    cod: 0,
    is_receiver_pay_shipping: false,
    products: [
      { name: "", quantity: 1, weight: "", img_urls: [], localPreviews: [] }
    ],
    order_status: "PENDING"
  });

  const [errors, setErrors] = useState({
    receiver_name: "",
    receiver_phone: "",
    province: "",
    district: "",
    ward: "",
    address: "",
    length: "",
    width: "",
    height: "",
    cod: "",
    products: [{ name: "", quantity: "", weight: "" }]
  });

  const [mapInfo, setMapInfo] = useState({
    latitude: 21.0285,
    longitude: 105.8542,
    address: ""
  });
  
  const vietmapPickerRef = useRef(null);

  useEffect(() => {
    const totalWeight = orderData.products.reduce((acc, product) => {
      const w = parseFloat(product.weight) || 0;
      const q = parseInt(product.quantity, 10) || 0;
      return acc + (w * q);
    }, 0);
    setOrderData(prev => ({ 
      ...prev, 
      weight: totalWeight > 0 ? totalWeight.toFixed(2) : "" 
    }));
  }, [orderData.products]);

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (!phone.trim()) return "Vui lòng nhập số điện thoại người nhận";
    if (cleaned.length !== 10) return "Số điện thoại phải có đúng 10 chữ số";
    if (!/^0[3-9][0-9]{8}$/.test(cleaned)) return "Số điện thoại không hợp lệ (bắt đầu bằng 03-09)";
    return "";
  };

  const validateDimension = (value, fieldName) => {
    const num = parseFloat(value);
    if (!value || isNaN(num) || num <= 0) {
      return `${fieldName} phải lớn hơn 0`;
    }
    return "";
  };

  const validateCod = (value) => {
    const num = parseInt(value, 10);
    if (value === "" || value === "0") return ""; 
    if (isNaN(num) || num < 0) return "Số tiền thu hộ không hợp lệ";
    if (num % 1000 !== 0) return "Số tiền thu hộ phải là bội số của 1.000";
    return "";
  };

  const validateForm = () => {
    const newErrors = {
      receiver_name: "",
      receiver_phone: "",
      province: "",
      district: "",
      ward: "",
      address: "",
      length: "",
      width: "",
      height: "",
      cod: "",
      products: orderData.products.map(() => ({}))
    };

    if (!orderData.receiver_name.trim()) {
      newErrors.receiver_name = "Vui lòng nhập tên người nhận";
    }

    newErrors.receiver_phone = validatePhone(orderData.receiver_phone);

    if (!orderData.receiver_province_city) newErrors.province = "Vui lòng chọn Tỉnh/Thành phố";
    if (!orderData.receiver_district) newErrors.district = "Vui lòng chọn Quận/Huyện";
    if (!orderData.receiver_ward_commune) newErrors.ward = "Vui lòng chọn Phường/Xã";
    if (!orderData.receiver_address.trim()) newErrors.address = "Vui lòng chọn địa chỉ cụ thể trên bản đồ";

    newErrors.length = validateDimension(orderData.length, "Chiều dài");
    newErrors.width = validateDimension(orderData.width, "Chiều rộng");
    newErrors.height = validateDimension(orderData.height, "Chiều cao");
    newErrors.cod = validateCod(orderData.cod);

    orderData.products.forEach((p, idx) => {
      newErrors.products[idx] = {
        name: !p.name.trim() ? "Vui lòng nhập tên sản phẩm" : "",
        quantity: !p.quantity || p.quantity < 1 ? "Số lượng phải lớn hơn 0" : "",
        weight: !p.weight || parseFloat(p.weight) <= 0 ? "Cân nặng phải lớn hơn 0" : ""
      };
    });

    setErrors(newErrors);

    const hasError = Object.values(newErrors).some(err => {
      if (typeof err === 'string') return !!err;
      if (Array.isArray(err)) return err.some(e => typeof e === 'object' ? Object.values(e).some(v => !!v) : !!e);
      if (typeof err === 'object') return Object.values(err).some(v => !!v);
      return false;
    });

    if (hasError) {
      toast.error("Vui lòng kiểm tra lại các trường thông tin bắt buộc");
    }

    return !hasError;
  };

  const handleSimpleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === "receiver_name") {
      setErrors(prev => ({ ...prev, receiver_name: value.trim() ? "" : "Vui lòng nhập tên người nhận" }));
    }
    if (name === "receiver_phone") {
      setErrors(prev => ({ ...prev, receiver_phone: validatePhone(value) }));
    }
    if (["length", "width", "height"].includes(name)) {
      setErrors(prev => ({ ...prev, [name]: validateDimension(value, name === "length" ? "Chiều dài" : name === "width" ? "Chiều rộng" : "Chiều cao") }));
    }
    if (name === "cod") {
      setErrors(prev => ({ ...prev, cod: validateCod(value) }));
    }

    setOrderData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    
    setOrderData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'receiver_province_city' && { receiver_district: '', receiver_ward_commune: '' }),
      ...(name === 'receiver_district' && { receiver_ward_commune: '' }),
    }));

    if (name === 'receiver_province_city') {
      setErrors(prev => ({ ...prev, province: "", district: "", ward: "" }));
      fetchDistrictsAction(value);
    }
    if (name === 'receiver_district') {
      setErrors(prev => ({ ...prev, district: "", ward: "" }));
      fetchWardsAction(value);
    }
    if (name === 'receiver_ward_commune') {
      setErrors(prev => ({ ...prev, ward: "" }));
    }
  };

  const handleMapChange = ({ latitude, longitude, address }) => {
    setOrderData(prev => ({
      ...prev,
      receiver_coordinate: `${latitude},${longitude}`,
      receiver_address: address || prev.receiver_address
    }));
    setMapInfo({ latitude, longitude, address });
    if (latitude && longitude && address) {
      setErrors(prev => ({ ...prev, address: "" }));
    }
  };

  const handleProductChange = (index, e) => {
    const { name, value } = e.target;
    const newProducts = [...orderData.products];
    newProducts[index] = { ...newProducts[index], [name]: value };

    const newProductErrors = [...errors.products];
    if (!newProductErrors[index]) newProductErrors[index] = {};
    if (name === "name") newProductErrors[index].name = value.trim() ? "" : "Vui lòng nhập tên sản phẩm";
    if (name === "quantity") newProductErrors[index].quantity = value >= 1 ? "" : "Số lượng phải lớn hơn 0";
    if (name === "weight") newProductErrors[index].weight = parseFloat(value) > 0 ? "" : "Cân nặng phải lớn hơn 0";
    setErrors(prev => ({ ...prev, products: newProductErrors }));

    setOrderData(prev => ({ ...prev, products: newProducts }));
  };

  const handleImageChange = (index, file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`File ${file.name} vượt quá 5MB`);
      return;
    }

    const newProducts = [...orderData.products];
    const currentProduct = { ...newProducts[index] };

    if (currentProduct.localPreviews && currentProduct.localPreviews.length > 0) {
      currentProduct.localPreviews.forEach(preview => URL.revokeObjectURL(preview));
    }

    const newPreview = URL.createObjectURL(file);
    currentProduct.img_urls = [file];
    currentProduct.localPreviews = [newPreview];
    newProducts[index] = currentProduct;

    setOrderData(prev => ({ ...prev, products: newProducts }));
  };

  const handleImageRemove = (productIndex) => {
    const newProducts = [...orderData.products];
    const currentProduct = newProducts[productIndex];

    if (currentProduct.localPreviews?.[0]) {
      URL.revokeObjectURL(currentProduct.localPreviews[0]);
    }

    currentProduct.img_urls = [];
    currentProduct.localPreviews = [];

    setOrderData(prev => ({ ...prev, products: newProducts }));
  };

  const addProduct = () => {
    setOrderData(prev => ({
      ...prev,
      products: [...prev.products, { name: "", quantity: 1, weight: "", img_urls: [], localPreviews: [] }]
    }));
    setErrors(prev => ({
      ...prev,
      products: [...prev.products, { name: "", quantity: "", weight: "" }]
    }));
  };

  const removeProduct = (index) => {
    const productToRemove = orderData.products[index];
    if (productToRemove.localPreviews) {
      productToRemove.localPreviews.forEach(preview => URL.revokeObjectURL(preview));
    }
    
    const newProducts = orderData.products.filter((_, i) => i !== index);
    if (newProducts.length === 0) {
      toast.warning("Phải có ít nhất 1 sản phẩm");
      return;
    }
    
    setOrderData(prev => ({ ...prev, products: newProducts }));
    setErrors(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const productsForAPI = orderData.products.map(p => ({
        name: p.name,
        quantity: p.quantity,
        weight: p.weight,
        img_url: p.img_urls[0] || null, 
      }));

      const dataToSend = {
        ...orderData,
        products: productsForAPI
      };

      await createOrderAction(dataToSend);
      
      toast.success("Tạo đơn hàng thành công!");

      setOrderData({
        receiver_name: "",
        receiver_phone: "",
        receiver_province_city: "",
        receiver_district: "",
        receiver_ward_commune: "",
        receiver_address: "",
        receiver_coordinate: "",
        length: "",
        width: "",
        height: "",
        weight: "",
        cod: 0,
        is_receiver_pay_shipping: false,
        products: [{ name: "", quantity: 1, weight: "", img_urls: [], localPreviews: [] }],
        order_status: "PENDING"
      });

      setMapInfo({ latitude: 21.0285, longitude: 105.8542, address: "" });
      setErrors({
        receiver_name: "", receiver_phone: "", province: "", district: "", ward: "", address: "",
        length: "", width: "", height: "", cod: "",
        products: [{ name: "", quantity: "", weight: "" }]
      });

    } catch (error) {
      // Xử lý lỗi từ NestJS API
      let errorMessage = "Tạo đơn hàng thất bại";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.statusText) {
        errorMessage = error.response.statusText;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      console.error("Create order error:", error);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-6">
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          
          <section className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <LocationOn className="w-6 h-6 text-orange-600" />
                Thông tin người nhận
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">Tên người nhận *</label>
                  <input
                    type="text"
                    name="receiver_name"
                    placeholder="Nhập tên người nhận"
                    value={orderData.receiver_name}
                    onChange={handleSimpleChange}
                    className={`w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:outline-none transition-colors ${
                      errors.receiver_name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-orange-300 focus:ring-orange-500 focus:border-orange-500'
                    }`}
                  />
                  {errors.receiver_name && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 002 0V6zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      {errors.receiver_name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">Số điện thoại *</label>
                  <div className="relative">
                    <PhoneOutlined className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      name="receiver_phone"
                      inputMode="numeric"
                      placeholder="Nhập số điện thoại người nhận"
                      value={orderData.receiver_phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        e.target.value = value;
                        handleSimpleChange(e);
                      }}
                      maxLength="10"
                      className={`w-full border rounded-lg p-2.5 pl-10 text-sm focus:ring-2 focus:outline-none transition-colors ${
                        errors.receiver_phone ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-orange-300 focus:ring-orange-500 focus:border-orange-500"
                      }`}
                    />
                  </div>
                  {errors.receiver_phone && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 002 0V6zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      {errors.receiver_phone}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <LocationSelect
                    label="Tỉnh/Thành phố *"
                    value={orderData.receiver_province_city}
                    onChange={handleLocationChange}
                    options={provinces}
                    loading={loadingProvinces}
                    placeholder="Chọn Tỉnh/Thành"
                    name="receiver_province_city"
                  />
                  {errors.province && <p className="mt-1 text-xs text-red-600">{errors.province}</p>}
                </div>
                <div>
                  <LocationSelect
                    label="Quận/Huyện *"
                    value={orderData.receiver_district}
                    onChange={handleLocationChange}
                    options={districts}
                    loading={loadingDistricts}
                    placeholder="Chọn Quận/Huyện"
                    name="receiver_district"
                    disabled={!orderData.receiver_province_city || loadingDistricts}
                  />
                  {errors.district && <p className="mt-1 text-xs text-red-600">{errors.district}</p>}
                </div>
                <div>
                  <LocationSelect
                    label="Phường/Xã *"
                    value={orderData.receiver_ward_commune}
                    onChange={handleLocationChange}
                    options={wards}
                    loading={loadingWards}
                    placeholder="Chọn Phường/Xã"
                    name="receiver_ward_commune"
                    disabled={!orderData.receiver_district || loadingWards}
                  />
                  {errors.ward && <p className="mt-1 text-xs text-red-600">{errors.ward}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">Địa chỉ cụ thể *</label>
                <VietmapPicker
                  ref={vietmapPickerRef}
                  latitude={mapInfo.latitude}
                  longitude={mapInfo.longitude}
                  address={mapInfo.address}
                  onChange={handleMapChange}
                />
                {errors.address && (
                  <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 002 0V6zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    {errors.address}
                  </p>
                )}
                <input type="hidden" name="receiver_address" value={orderData.receiver_address} />
                <input type="hidden" name="receiver_coordinate" value={orderData.receiver_coordinate} />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Inventory2Outlined className="w-6 h-6 text-orange-600" />
                Thông tin gói hàng
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">Dài (cm) *</label>
                  <input
                    type="number"
                    name="length"
                    step="0.1"
                    min="0.1"
                    placeholder="30"
                    value={orderData.length}
                    onChange={handleSimpleChange}
                    className={`w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:outline-none transition-colors ${
                      errors.length ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-orange-300 focus:ring-orange-500 focus:border-orange-500'
                    }`}
                  />
                  {errors.length && <p className="mt-1 text-xs text-red-600">{errors.length}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">Rộng (cm) *</label>
                  <input
                    type="number"
                    name="width"
                    step="0.1"
                    min="0.1"
                    placeholder="20"
                    value={orderData.width}
                    onChange={handleSimpleChange}
                    className={`w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:outline-none transition-colors ${
                      errors.width ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-orange-300 focus:ring-orange-500 focus:border-orange-500'
                    }`}
                  />
                  {errors.width && <p className="mt-1 text-xs text-red-600">{errors.width}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">Cao (cm) *</label>
                  <input
                    type="number"
                    name="height"
                    step="0.1"
                    min="0.1"
                    placeholder="10"
                    value={orderData.height}
                    onChange={handleSimpleChange}
                    className={`w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:outline-none transition-colors ${
                      errors.height ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-orange-300 focus:ring-orange-500 focus:border-orange-500'
                    }`}
                  />
                  {errors.height && <p className="mt-1 text-xs text-red-600">{errors.height}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">Tổng nặng (kg) *</label>
                  <input
                    type="number"
                    name="weight"
                    step="0.1"
                    min="0.1"
                    placeholder="Tự động"
                    value={orderData.weight}
                    readOnly
                    className="w-full border border-orange-300 rounded-lg p-2.5 text-sm bg-gray-100 outline-none cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ViewInArOutlined className="w-6 h-6 text-orange-600" />
                Sản phẩm ({orderData.products.length})
              </h2>
              <button
                type="button"
                onClick={addProduct}
                className="flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors cursor-pointer"
              >
                <Add className="w-5 h-5" />
                Thêm sản phẩm
              </button>
            </div>
            <div className="p-5 space-y-4">
              {orderData.products.map((product, index) => (
                <ProductItem
                  key={index}
                  product={product}
                  index={index}
                  onChange={handleProductChange}
                  onRemove={removeProduct}
                  onImageChange={handleImageChange}
                  onImageRemove={handleImageRemove}
                  errors={errors.products[index] || {}}
                />
              ))}
            </div>
          </section>

        </div>

        <aside className="lg:col-span-1 h-fit lg:sticky lg:top-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Thanh toán & Gửi</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">Thu hộ (COD)</label>
              <div className="relative flex">
                <div className="flex items-center px-3 bg-gray-100 border border-r-0 border-orange-300 rounded-l-lg">
                  <AttachMoney className="w-5 h-5 text-gray-500" />
                  <span className="ml-1 text-gray-600 text-sm font-medium">VND</span>
                </div>
                <input
                  type="number"
                  name="cod"
                  min="0"
                  step="1000"
                  placeholder="0"
                  value={orderData.cod}
                  onChange={handleSimpleChange}
                  className={`w-full border rounded-r-lg p-2.5 text-sm focus:ring-2 focus:outline-none transition-colors ${
                    errors.cod ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-orange-300 focus:ring-orange-500 focus:border-orange-500'
                  }`}
                />
              </div>
              {errors.cod && <p className="mt-1 text-xs text-red-600">{errors.cod}</p>}
            </div>

            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  id="is_receiver_pay_shipping"
                  name="is_receiver_pay_shipping"
                  type="checkbox"
                  checked={orderData.is_receiver_pay_shipping}
                  onChange={handleSimpleChange}
                  className="h-4 w-4 rounded border-orange-300 text-orange-600 focus:ring-2 focus:ring-orange-500 outline-none transition-colors cursor-pointer"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label htmlFor="is_receiver_pay_shipping" className="font-medium text-gray-900 cursor-pointer">
                  Người nhận trả phí
                </label>
                <p className="text-gray-500">Nếu không chọn, người gửi sẽ trả phí.</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tổng số lượng:</span>
                <span className="font-medium text-gray-900">
                  {orderData.products.reduce((acc, p) => acc + (parseInt(p.quantity, 10) || 0), 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tổng cân nặng:</span>
                <span className="font-medium text-gray-900">
                  {orderData.weight || 0} kg
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tổng số ảnh:</span>
                <span className="font-medium text-gray-900">
                  {orderData.products.reduce((acc, p) => acc + (p.img_urls?.length || 0), 0)}
                </span>
              </div>
              <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-100">
                <span className="text-gray-900">Thu hộ (COD):</span>
                <span className="text-orange-600">
                  {new Intl.NumberFormat('vi-VN').format(orderData.cod || 0)} đ
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingCreateOrder}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-orange-300 cursor-pointer disabled:cursor-not-allowed"
            >
              {loadingCreateOrder ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang tạo đơn...
                </span>
              ) : (
                "Tạo đơn hàng"
              )}
            </button>
          </div>
        </aside>

      </form>
    </div>
  );
}

export default CreateOrderPage;