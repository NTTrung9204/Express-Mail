from django.utils.translation import gettext_lazy as _
from django.conf import settings

# Use this way instead of using translations for custom messages
_ERROR_MESSAGES = {
    "en": {
        "common": {
            "invalid_token": _("Invalid token."),
            "invalid_basic_auth": _("Invalid basic authentication credentials."),
        }
    },
    "ja": {
        "common": {
            "invalid_token": _("トークンは無効です。"),
            "invalid_basic_auth": _("基本認証資格情報は無効です。"),
        }
    },
}

ERROR_MESSAGES = _ERROR_MESSAGES[settings.LANGUAGE_CODE]
