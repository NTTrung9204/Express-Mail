import React, { useState, useEffect, useCallback } from "react";
import {
  PersonOff,
  LocalShipping,
  Add,
} from "@mui/icons-material";
import ConfirmModal from "../components/shippers/ConfirmModal";
import DeliveryScheduleModal from "../components/shippers/DeliveryScheduleModal";
import Pagination from "../components/common/Pagination";

import { fetchUserPostOfficeId } from '../api/profileAPI';
import { getShippersByPostOfficeId, createShipper } from '../api/shipperAPI';
import authAPI from "../api/authAPI";
import plansAPI from "../api/plansAPI";
import { toast } from "react-toastify";

const Shippers = () => {
  const [shippers, setShippers] = useState([]);   
  const [total, setTotal] = useState(0);                 
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ type: "", name: "" });
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedShipper, setSelectedShipper] = useState(null);
  const [postOfficeId, setPostOfficeId] = useState(null);

  const [scheduleData, setScheduleData] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "", 
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    motorModel: "",
    licensePlateNumber: "",
    cardId: "",
    avatar: null,
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const loadShippers = useCallback(async (id, currentPage = page, currentPageSize = pageSize) => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const response = await getShippersByPostOfficeId(id, currentPage, currentPageSize);
      if (response) {
        setShippers(response.results || []);
        setTotal(response.count || 0);
      } else {
        setError("Không thể tải dữ liệu shippers.");
      }
    } catch (e) {
      console.error("Lỗi khi tải shippers:", e);
      setError("Đã xảy ra lỗi khi kết nối API.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      
      const user = authAPI.getUser();
      const userId = user?.id; 

      if (!userId) {
        setError("Không tìm thấy User ID. Vui lòng đăng nhập lại.");
        setLoading(false);
        return;
      }

      const id = await fetchUserPostOfficeId(userId);
      
      if (id) {
        setPostOfficeId(id);
        loadShippers(id, 1, pageSize);
        setPage(1);
      } else {
        setError("Không thể xác định ID Bưu cục của người dùng.");
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    if (postOfficeId) {
      loadShippers(postOfficeId, page, pageSize);
    }
  }, [page, pageSize, postOfficeId, loadShippers]);

  const isShipperActive = (shipper) => true; 

  const getStatusDisplay = (shipper) => {
    return isShipperActive(shipper) ? "Hoạt động" : "Vô hiệu";
  };

  const openModal = (type, name) => {
    setModalContent({ type, name });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleConfirm = () => {
    console.log(`Đã xác nhận vô hiệu hóa: ${modalContent.name}`);
    setModalOpen(false);
    if (postOfficeId) loadShippers(postOfficeId, page, pageSize);
  };

  const fetchScheduleData = useCallback(async (shipperId, mode = '', startDate = '', endDate = '') => {
    if (!shipperId) return;

    setScheduleLoading(true);
    setScheduleData(null);
    try {
      const data = await plansAPI.getShippingPlanSteps(shipperId, mode, startDate, endDate);
      setScheduleData(data);
    } catch (error) {
      console.error("Lỗi khi tải lịch trình giao hàng:", error);
      setScheduleData([]);
    } finally {
      setScheduleLoading(false);
    }
  }, []);

  const openScheduleModal = (shipper) => {
    setSelectedShipper(shipper);
    setScheduleModalOpen(true);
    fetchScheduleData(shipper.id);
  };

  const closeScheduleModal = () => {
    setScheduleModalOpen(false);
    setSelectedShipper(null);
    setScheduleData(null);
  };

  const renderModalMessage = () => {
    switch (modalContent.type) {
      case "disable":
        return `Bạn có chắc muốn vô hiệu hóa tài khoản của ${modalContent.name}?`;
      default:
        return "";
    }
  };

  const validateField = (name, value, fullFormData = formData) => {
    const newErrors = { ...formErrors };
    delete newErrors[name]; 

    switch (name) {
      case 'username':
        if (!value.trim()) newErrors.username = "Username là bắt buộc";
        break;

      case 'password':
        if (!value.trim()) {
          newErrors.password = "Mật khẩu là bắt buộc";
        } else if (value.length < 6) {
          newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        }

        if (fullFormData.confirmPassword.trim()) {
          delete newErrors.confirmPassword;
          if (value !== fullFormData.confirmPassword) {
            newErrors.confirmPassword = "Xác nhận mật khẩu không khớp";
          }
        }
        break;

      case 'confirmPassword':
        if (!value.trim()) {
          newErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc";
        } else if (value !== fullFormData.password) {
          newErrors.confirmPassword = "Xác nhận mật khẩu không khớp";
        }
        break;

      case 'email':
        if (!value.trim()) {
          newErrors.email = "Email là bắt buộc";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = "Email không hợp lệ";
        }
        break;

      case 'phoneNumber':
        if (!value.trim()) {
          newErrors.phoneNumber = "Số điện thoại là bắt buộc";
        } else if (!/^[0-9]{10,11}$/.test(value)) {
          newErrors.phoneNumber = "Số điện thoại phải có 10-11 chữ số";
        }
        break;

      case 'cardId':
        if (!value.trim()) {
          newErrors.cardId = "Số CCCD là bắt buộc";
        } else if (!/^[0-9]{9,12}$/.test(value)) {
          newErrors.cardId = "Số CCCD phải có 9-12 chữ số";
        }
        break;

      case 'firstName':
      case 'lastName':
      case 'address':
      case 'motorModel':
      case 'licensePlateNumber':
        if (!value.trim()) {
          newErrors[name] = `${name === 'firstName' ? 'Họ' : name === 'lastName' ? 'Tên' : 
            name === 'address' ? 'Địa chỉ' : 
            name === 'motorModel' ? 'Loại xe' : 
            name === 'licensePlateNumber' ? 'Biển số xe' : name} là bắt buộc`;
        }
        break;

      default:
        break;
    }

    return newErrors;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      const newErrors = validateField(name, value, updated);
      
      setFormErrors(newErrors);
      return updated;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Vui lòng chọn file ảnh!");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước ảnh không được vượt quá 5MB!");
        return;
      }
      
      setFormData({ ...formData, avatar: file });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setFormData({ ...formData, avatar: null });
    setAvatarPreview(null);
    const fileInput = document.getElementById('avatar-input');
    if (fileInput) fileInput.value = '';
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) errors.username = "Username là bắt buộc";
    
    if (!formData.password.trim()) errors.password = "Mật khẩu là bắt buộc";
    else if (formData.password.length < 6) errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    
    if (!formData.confirmPassword.trim()) errors.confirmPassword = "Xác nhận mật khẩu là bắt buộc";
    else if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Xác nhận mật khẩu không khớp"; 

    if (!formData.firstName.trim()) errors.firstName = "Họ là bắt buộc";
    if (!formData.lastName.trim()) errors.lastName = "Tên là bắt buộc";
    
    if (!formData.email.trim()) errors.email = "Email là bắt buộc";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Email không hợp lệ";
    
    if (!formData.phoneNumber.trim()) errors.phoneNumber = "Số điện thoại là bắt buộc";
    else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber)) errors.phoneNumber = "Số điện thoại phải có 10-11 chữ số";
    
    if (!formData.address.trim()) errors.address = "Địa chỉ là bắt buộc";
    if (!formData.motorModel.trim()) errors.motorModel = "Loại xe là bắt buộc";
    if (!formData.licensePlateNumber.trim()) errors.licensePlateNumber = "Biển số xe là bắt buộc";
    
    if (!formData.cardId.trim()) errors.cardId = "Số CCCD là bắt buộc";
    else if (!/^[0-9]{9,12}$/.test(formData.cardId)) errors.cardId = "Số CCCD phải có 9-12 chữ số";

    return errors;
  };

  const isFormValid = () => {
    return formData.username.trim() &&
      formData.password.trim() &&
      formData.confirmPassword.trim() && 
      formData.firstName.trim() &&
      formData.lastName.trim() &&
      formData.email.trim() &&
      formData.phoneNumber.trim() &&
      formData.address.trim() &&
      formData.motorModel.trim() &&
      formData.licensePlateNumber.trim() &&
      formData.cardId.trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Vui lòng kiểm tra lại thông tin!");
      return;
    }
    
    if (!postOfficeId) {
      toast.error("Không xác định được ID bưu cục!");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { confirmPassword, ...dataToSend } = formData; 
      
      await createShipper(postOfficeId, dataToSend);
      toast.success("Tạo tài khoản shipper thành công!");
      
      setFormData({
        username: "",
        password: "",
        confirmPassword: "", 
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        address: "",
        motorModel: "",
        licensePlateNumber: "",
        cardId: "",
        avatar: null,
      });
      setFormErrors({});
      setAvatarPreview(null);
      
      const fileInput = document.getElementById('avatar-input');
      if (fileInput) fileInput.value = '';
      
      loadShippers(postOfficeId, page, pageSize);
    } catch (error) {
      console.error("Error creating shipper:", error);
      
      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const newErrors = {};
        
        if (apiErrors.user) {
          Object.keys(apiErrors.user).forEach(field => {
            const errorMessages = apiErrors.user[field];
            if (Array.isArray(errorMessages) && errorMessages.length > 0) {
              newErrors[field] = errorMessages[0];
            }
          });
        }
        
        if (apiErrors.profile) {
          Object.keys(apiErrors.profile).forEach(field => {
            const errorMessages = apiErrors.profile[field];
            if (Array.isArray(errorMessages) && errorMessages.length > 0) {
              newErrors[field] = errorMessages[0];
            }
          });
        }
        
        setFormErrors(newErrors);
        toast.error(error.response.data.message || "Kiểm tra dữ liệu thất bại!");
      } else {
        const errorMessage = error.response?.data?.message || "Đã xảy ra lỗi khi tạo tài khoản shipper!";
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#fff8f5] min-h-screen text-[#4b1d09]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#4b1d09]">Quản lý Shipper</h1>
        <p className="text-base text-[#7a4a32] mt-1">
          Quản lý tài khoản shipper thuộc bưu cục của bạn (ID: {postOfficeId || 'Đang tải...'})
        </p>
      </div>

      <div className="bg-white shadow-md rounded-xl p-5 mb-6 border border-orange-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[#4b1d09]">
            Danh sách tài khoản Shipper
          </h2>
        </div>

        {loading && (
          <div className="text-center py-10 text-[#7a4a32]">Đang tải danh sách Shipper...</div>
        )}

        {error && (
          <div className="text-center py-10 text-red-500 border border-red-200 bg-red-50 rounded-lg">{error}</div>
        )}

        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border-separate border-spacing-y-1">
                <thead>
                  <tr className="border-b border-orange-100 text-[#4b1d09]">
                    <th className="py-2 px-4 w-[15%] text-center">Tên</th>
                    <th className="py-2 px-4 w-[20%] text-center">Email</th>
                    <th className="py-2 px-4 w-[12%] text-center">Số điện thoại</th>
                    <th className="py-2 px-4 w-[15%] text-center">Biển số xe</th>
                    <th className="py-2 px-4 w-[10%] text-center">Trạng thái</th>
                    <th className="py-2 px-4 w-[28%] text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {shippers.length > 0 ? (
                    shippers.map((shipper) => {
                      const fullName = `${shipper.firstName} ${shipper.lastName}`;
                      const isActive = isShipperActive(shipper);

                      return (
                        <tr
                          key={shipper.id}
                          className="border-b border-orange-50 hover:bg-orange-50 transition-colors"
                        >
                          <td className="py-3 px-4 font-medium text-center">{fullName}</td>
                          <td className="px-4 text-center">{shipper.email || 'N/A'}</td>
                          <td className="px-4 text-center">{shipper.profile?.phoneNumber || 'N/A'}</td>
                          <td className="px-4 text-center">{shipper.profile?.licensePlateNumber || 'N/A'}</td>
                          <td className="px-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                isActive
                                  ? "bg-orange-500 text-white"
                                  : "bg-orange-100 text-orange-500"
                              }`}
                            >
                              {getStatusDisplay(shipper)}
                            </span>
                          </td>
                          <td className="px-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => openScheduleModal(shipper)}
                                className="flex items-center gap-1 px-3 py-1 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-xs cursor-pointer transition-all"
                              >
                                <LocalShipping fontSize="small" /> Xem lịch trình
                              </button>
                              <button
                                onClick={() => openModal("disable", fullName)}
                                className={`flex items-center gap-1 px-3 py-1 rounded-md text-white text-xs transition-all ${
                                  isActive
                                    ? "bg-red-500 hover:bg-red-600 cursor-pointer"
                                    : "bg-gray-400 cursor-not-allowed"
                                }`}
                                disabled={!isActive}
                              >
                                <PersonOff fontSize="small" /> Vô hiệu hóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-[#7a4a32]">
                        Bưu cục này chưa có Shipper nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {total > 0 && (
              <Pagination
                page={page}
                limit={pageSize}
                total={total}
                onPageChange={setPage}
                onLimitChange={setPageSize}
              />
            )}
          </>
        )}
      </div>

      <div className="bg-white shadow-md rounded-xl p-5 border border-orange-100">
        <h2 className="text-lg font-semibold text-[#4b1d09] mb-4">
          Tạo tài khoản Shipper
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 font-medium">Username <span className="text-red-500">*</span></label>
              <input
                name="username"
                type="text"
                placeholder="Nhập username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                  formErrors.username 
                    ? 'border-red-500 focus:ring-red-400' 
                    : 'border-orange-200 focus:ring-orange-400'
                }`}
              />
              {formErrors.username && (
                <p className="text-xs text-red-500 mt-1">{formErrors.username}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1 font-medium">Mật khẩu <span className="text-red-500">*</span></label>
              <input
                name="password"
                type="password"
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                value={formData.password}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                  formErrors.password 
                    ? 'border-red-500 focus:ring-red-400' 
                    : 'border-orange-200 focus:ring-orange-400'
                }`}
              />
              {formErrors.password && (
                <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>
              )}
            </div>

            <div className="col-span-2 md:col-span-1"> 
              <label className="block text-sm mb-1 font-medium">Xác nhận Mật khẩu <span className="text-red-500">*</span></label>
              <input
                name="confirmPassword"
                type="password"
                placeholder="Xác nhận lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                  formErrors.confirmPassword
                    ? 'border-red-500 focus:ring-red-400' 
                    : 'border-orange-200 focus:ring-orange-400'
                }`}
              />
              {formErrors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{formErrors.confirmPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1 font-medium">Họ <span className="text-red-500">*</span></label>
              <input
                name="firstName"
                type="text"
                placeholder="Nhập họ"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                  formErrors.firstName 
                    ? 'border-red-500 focus:ring-red-400' 
                    : 'border-orange-200 focus:ring-orange-400'
                }`}
              />
              {formErrors.firstName && (
                <p className="text-xs text-red-500 mt-1">{formErrors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1 font-medium">Tên <span className="text-red-500">*</span></label>
              <input
                name="lastName"
                type="text"
                placeholder="Nhập tên"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                  formErrors.lastName 
                    ? 'border-red-500 focus:ring-red-400' 
                    : 'border-orange-200 focus:ring-orange-400'
                }`}
              />
              {formErrors.lastName && (
                <p className="text-xs text-red-500 mt-1">{formErrors.lastName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1 font-medium">Email <span className="text-red-500">*</span></label>
              <input
                name="email"
                type="email"
                placeholder="Nhập email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                  formErrors.email 
                    ? 'border-red-500 focus:ring-red-400' 
                    : 'border-orange-200 focus:ring-orange-400'
                }`}
              />
              {formErrors.email && (
                <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1 font-medium">Số điện thoại <span className="text-red-500">*</span></label>
              <input
                name="phoneNumber"
                type="text"
                placeholder="Nhập số điện thoại (10-11 số)"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                  formErrors.phoneNumber 
                    ? 'border-red-500 focus:ring-red-400' 
                    : 'border-orange-200 focus:ring-orange-400'
                }`}
              />
              {formErrors.phoneNumber && (
                <p className="text-xs text-red-500 mt-1">{formErrors.phoneNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1 font-medium">Địa chỉ <span className="text-red-500">*</span></label>
              <input
                name="address"
                type="text"
                placeholder="Nhập địa chỉ"
                value={formData.address}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                  formErrors.address 
                    ? 'border-red-500 focus:ring-red-400' 
                    : 'border-orange-200 focus:ring-orange-400'
                }`}
              />
              {formErrors.address && (
                <p className="text-xs text-red-500 mt-1">{formErrors.address}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1 font-medium">Loại xe <span className="text-red-500">*</span></label>
              <input
                name="motorModel"
                type="text"
                placeholder="Nhập loại xe (VD: Honda Wave)"
                value={formData.motorModel}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                  formErrors.motorModel 
                    ? 'border-red-500 focus:ring-red-400' 
                    : 'border-orange-200 focus:ring-orange-400'
                }`}
              />
              {formErrors.motorModel && (
                <p className="text-xs text-red-500 mt-1">{formErrors.motorModel}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1 font-medium">Biển số xe <span className="text-red-500">*</span></label>
              <input
                name="licensePlateNumber"
                type="text"
                placeholder="Nhập biển số xe (VD: 30A-12345)"
                value={formData.licensePlateNumber}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                  formErrors.licensePlateNumber 
                    ? 'border-red-500 focus:ring-red-400' 
                    : 'border-orange-200 focus:ring-orange-400'
                }`}
              />
              {formErrors.licensePlateNumber && (
                <p className="text-xs text-red-500 mt-1">{formErrors.licensePlateNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1 font-medium">CCCD <span className="text-red-500">*</span></label>
              <input
                name="cardId"
                type="text"
                placeholder="Nhập số CCCD (9-12 số)"
                value={formData.cardId}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                  formErrors.cardId 
                    ? 'border-red-500 focus:ring-red-400' 
                    : 'border-orange-200 focus:ring-orange-400'
                }`}
              />
              {formErrors.cardId && (
                <p className="text-xs text-red-500 mt-1">{formErrors.cardId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1 font-medium">Ảnh đại diện</label>
              
              {!avatarPreview ? (
                <div className="relative">
                  <input
                    id="avatar-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="avatar-input"
                    className="flex items-center justify-center w-full h-[180px] border-2 border-dashed border-orange-200 rounded-lg px-3 text-sm cursor-pointer hover:border-orange-400 transition-colors bg-orange-50/30"
                  >
                    <div className="text-center">
                      <Add className="mx-auto text-orange-500 mb-2" fontSize="large" />
                      <p className="text-[#7a4a32] font-medium">Nhấn để chọn ảnh</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG (tối đa 5MB)</p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <div className="border-2 border-orange-200 rounded-lg overflow-hidden bg-gray-50 h-[180px] flex items-center justify-center">
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-md"
                    title="Xóa ảnh"
                  >
                    <PersonOff fontSize="small" />
                  </button>
                  <p className="text-xs text-[#7a4a32] mt-2 truncate">
                    {formData.avatar?.name}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-5">
            <button
              type="submit"
              disabled={!isFormValid() || isSubmitting || Object.keys(formErrors).length > 0} 
              className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                (isFormValid() && Object.keys(formErrors).length === 0) && !isSubmitting 
                  ? "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <Add fontSize="small" /> 
              {isSubmitting ? "Đang tạo..." : "Tạo tài khoản"}
            </button>
          </div>
        </form>
      </div>

      <ConfirmModal
        open={modalOpen}
        title="Xác nhận hành động"
        message={renderModalMessage()}
        onCancel={closeModal}
        onConfirm={handleConfirm}
      />

      <DeliveryScheduleModal
        open={scheduleModalOpen}
        shipper={selectedShipper}
        onClose={closeScheduleModal}
        routes={scheduleData}
        loading={scheduleLoading}
        fetchScheduleData={fetchScheduleData}
      />
    </div>
  );
};

export default Shippers;