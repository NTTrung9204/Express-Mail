from rest_framework.views import exception_handler
from rest_framework.exceptions import ParseError, ValidationError, AuthenticationFailed, NotAuthenticated
from rest_framework_simplejwt.exceptions import InvalidToken

from shared.messages import ERROR_MESSAGES

EXCEPTION_MESSAGES = {
    ParseError: lambda exc, resp: {"message": str(exc)},
    ValidationError: lambda exc, resp: {
        "message": ERROR_MESSAGES["common"]["validation_error"],
        "errors": resp.data
    },
    (InvalidToken, AuthenticationFailed, NotAuthenticated): lambda exc, resp: {
        "message": ERROR_MESSAGES["common"]["invalid_token"]
    },
}


def custom_exception_handler(exc, context):
    """
    Custom exception handler.
    """

    # Let DRF build the default response first
    response = exception_handler(exc, context)

    if response is None:
        return response

    for exception_classes, handler in EXCEPTION_MESSAGES.items():
        if isinstance(exc, exception_classes):
            response.data = handler(exc, response)
            break

    return response
