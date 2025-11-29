import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { PersonOff, Add, Security } from "@mui/icons-material";
import ConfirmModal from "../components/staffs/ConfirmModal";
import Pagination from "../components/common/Pagination";
import PermissionModal from "../components/staffs/PermissionModal";
import { getStaffsByPostOfficeId } from "../api/staffAPI";
import { fetchUserPostOfficeId } from '../api/profileAPI';
import authAPI from "../api/authAPI";

const Staffs = () => {
  const [showModal, setShowModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [modalContent, setModalContent] = useState({ title: "", message: "" });
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
  });
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [postOfficeId, setPostOfficeId] = useState(null);

  const fetchStaffs = useCallback(async (id, currentPage = page, currentLimit = limit) => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const response = await getStaffsByPostOfficeId(id, currentPage, currentLimit);
      if (response) {
        setStaffs(response.results || []);
        setTotal(response.count || 0);
      } else {
        setError("Không thể tải dữ liệu nhân viên.");
      }
    } catch (e) {
      console.error("Lỗi khi tải nhân viên:", e);
      toast.error("Đã xảy ra lỗi khi kết nối API.");
      setError("Đã xảy ra lỗi khi kết nối API.");
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

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
        fetchStaffs(id, 1, limit);
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
      fetchStaffs(postOfficeId, page, limit);
    }
  }, [page, limit, postOfficeId, fetchStaffs]);

  const handleDisable = (staff) => {
    setModalContent({
      title: "Xác nhận vô hiệu hóa",
      message: `Bạn có chắc chắn muốn vô hiệu hóa tài khoản của ${staff.firstName} ${staff.lastName} không?`,
    });
    setSelectedStaff(staff);
    setShowModal(true);
  };

  const confirmAction = () => {
    setShowModal(false);
    toast.success("Tài khoản đã được vô hiệu hóa!");
    // TODO: Call API to disable staff
    if (postOfficeId) fetchStaffs(postOfficeId, page, limit);
  };

  const handleOpenPermission = (staff) => {
    setSelectedStaff(staff);
    setShowPermissionModal(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isFormValid =
    formData.username &&
    formData.password &&
    formData.firstName &&
    formData.lastName &&
    formData.email;

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Tạo tài khoản nhân viên thành công!");
    setFormData({
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      email: "",
    });
    // TODO: Call API to create staff
    if (postOfficeId) fetchStaffs(postOfficeId, page, limit);
  };

  return (
    <div className="bg-[#fff8f5] min-h-screen text-[#4b1d09]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#4b1d09]">Quản lý Nhân viên</h1>
        <p className="text-base text-[#7a4a32] mt-1">
          Quản lý tài khoản nhân viên trong hệ thống (ID Bưu cục: {postOfficeId || 'Đang tải...'})
        </p>
      </div>

      <div className="bg-white shadow-md rounded-xl p-5 mb-6 border border-orange-100">
        <h2 className="text-lg font-semibold text-[#4b1d09] mb-4">
          Danh sách tài khoản Nhân viên
        </h2>

        {loading && (
          <div className="text-center py-10 text-[#7a4a32]">Đang tải danh sách Nhân viên...</div>
        )}

        {error && (
          <div className="text-center py-10 text-red-500 border border-red-200 bg-red-50 rounded-lg">{error}</div>
        )}

        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-center border-b border-orange-100 text-[#4b1d09]">
                    <th className="py-2 px-2">Tên</th>
                    <th className="py-2 px-2">Username</th>
                    <th className="py-2 px-2">Email</th>
                    <th className="py-2 px-2">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {staffs.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-gray-500">
                        Không có nhân viên nào
                      </td>
                    </tr>
                  ) : (
                    staffs.map((staff) => (
                      <tr
                        key={staff.id}
                        className="border-b border-orange-50 hover:bg-orange-50 transition-colors"
                      >
                        <td className="py-3 px-2 text-center">
                          {staff.firstName} {staff.lastName}
                        </td>
                        <td className="px-2 text-center">{staff.username}</td>
                        <td className="px-2 text-center">{staff.email}</td>
                        <td className="px-2">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenPermission(staff)}
                              className="flex items-center gap-1 px-3 py-1 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-xs transition cursor-pointer"
                            >
                              <Security fontSize="small" /> Phân quyền
                            </button>
                            <button
                              onClick={() => handleDisable(staff)}
                              className="flex items-center gap-1 px-3 py-1 rounded-md bg-red-500 hover:bg-red-600 text-white text-xs transition cursor-pointer"
                            >
                              <PersonOff fontSize="small" /> Vô hiệu hóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {total > 0 && (
              <Pagination
                page={page}
                limit={limit}
                total={total}
                onPageChange={setPage}
                onLimitChange={setLimit}
              />
            )}
          </>
        )}
      </div>

      <div className="bg-white shadow-md rounded-xl p-5 border border-orange-100">
        <h2 className="text-lg font-semibold text-[#4b1d09] mb-4">
          Tạo tài khoản Nhân viên
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Username</label>
            <input
              name="username"
              type="text"
              placeholder="Nhập username"
              value={formData.username}
              onChange={handleChange}
              className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Mật khẩu</label>
            <input
              name="password"
              type="password"
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Họ</label>
            <input
              name="firstName"
              type="text"
              placeholder="Nhập họ"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Tên</label>
            <input
              name="lastName"
              type="text"
              placeholder="Nhập tên"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm mb-1">Email</label>
            <input
              name="email"
              type="email"
              placeholder="Nhập email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>
        </div>

        <div className="flex justify-end mt-5">
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              isFormValid
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Add fontSize="small" /> Tạo tài khoản
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showModal}
        title={modalContent.title}
        message={modalContent.message}
        onConfirm={confirmAction}
        onCancel={() => setShowModal(false)}
      />

      <PermissionModal
        isOpen={showPermissionModal}
        staff={selectedStaff}
        onClose={() => setShowPermissionModal(false)}
        onSave={(permissions) => {
          toast.success("Cập nhật quyền thành công!");
          setShowPermissionModal(false);
        }}
      />
    </div>
  );
};

export default Staffs;