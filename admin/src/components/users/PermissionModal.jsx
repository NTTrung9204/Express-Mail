import React, { useEffect, useState } from "react";
import { Checkbox, Collapse } from "@mui/material";
import { ExpandMore, ExpandLess, LockOutlined } from "@mui/icons-material";
import { toast } from "react-toastify";
import { usePermissionStore } from "../../store/userPermissionStore";

const contentTypeNames = {
  1: "Quản trị viên (Admin)",
  2: "Trưởng bưu cục",
  3: "Nhân viên bưu cục",
  4: "Cửa hàng",
  5: "Shipper",
};

export default function PermissionModal({
  open,
  onClose,
  userPermissions,
  setUserPermissions,
  isView,
}) {
  const [openGroups, setOpenGroups] = useState({});
  const [isPermissionsLoading, setIsPermissionsLoading] = useState(false); // State loading mới
  
  const { groups, groupPermissions, fetchGroups, fetchGroupPermissions, loading, error } =
    usePermissionStore();

  // EFFECT 1: Lấy danh sách nhóm (chỉ chạy khi modal mở và chưa có nhóm)
  useEffect(() => {
    if (!open || loading) return;

    const loadGroups = async () => {
      // Chỉ gọi fetchGroups nếu chưa có dữ liệu nhóm
      if (groups.length === 0) {
        try {
          await fetchGroups();
        } catch (err) {
          // Xử lý lỗi nếu không tải được nhóm
          toast.error("Không thể tải dữ liệu nhóm: " + err.message);
        }
      }
    };

    loadGroups();
    // Phụ thuộc vào 'groups.length' để kích hoạt tải nhóm lần đầu
  }, [open, groups.length, fetchGroups, loading]);

  // EFFECT 2: Lấy chi tiết quyền của từng nhóm (chạy sau khi có groups)
  useEffect(() => {
    // Không chạy nếu modal đóng, chưa có groups hoặc đang loading group
    if (!open || groups.length === 0 || loading) return; 

    const loadPermissions = async () => {
      // Lọc ra các nhóm chưa có quyền (hoặc quyền rỗng)
      const groupsToFetch = groups.filter(
        (group) => !groupPermissions[group.id]?.length
      );

      if (groupsToFetch.length === 0) {
        setIsPermissionsLoading(false); // Đảm bảo loading tắt nếu không cần fetch
        return; 
      } 

      setIsPermissionsLoading(true); // Bắt đầu loading chi tiết quyền

      try {
        // Tạo các promise để fetch quyền cho các nhóm còn thiếu
        const fetchPromises = groupsToFetch.map((group) =>
          fetchGroupPermissions(group.id)
        );

        // Chờ tất cả các promise hoàn thành
        await Promise.all(fetchPromises);
      } catch (err) {
        // Xử lý lỗi nếu không tải được quyền
        toast.error("Không thể tải chi tiết quyền: " + err.message);
      } finally {
        setIsPermissionsLoading(false); // Kết thúc loading chi tiết quyền
      }
    };

    loadPermissions();
  }, [open, groups, groupPermissions, fetchGroupPermissions, loading]); // Thêm 'loading' để đợi groups fetch xong

  // Cập nhật trạng thái mở nhóm dựa trên quyền người dùng
  useEffect(() => {
    if (userPermissions?.length > 0) {
      const groupState = {};
      Object.entries(groupPermissions).forEach(([groupId, perms]) => {
        // Chỉ mở nhóm nếu nhóm đó có quyền được chọn bởi người dùng
        if (perms.some((p) => userPermissions.includes(p.id))) {
          groupState[groupId] = true;
        }
      });
      setOpenGroups(groupState);
    } else {
      setOpenGroups({});
    }
    // Lưu ý: Nếu groups.length = 0, groupPermissions sẽ rỗng, không gây lỗi.
  }, [groupPermissions, userPermissions]);

  const toggleGroup = (id) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleTogglePermission = (permId) => {
    if (isView) return; // Không cho phép thay đổi nếu ở chế độ xem
    
    if (userPermissions.includes(permId)) {
      setUserPermissions(userPermissions.filter((id) => id !== permId));
    } else {
      setUserPermissions([...userPermissions, permId]);
    }
  };

  // ... (handleToggleAll không đổi)

  const handleToggleAll = (groupId) => {
    if (isView) return; // Không cho phép thay đổi nếu ở chế độ xem

    const group = filteredGroupPermissions[groupId] || []; // Sử dụng quyền đã được lọc
    const allSelected = group.every((p) => userPermissions.includes(p.id));

    if (allSelected) {
      setUserPermissions(
        userPermissions.filter((id) => !group.some((p) => p.id === id))
      );
    } else {
      const newPermissions = group
        .filter((p) => !userPermissions.includes(p.id))
        .map((p) => p.id);
      setUserPermissions([...userPermissions, ...newPermissions]);
    }
  };

  if (!open) return null;

  // Lọc quyền theo contentTypeId thuộc [1, 2, 3, 4, 5]
  const validContentTypeIds = Object.keys(contentTypeNames).map(Number);
  const filteredGroupPermissions = {};
  Object.entries(groupPermissions).forEach(([groupId, perms]) => {
    filteredGroupPermissions[groupId] = perms.filter((perm) =>
      validContentTypeIds.includes(perm.contentTypeId)
    );
  });
  
  // Sắp xếp nhóm dựa trên thứ tự keys của contentTypeNames (1, 2, 3, 4, 5)
  const sortedGroups = groups.slice().sort((a, b) => {
    const aIndex = validContentTypeIds.indexOf(a.id);
    const bIndex = validContentTypeIds.indexOf(b.id);
    
    // Đảm bảo các nhóm không có trong contentTypeNames vẫn được hiển thị ở cuối
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1; // B đặt trước A
    if (bIndex === -1) return -1; // A đặt trước B
    
    return aIndex - bIndex;
  });

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white z-10 border-b p-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2">
            <LockOutlined className="text-orange-500" />
            Phân quyền người dùng {isView ? "(Xem)" : ""}
          </h2>
          <button
            onClick={onClose}
            className="text-3xl leading-none hover:text-orange-600"
            disabled={loading || isPermissionsLoading} // Disable khi đang tải
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          {loading && groups.length === 0 ? (
            // Chỉ hiển thị "Đang tải nhóm" nếu chưa có nhóm nào được tải
            <div className="text-center text-orange-500">Đang tải nhóm...</div>
          ) : isPermissionsLoading ? ( 
             // Hiển thị "Đang tải quyền" khi đang fetch chi tiết quyền
             <div className="text-center text-orange-500">Đang tải chi tiết quyền...</div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : sortedGroups.length === 0 ? (
            <div className="text-center text-gray-500">Không có nhóm quyền nào</div>
          ) : (
            sortedGroups.map((group) => {
              const groupName =
                contentTypeNames[group.id] || `Nhóm ${group.name}`;
              const permissions = filteredGroupPermissions[group.id] || [];
              
              // Chỉ hiển thị nhóm nếu có quyền hợp lệ
              if (permissions.length === 0) return null;
                
              const allChecked = permissions.every((p) =>
                userPermissions.includes(p.id)
              );
              const partiallyChecked =
                permissions.some((p) => userPermissions.includes(p.id)) &&
                !allChecked;
              const hasUserPermissionInGroup = permissions.some((p) =>
                userPermissions.includes(p.id)
              );


              return (
                <div
                  key={group.id}
                  className={`border rounded-xl overflow-hidden shadow-sm transition-colors ${
                    hasUserPermissionInGroup
                      ? "border-orange-500"
                      : "border-gray-200"
                  } bg-white`}
                >
                  <div
                    onClick={() => toggleGroup(group.id)}
                    className="flex justify-between items-center px-4 py-2 bg-gray-100 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {!isView && (
                        <Checkbox
                          color="warning"
                          checked={allChecked}
                          indeterminate={partiallyChecked}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleToggleAll(group.id);
                          }}
                        />
                      )}
                      <span className="font-medium">{groupName}</span>
                    </div>
                    {openGroups[group.id] ? <ExpandLess /> : <ExpandMore />}
                  </div>

                  <Collapse in={openGroups[group.id]} timeout="auto">
                    <div className="px-6 py-3 grid grid-cols-2 gap-y-2">
                      {permissions.map((perm) => (
                        <label
                          key={perm.id}
                          className={`flex items-center gap-2 select-none rounded-md px-2 py-1 ${!isView ? "cursor-pointer hover:bg-gray-50" : "cursor-default opacity-80"}`}
                          // Click label cũng toggle (nếu không phải chế độ xem)
                          onClick={!isView ? () => handleTogglePermission(perm.id) : undefined}
                        >
                          <Checkbox
                            color="warning"
                            disabled={isView}
                            checked={userPermissions.includes(perm.id)}
                            // Nếu đã dùng onClick trên label thì không cần onChange ở đây nữa
                            // Nhưng để an toàn khi click chính Checkbox:
                            onChange={!isView ? () => handleTogglePermission(perm.id) : undefined} 
                          />
                          {perm.name}
                        </label>
                      ))}
                    </div>
                  </Collapse>
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-end p-6 border-t bg-white sticky bottom-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            disabled={loading || isPermissionsLoading} // Disable khi đang tải
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}