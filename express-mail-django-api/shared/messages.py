from django.conf import settings

# Use this way instead of using translations for custom messages
_ERROR_MESSAGES = {
    "en": {
        "common": {
            "invalid_token": "Invalid token.",
            "invalid_basic_auth": "Invalid basic authentication credentials.",
            "not_authenticated": "Not authenticated.",
            "permission_denied": "Permission denied.",
            "validation_error": "Validation failed.",
        },
        "email_already_exists": "Email already exists.",
        "cannot_delete_superuser": "Can't delete superuser.",
        "username_already_exists": "Username already exists.",
        "active_shipping_rate_not_set": "There is currently no active shipping rate.",
        "capacity_required_when_vehicle_is_truck": "Capacity is required for vehicle 'truck'.",
        "path_not_found": "Path not found.",
        "no_post_office_near_by": "No post office near by this location.",
        "no_post_office_exist": "No post office exist.",
        "invalid_credentials": "Invalid credentials.",
    },
    "vi": {
        "common": {
            "invalid_token": "Token không hợp lệ.",
            "invalid_basic_auth": "Thông tin xác thực cơ bản không hợp lệ.",
            "not_authenticated": "Chưa xác thực.",
            "permission_denied": "Không có quyền truy cập.",
            "validation_error": "Kiểm tra dữ liệu thất bại.",
        },
        "email_already_exists": "Email đã tồn tại.",
        "cannot_delete_superuser": "Không thể xóa superuser.",
        "username_already_exists": "Username đã tồn tại.",
        "active_shipping_rate_not_set": "Mức phí vận chuyển chưa được thiết lập.",
        "capacity_required_when_vehicle_is_truck": "Cần tham số capacity khi phương tiện là 'truck'.",
        "path_not_found": "Không tìm thấy đường đi.",
        "no_post_office_near_by": "Không có bưu cục nào gần đây.",
        "no_post_office_exist": "Không tồn tại bưu cục nào trên hệ thống.",
        "invalid_credentials": "Thông tin xác thực không hợp lệ.",
    },
}

ERROR_MESSAGES = _ERROR_MESSAGES[settings.LANGUAGE_CODE]
