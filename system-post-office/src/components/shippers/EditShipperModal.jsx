import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Avatar,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  CircularProgress,
} from "@mui/material";
import { Close, CameraAlt, Cancel } from "@mui/icons-material";
import { toast } from "react-toastify";
import { updateShipper } from "../../api/shipperAPI";
import { fetchPermissionsByRoleName } from "../../api/permissionAPI";
import permissionsMapping from "../../data/permissions.json";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhoneNumber = (number) => /^\d{10}$/.test(number);
const isValidCardId = (id) => /^[0-9]{9,12}$/.test(id);

const EditShipperModal = ({ open, onClose, shipper, postOfficeId, onUpdated }) => {
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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // State cho permissions
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  // Load permissions khi modal mở
  useEffect(() => {
    const loadPermissions = async () => {
      if (!open) return;
      
      setLoadingPermissions(true);
      try {
        // Lấy permissions của role shipper
        const permissions = await fetchPermissionsByRoleName('shipper');
        
        if (permissions && Array.isArray(permissions)) {
          // Map permissions với tên tiếng việt từ file json
          const mappedPermissions = permissions.map(perm => {
            const mapping = permissionsMapping.find(p => p.name === perm.name);
            return {
              ...perm,
              name_vi: mapping ? mapping.name_vi : perm.name
            };
          });
          
          setAvailablePermissions(mappedPermissions);
        }
      } catch (error) {
        console.error("Lỗi khi tải permissions:", error);
        toast.error("Không thể tải danh sách quyền");
      } finally {
        setLoadingPermissions(false);
      }
    };

    loadPermissions();
  }, [open]);

  useEffect(() => {
    if (shipper && open) {
      setFormData({
        username: shipper.username || "",
        password: "", 
        confirmPassword: "", 
        firstName: shipper.firstName || "",
        lastName: shipper.lastName || "",
        email: shipper.email || "",
        phoneNumber: shipper.profile?.phoneNumber || "",
        address: shipper.profile?.address || "",
        motorModel: shipper.profile?.motorModel || "",
        licensePlateNumber: shipper.profile?.licensePlateNumber || "",
        cardId: shipper.profile?.cardId || "",
        avatar: null, 
      });
      setAvatarPreview(shipper.profile?.avatar || null);
      setErrors({});

      // Set selected permissions dựa vào excludePermissions
      if (availablePermissions.length > 0) {
        const excludedIds = shipper.excludePermissions || [];
        const selected = availablePermissions
          .filter(perm => !excludedIds.includes(perm.id))
          .map(perm => perm.id);
        setSelectedPermissions(selected);
      }
    }
  }, [shipper, open, availablePermissions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh!");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 5MB!");
      return;
    }

    setFormData((prev) => ({ ...prev, avatar: file }));
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setFormData((prev) => ({ ...prev, avatar: null }));
    setAvatarPreview(null);
  };

  const handlePermissionToggle = (permissionId) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};
    const {
      username,
      password,
      confirmPassword,
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      motorModel,
      licensePlateNumber,
      cardId,
    } = formData;

    if (!username.trim()) newErrors.username = "Tên đăng nhập không được để trống";
    if (!firstName.trim()) newErrors.firstName = "Họ không được để trống";
    if (!lastName.trim()) newErrors.lastName = "Tên không được để trống";
    if (!email.trim()) newErrors.email = "Email không được để trống";
    if (!phoneNumber.trim()) newErrors.phoneNumber = "Số điện thoại không được để trống";
    if (!address.trim()) newErrors.address = "Địa chỉ không được để trống";
    if (!motorModel.trim()) newErrors.motorModel = "Loại xe không được để trống";
    if (!licensePlateNumber.trim()) newErrors.licensePlateNumber = "Biển số xe không được để trống";
    if (!cardId.trim()) newErrors.cardId = "CCCD không được để trống";

    if (password) {
      if (password.length < 6) {
        newErrors.password = "Mật khẩu phải tối thiểu 6 kí tự";
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
      }
    } else if (confirmPassword) {
      newErrors.confirmPassword = "Vui lòng nhập mật khẩu mới";
    }

    if (email.trim() && !isValidEmail(email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (phoneNumber.trim() && !isValidPhoneNumber(phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại phải có 10 chữ số";
    }

    if (cardId.trim() && !isValidCardId(cardId)) {
      newErrors.cardId = "CCCD phải có 9-12 chữ số";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin bị lỗi!");
      return;
    }

    setLoading(true);
    try {
      // Tính toán excludePermissions: những quyền không được chọn
      const excludePermissions = availablePermissions
        .filter(perm => !selectedPermissions.includes(perm.id))
        .map(perm => perm.id);

      const dataToSend = {
        ...formData,
        excludePermissions
      };

      await updateShipper(postOfficeId, shipper.id, dataToSend);
      toast.success("Cập nhật shipper thành công!");
      onUpdated?.();
      onClose();
    } catch (error) {
      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const newErrors = {};
        
        if (apiErrors.user)
          Object.keys(apiErrors.user).forEach(
            (k) => (newErrors[k] = apiErrors.user[k][0])
          );

        if (apiErrors.profile)
          Object.keys(apiErrors.profile).forEach(
            (k) => (newErrors[k] = apiErrors.profile[k][0])
          );

        setErrors((prev) => ({ ...prev, ...newErrors })); 
        toast.error("Vui lòng kiểm tra lại thông tin");
      } else {
        toast.error(error.response?.data?.message || "Cập nhật thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle className="flex justify-between items-center border-b pb-4">
        <h2 className="text-2xl font-bold text-[#4b1d09]">Chỉnh sửa Shipper</h2>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent className="pt-6 mt-6">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar section */}
            <div className="flex flex-col items-center md:w-64">
              <div className="relative group">
                <Avatar
                  src={avatarPreview || "/default-avatar.png"}
                  alt="Avatar"
                  sx={{ width: 160, height: 160 }}
                  className="border-4 border-orange-200 shadow-lg"
                >
                  {!avatarPreview && <CameraAlt sx={{ fontSize: 60 }} />}
                </Avatar>

                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-2 right-2 bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full cursor-pointer shadow-lg transition-all"
                >
                  <CameraAlt />
                  <input
                    id="avatar-upload"
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
                    <Cancel fontSize="small" />
                  </button>
                )}
              </div>

              <p className="mt-4 text-sm text-gray-600 text-center">
                Nhấn vào biểu tượng máy ảnh để thay đổi
                <br />
                (Tối đa 5MB, PNG/JPG)
              </p>
            </div>

            {/* Form fields */}
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      errors.username ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-500 outline-none transition`}
                  />
                  {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu mới (tối thiểu 6 kí tự)
                  </label>
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-500 outline-none`}
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                {formData.password && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Xác nhận mật khẩu
                    </label>
                    <input
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        errors.confirmPassword ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-500 outline-none`}
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      errors.firstName ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-500 outline-none transition`}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      errors.lastName ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-500 outline-none transition`}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-500 outline-none transition`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại (10 số) <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      errors.phoneNumber ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-500 outline-none transition`}
                  />
                  {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      errors.address ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-500 outline-none transition`}
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại xe <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="motorModel"
                    value={formData.motorModel}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      errors.motorModel ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-500 outline-none transition`}
                  />
                  {errors.motorModel && <p className="text-red-500 text-xs mt-1">{errors.motorModel}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Biển số xe <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="licensePlateNumber"
                    value={formData.licensePlateNumber}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      errors.licensePlateNumber ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-500 outline-none transition uppercase`}
                    placeholder="VD: 59H1-12345"
                  />
                  {errors.licensePlateNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.licensePlateNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CCCD (9 hoặc 12 số) <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="cardId"
                    value={formData.cardId}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      errors.cardId ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-500 outline-none transition`}
                  />
                  {errors.cardId && <p className="text-red-500 text-xs mt-1">{errors.cardId}</p>}
                </div>
              </div>

              {/* Permissions section */}
              <div className="mt-6 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Quyền hạn
                </h3>
                
                {loadingPermissions ? (
                  <div className="flex justify-center py-4">
                    <CircularProgress size={24} />
                  </div>
                ) : (
                  <FormGroup>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
                      {availablePermissions.map((permission) => (
                        <FormControlLabel
                          key={permission.id}
                          control={
                            <Checkbox
                              checked={selectedPermissions.includes(permission.id)}
                              onChange={() => handlePermissionToggle(permission.id)}
                              sx={{
                                color: '#fb923c',
                                '&.Mui-checked': {
                                  color: '#f97316',
                                },
                              }}
                            />
                          }
                          label={
                            <span className="text-sm text-gray-700">
                              {permission.name_vi}
                            </span>
                          }
                        />
                      ))}
                    </div>
                  </FormGroup>
                )}
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <Button
                  onClick={onClose}
                  variant="outlined"
                  className="px-6 py-2"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  className="px-8 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium"
                >
                  {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditShipperModal;