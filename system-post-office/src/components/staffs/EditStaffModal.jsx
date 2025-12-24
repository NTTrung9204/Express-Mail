import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  CircularProgress,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { toast } from "react-toastify";
import { updateStaff } from "../../api/staffAPI";
import { fetchPermissionsByRoleName } from "../../api/permissionAPI";
import permissionsMapping from "../../data/permissions.json";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const EditStaffModal = ({ open, onClose, staff, postOfficeId, onUpdated }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  useEffect(() => {
    const loadPermissions = async () => {
      if (!open) return;
      
      setLoadingPermissions(true);
      try {
        const permissions = await fetchPermissionsByRoleName('post_office_staff');
        
        if (permissions && Array.isArray(permissions)) {
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
    if (staff && open) {
      setFormData({
        username: staff.username || "",
        password: "", 
        confirmPassword: "", 
        firstName: staff.firstName || "",
        lastName: staff.lastName || "",
        email: staff.email || "",
      });
      setErrors({});

      if (availablePermissions.length > 0) {
        const excludedIds = staff.excludePermissions || [];
        const selected = availablePermissions
          .filter(perm => !excludedIds.includes(perm.id))
          .map(perm => perm.id);
        setSelectedPermissions(selected);
      }
    }
  }, [staff, open, availablePermissions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
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
    } = formData;

    if (!username.trim()) newErrors.username = "Tên đăng nhập không được để trống";
    if (!firstName.trim()) newErrors.firstName = "Họ không được để trống";
    if (!lastName.trim()) newErrors.lastName = "Tên không được để trống";
    if (!email.trim()) newErrors.email = "Email không được để trống";

    if (password) {
      if (password.length < 6) {
        newErrors.password = "Mật khẩu phải tối thiểu 6 ký tự";
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
      const excludePermissions = availablePermissions
        .filter(perm => !selectedPermissions.includes(perm.id))
        .map(perm => perm.id);

      const dataToSend = {
        ...formData,
        profile: staff.profile,
        excludePermissions
      };

      await updateStaff(postOfficeId, staff.id, dataToSend);
      toast.success("Cập nhật nhân viên thành công!");
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="flex justify-between items-center border-b pb-4">
        <h2 className="text-2xl font-bold text-[#4b1d09]">Chỉnh sửa Nhân viên</h2>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent className="pt-6 mt-6">
        <form onSubmit={handleSubmit}>
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
                Mật khẩu mới (tối thiểu 6 ký tự)
              </label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Để trống nếu không đổi"
                className={`w-full px-4 py-2 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-500 outline-none`}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {formData.password && (
              <div>
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
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditStaffModal;