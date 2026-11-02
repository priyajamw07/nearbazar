from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        message = "An error occurred."
        if isinstance(response.data, dict):
            detail = response.data.get('detail', None)
            if detail:
                message = str(detail)
            else:
                first_key = next(iter(response.data))
                message = f"{first_key}: {response.data[first_key]}"
        elif isinstance(response.data, list) and len(response.data) > 0:
            message = str(response.data[0])

        response.data = {
            'success': False,
            'status_code': response.status_code,
            'message': message,
            'errors': response.data
        }
        return response

    return Response({
        'success': False,
        'status_code': status.HTTP_500_INTERNAL_SERVER_ERROR,
        'message': str(exc) or 'Internal Server Error'
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
