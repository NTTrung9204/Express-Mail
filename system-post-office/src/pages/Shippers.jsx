import React, { useState, useEffect, useCallback } from "react";
import {
  PersonOff,
  LocalShipping,
  Add,
} from "@mui/icons-material";
import { Avatar } from "@mui/material";
import { CameraAlt } from "@mui/icons-material";
import EditShipperModal from "../components/shippers/EditShipperModal";
import EditIcon from "@mui/icons-material/Edit";
import { Switch } from "@mui/material";
import DeliveryScheduleModal from "../components/shippers/DeliveryScheduleModal";
import Pagination from "../components/common/Pagination";
import ProtectedComponent from "../components/common/ProtectedComponent";

import { fetchUserPostOfficeId } from '../api/profileAPI';
import { getShippersByPostOfficeId, createShipper } from '../api/shipperAPI';
import { togglePostOfficeUserStatus } from '../api/postOfficeUserAPI';
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

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedShipper, setSelectedShipper] = useState(null);
  const [postOfficeId, setPostOfficeId] = useState(null);

  const [scheduleData, setScheduleData] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingShipper, setTogglingShipper] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingShipper, setEditingShipper] = useState(null);

  const [formData, setFormData] = useState({
    username: "",
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

  const fetchScheduleData = useCallback(async (shipperId, mode = 'pickup', startDate = '', endDate = '') => {
    if (!shipperId) return;

    setScheduleLoading(true);
    setScheduleData(null);
    try {
      const response = await plansAPI.getShippingPlanSteps(shipperId, mode, startDate, endDate);
      console.log("API Response:", response); // Debug log
      
      // Xử lý response structure từ API
      if (response && response.data) {
        setScheduleData(response.data);
      } else if (Array.isArray(response)) {
        setScheduleData(response);
      } else {
        setScheduleData([]);
      }
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

  const openEditModal = (shipper) => {
    setEditingShipper(shipper);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingShipper(null);
  };

  const handleShipperUpdated = () => {
    loadShippers(postOfficeId, page, pageSize);
  };

  const handleToggleShipperStatus = async (shipper) => {
    if (!postOfficeId || !shipper?.id) return;

    setTogglingShipper(shipper.id);
    try {
      const result = await togglePostOfficeUserStatus(
        postOfficeId,
        shipper.id,
        !shipper.isActive
      );

      if (result.success) {
        // Cập nhật state local
        setShippers((prev) =>
          prev.map((s) =>
            s.id === shipper.id ? { ...s, isActive: !s.isActive } : s
          )
        );
        toast.success(
          `Tài khoản shipper đã ${!shipper.isActive ? "kích hoạt" : "vô hiệu hóa"} thành công!`
        );
      } else {
        toast.error(result.message || "Không thể thay đổi trạng thái tài khoản");
      }
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái:", error);
      toast.error("Đã xảy ra lỗi khi thay đổi trạng thái tài khoản");
    } finally {
      setTogglingShipper(null);
    }
  };

  const validateField = (name, value) => {
    const newErrors = { ...formErrors };
    delete newErrors[name]; 

    switch (name) {
      case 'username':
        if (!value.trim()) newErrors.username = "Username là bắt buộc";
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
      const { ...dataToSend } = formData; 
      
      await createShipper(postOfficeId, dataToSend);
      toast.success("Tạo tài khoản shipper thành công!");
      
      setFormData({
        username: "",
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
                    <ProtectedComponent perm="post_offices.edit_user">
                      <th className="py-2 px-4 w-[18%] text-center">Trạng thái</th>
                    </ProtectedComponent>
                    <ProtectedComponent perm={["plan_external_app.can_view_shipping_plan", "post_offices.edit_user"]}>
                      <th className="py-2 px-4 w-[20%] text-center">Hành động</th>
                    </ProtectedComponent>
                  </tr>
                </thead>
                <tbody>
                  {shippers.length > 0 ? (
                    shippers.map((shipper) => {
                      const fullName = `${shipper.firstName} ${shipper.lastName}`;

                      return (
                        <tr
                          key={shipper.id}
                          className="border-b border-orange-50 hover:bg-orange-50 transition-colors"
                        >
                          <td className="py-3 px-4 font-medium text-center">{fullName}</td>
                          <td className="px-4 text-center">{shipper.email || 'N/A'}</td>
                          <td className="px-4 text-center">{shipper.profile?.phoneNumber || 'N/A'}</td>
                          <td className="px-4 text-center">{shipper.profile?.licensePlateNumber || 'N/A'}</td>
                          <ProtectedComponent perm="post_offices.edit_user">
                            <td className="px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Switch
                                  checked={shipper.isActive}
                                  onChange={() => handleToggleShipperStatus(shipper)}
                                  disabled={togglingShipper === shipper.id}
                                  color="success"
                                  size="small"
                                />
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    shipper.isActive
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {shipper.isActive ? "Hoạt động" : "Vô hiệu"}
                                </span>
                              </div>
                            </td>
                          </ProtectedComponent>
                          <td className="px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <ProtectedComponent perm="plan_external_app.can_view_shipping_plan">
                                <button
                                  onClick={() => openScheduleModal(shipper)}
                                  className="flex items-center gap-1 px-3 py-1 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-xs transition-all cursor-pointer"
                                >
                                  <LocalShipping fontSize="small" /> Lịch trình
                                </button>
                              </ProtectedComponent>
                              <ProtectedComponent perm="post_offices.edit_user">
                                <button
                                  onClick={() => openEditModal(shipper)}
                                  className="flex items-center gap-1 px-3 py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs transition-all cursor-pointer"
                                >
                                  <EditIcon fontSize="small" /> Sửa
                                </button>
                              </ProtectedComponent>
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
      <ProtectedComponent perm="post_offices.add_shipper">  
        <div className="bg-white shadow-md rounded-xl p-6 border border-orange-100">
          <h2 className="text-lg font-semibold text-[#4b1d09] mb-6">
            Tạo tài khoản Shipper
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center md:w-64">
                <div className="relative group">
                  <Avatar
                    src={avatarPreview || ""}
                    alt="Avatar"
                    sx={{ width: 160, height: 160 }}
                    className="border-4 border-orange-200 shadow-lg"
                  >
                    {!avatarPreview && <CameraAlt sx={{ fontSize: 60 }} />}
                  </Avatar>

                  <label
                    htmlFor="avatar-input"
                    className="absolute bottom-2 right-2 bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full cursor-pointer shadow-lg transition-all"
                  >
                    <CameraAlt />
                    <input
                      id="avatar-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-all"
                    >
                      <PersonOff fontSize="small" />
                    </button>
                  )}
                </div>

                <p className="mt-4 text-sm text-gray-600 text-center">
                  Nhấn vào biểu tượng máy ảnh để thêm ảnh
                  <br />
                  (Tối đa 5MB, PNG/JPG)
                </p>
              </div>

              {/* Form Fields - Bên phải */}
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="username"
                      type="text"
                      placeholder="Nhập username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        formErrors.username 
                          ? 'border-red-500' 
                          : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-500 outline-none transition`}
                    />
                    {formErrors.username && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="firstName"
                      type="text"
                      placeholder="Nhập họ"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        formErrors.firstName 
                          ? 'border-red-500' 
                          : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-500 outline-none transition`}
                    />
                    {formErrors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="lastName"
                      type="text"
                      placeholder="Nhập tên"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        formErrors.lastName 
                          ? 'border-red-500' 
                          : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-500 outline-none transition`}
                    />
                    {formErrors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="email"
                      type="email"
                      placeholder="Nhập email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        formErrors.email 
                          ? 'border-red-500' 
                          : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-500 outline-none transition`}
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại (10-11 số) <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="phoneNumber"
                      type="text"
                      placeholder="Nhập số điện thoại"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        formErrors.phoneNumber 
                          ? 'border-red-500' 
                          : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-500 outline-none transition`}
                    />
                    {formErrors.phoneNumber && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.phoneNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="address"
                      type="text"
                      placeholder="Nhập địa chỉ"
                      value={formData.address}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        formErrors.address 
                          ? 'border-red-500' 
                          : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-500 outline-none transition`}
                    />
                    {formErrors.address && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loại xe <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="motorModel"
                      type="text"
                      placeholder="Nhập loại xe (VD: Honda Wave)"
                      value={formData.motorModel}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        formErrors.motorModel 
                          ? 'border-red-500' 
                          : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-500 outline-none transition`}
                    />
                    {formErrors.motorModel && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.motorModel}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Biển số xe <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="licensePlateNumber"
                      type="text"
                      placeholder="VD: 59H1-12345"
                      value={formData.licensePlateNumber}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        formErrors.licensePlateNumber 
                          ? 'border-red-500' 
                          : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-500 outline-none transition uppercase`}
                    />
                    {formErrors.licensePlateNumber && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.licensePlateNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CCCD (9-12 số) <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="cardId"
                      type="text"
                      placeholder="Nhập số CCCD"
                      value={formData.cardId}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        formErrors.cardId 
                          ? 'border-red-500' 
                          : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-500 outline-none transition`}
                    />
                    {formErrors.cardId && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.cardId}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                  <button
                    type="button"
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all font-medium"
                    onClick={() => {
                      // Reset form if needed
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={!isFormValid() || isSubmitting || Object.keys(formErrors).length > 0}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
                      (isFormValid() && Object.keys(formErrors).length === 0) && !isSubmitting 
                        ? "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <Add fontSize="small" /> 
                    {isSubmitting ? "Đang tạo..." : "Tạo tài khoản"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </ProtectedComponent>

      <EditShipperModal
        open={editModalOpen}
        onClose={closeEditModal}
        shipper={editingShipper}
        postOfficeId={postOfficeId}
        onUpdated={handleShipperUpdated}
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