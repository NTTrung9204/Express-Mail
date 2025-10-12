import React, { useState } from 'react'
import Sidebar from '../components/Sidebar';
import AddressModal from '../components/AddressModal';

const CreateOrderPage = () => {

  const [open, setOpen] = useState(true);

  return (
   
    
    <div className="bg-gray-50 min-h-screen p-6">
      <AddressModal open={open} onClose={()=>setOpen(false)}/>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
       <div className="lg:col-span-3 space-y-6">
          <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Thông tin người gửi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Số điện thoại *
                </label>
                <input
                  type="text"
                  placeholder="Nhập số điện thoại"
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên đầy đủ"
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Địa chỉ *</label>
              <input
                type="text"
                placeholder="Nhập địa chỉ"
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Lựa chọn lấy hàng
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="pickup" className="accent-orange-500" />
                    <span>Lấy hàng tại nơi ở người gửi</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="pickup" className="accent-orange-500" />
                    <span>Lấy hàng tại bưu điện</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Lịch trình lấy hàng
                </label>
                <select className="w-full border rounded-lg p-2">
                  <option>Chọn thời gian</option>
                </select>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Thông tin người nhận
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Số điện thoại *
                </label>
                <input
                  type="text"
                  placeholder="Nhập số điện thoại"
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tên đầy đủ *
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên đầy đủ"
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Địa chỉ *</label>
              <input
                type="text"
                placeholder="Nhập địa chỉ"
                className="w-full border rounded-lg p-2"
              />
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                Thông tin sản phẩm
              </h2>
              <button className="text-orange-500 text-sm font-medium hover:underline">
                + Thêm sản phẩm
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Sản phẩm 1</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tên sản phẩm
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập tên sản phẩm"
                    className="w-full border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Mã sản phẩm
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập mã sản phẩm"
                    className="w-full border rounded-lg p-2"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Cân nặng (grams)
                  </label>
                  <input
                    type="number"
                    defaultValue={200}
                    className="w-full border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Số lượng</label>
                  <input
                    type="number"
                    defaultValue={1}
                    className="w-full border rounded-lg p-2"
                  />
                </div>
              </div>
            </div>

            <button className="text-sm text-orange-500 hover:underline mt-2">
              + Sản phẩm đã có
            </button>
          </section>

          <div className="flex justify-end">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium">
              Tạo đơn hàng
            </button>
          </div>
        </div>

        <aside className="bg-white rounded-xl border border-gray-200 p-6 h-fit">
          <h2 className="text-lg font-semibold mb-4">Ước tính chi phí</h2>
          <div className="border border-gray-200 rounded-lg flex flex-col items-center justify-center h-40 mb-4 text-center text-gray-500 text-sm">
            Hoàn thành địa chỉ để ước tính chi phí giao hàng.
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>Khoảng cách: -- km</li>
            <li>Chi phí ước tính: $--</li>
            <li>Thời gian giao hàng: -- giờ</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}

export default CreateOrderPage