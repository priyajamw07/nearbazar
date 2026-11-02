import math
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class StandardMongoPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'total_pages': self.page.paginator.num_pages,
            'current_page': self.page.number,
            'page_size': self.get_page_size(self.request),
            'has_next': self.page.has_next(),
            'has_previous': self.page.has_previous(),
            'results': data
        })

def paginate_mongo_cursor(cursor_fn, page=1, page_size=20):
    page = max(1, int(page))
    page_size = max(1, min(100, int(page_size)))
    skip = (page - 1) * page_size

    total_count, items = cursor_fn(skip, page_size)
    total_pages = math.ceil(total_count / page_size) if total_count > 0 else 1

    return {
        'count': total_count,
        'total_pages': total_pages,
        'current_page': page,
        'page_size': page_size,
        'has_next': page < total_pages,
        'has_previous': page > 1,
        'results': items
    }
