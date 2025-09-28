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
    },
}

ERROR_MESSAGES = _ERROR_MESSAGES[settings.LANGUAGE_CODE]
