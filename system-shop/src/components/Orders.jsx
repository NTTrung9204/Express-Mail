import React from 'react'
import EmptyState from "./EmptyState";

const orders = [
  {
    id: "GHN001234567",
    code: "GHN12345678901",
    name: "Nguyễn Thị Lan",
    phone: "0987654321",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    cod: "200,000 đ",
    weight: "1,100 g",
    payer: "Bên nhận trả phí",
    total: "215,000 đ",
    note: "Gọi trước khi đến",
    status: "Đang giao hàng",
  },
  {
    id: "GHN001234568",
    code: "GHN12345678902",
    name: "Trần Văn Minh",
    phone: "0912345678",
    address: "456 Đường XYZ, Quận 3, TP.HCM",
    cod: "150,000 đ",
    weight: "800 g",
    payer: "Bên gửi trả phí",
    total: "162,000 đ",
    note: "Hàng dễ vỡ",
    status: "Đang giao hàng",
  },
  {
    id: "GHN001234569",
    code: "GHN12345678903",
    name: "Lê Thị Hoa",
    phone: "0969876543",
    address: "789 Đường DEF, Quận 7, TP.HCM",
    cod: "300,000 đ",
    weight: "1,500 g",
    payer: "Bên nhận trả phí",
    total: "318,000 đ",
    note: "Giao trong giờ hành chính",
    status: "Đang giao hàng",
  },
];

const Orders = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {orders.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="bg-white rounded-xl shadow border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-3 w-10">
                  <input type="checkbox" />
                </th>
                <th className="p-3 w-14">STT</th>
                <th className="p-3">Mã đơn hàng</th>
                <th className="p-3">Thông tin người nhận</th>
                <th className="p-3">Hình thức thanh toán</th>
                <th className="p-3">Số tiền thu hộ</th>
                <th className="p-3">Khối lượng (g)</th>
                <th className="p-3">Thông tin thanh toán</th>
                <th className="p-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, idx) => (
                <tr key={o.id} className="border-t border-gray-200">
                  <td className="p-3 text-center">
                    <input type="checkbox" />
                  </td>
                  <td className="p-3">{idx + 1}</td>
                  <td className="p-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-orange-600 font-semibold hover:underline cursor-pointer">
                        {o.id}
                      </span>
                      <span className="text-xs text-gray-500">
                        Mã vận đơn: {o.code}
                      </span>
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded w-max">
                        {o.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{o.name}</div>
                    <div className="text-gray-600">{o.phone}</div>
                    <div className="text-gray-600 text-sm">{o.address}</div>
                    <div className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded w-max mt-1">
                      {o.note}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded">
                      COD
                    </span>
                  </td>
                  <td className="p-3 text-red-600 font-semibold">{o.cod}</td>
                  <td className="p-3">{o.weight}</td>
                  <td className="p-3">
                    <div
                      className={`font-medium ${
                        o.payerColor === "green"
                          ? "text-green-600"
                          : "text-gray-700"
                      }`}
                    >
                      {o.payer}
                    </div>
                    <div className="text-green-600 font-semibold">
                      Tổng: {o.total}
                    </div>
                    <div className="text-xs text-gray-500">
                      (Bao gồm COD + phí vận chuyển)
                    </div>
                  </td>
                  <td className="p-3 space-x-2">
                    <button className="px-2 py-1 border rounded hover:bg-gray-100 text-sm">
                      Chỉnh sửa
                    </button>
                    <button className="px-2 py-1 border rounded hover:bg-gray-100 text-sm">
                      Tra cứu
                    </button>
                    <button className="px-2 py-1 border rounded hover:bg-gray-100 text-sm">
                      In vận đơn
                    </button>
                    <button className="px-2 py-1 border rounded hover:bg-gray-100 text-sm">
                      Đánh giá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center p-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Hiển thị 1-3 của 28 đơn hàng
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 border rounded hover:bg-gray-100">
                Trước
              </button>
              <button className="px-3 py-1 bg-orange-500 text-white rounded">
                1
              </button>
              <button className="px-3 py-1 border rounded hover:bg-gray-100">
                2
              </button>
              <button className="px-3 py-1 border rounded hover:bg-gray-100">
                3
              </button>
              <button className="px-3 py-1 border rounded hover:bg-gray-100">
                Sau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders