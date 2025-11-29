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
import { getShippersByPostOfficeId } from '../api/shipperAPI';
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

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
  });

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
    toast.success("Tạo tài khoản shipper thành công!");
    setFormData({
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      email: "",
    });
    if (postOfficeId) loadShippers(postOfficeId, page, pageSize);
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