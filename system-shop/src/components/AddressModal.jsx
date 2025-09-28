import React from "react";
import { AnimatePresence, motion} from "framer-motion";

const AddressModal = ({ open, onClose }) => {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          {/* Nội dung modal có hiệu ứng scale */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-3xl cursor-pointer"
            >
              ×
            </button>

            <h2 className="text-xl font-semibold mb-6">Địa chỉ gửi</h2>

            <form className="space-y-4">

              <div className="bg-gray-200 rounded-xl p-3">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                    <label className="block mb-1 text-sm font-medium">
                        Số điện thoại người gửi/Cửa hàng*
                    </label>
                    <input
                        type="text"
                        className="bg-white w-full border-gray-300  focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none rounded-lg p-2"
                        placeholder="01234567890"
                    />
                    </div>
                    <div>
                    <label className="block mb-1 text-sm font-medium">
                        Tên người gửi/Cửa hàng*
                    </label>
                    <input
                        type="text"
                        className="bg-white w-full  focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none  rounded-lg p-2"
                        placeholder="Tên cửa hàng"
                    />
                    </div>
                </div>

                <div>
                    <label className="block mb-1 text-sm font-medium">
                    Địa chỉ gửi/cửa hàng*
                    </label>
                    <input
                    type="text"
                    className="bg-white w-full  focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none rounded-lg p-2 mb-4"
                    placeholder="K2/9, Đông Kè"
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                    <label className="block mb-1 text-sm font-medium">
                        Tỉnh - Thành Phố*
                    </label>
                    <input
                        type="text"
                        className="bg-white w-full focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none  rounded-lg p-2"
                        placeholder="Đà Nẵng"
                    />
                    </div>
                    <div>
                    <label className="block mb-1 text-sm font-medium">
                        Quận - Huyện*
                    </label>
                    <input
                        type="text"
                        className="bg-white w-full focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none  rounded-lg p-2"
                        placeholder="Liên Chiểu"
                    />
                    </div>
                    <div>
                    <label className="block mb-1 text-sm font-medium">
                        Phường - Xã*
                    </label>
                    <input
                        type="text"
                        className="bg-white w-full focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none  rounded-lg p-2"
                        placeholder="Hoà Khánh Bắc"
                    />
                    </div>
                </div>
              </div>


              <div className="bg-gray-200 rounded-xl p-3">
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="default" className="h-4 w-4 accent-amber-600" />
                    <label htmlFor="default" className="text-sm">
                    Đặt làm địa chỉ mặc định
                    </label>
                </div>
              </div>

              <div className="bg-gray-200 rounded-xl p-3">
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="return" className="h-4 w-4 accent-amber-600" />
                    <label htmlFor="return" className="text-sm">
                    Trả hàng/Chuyển hoàn về địa chỉ khác
                    </label>
                </div>
              </div>



              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 cursor-pointer"
                >
                  Xong
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddressModal;
