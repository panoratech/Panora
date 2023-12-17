from .base import BaseModel
from enum import Enum


class Method(Enum):
    GET = "GET"
    POST = "POST"
    PATCH = "PATCH"
    DELETE = "DELETE"
    PUT = "PUT"

    def list():
        return list(map(lambda x: x.value, Method._member_map_.values()))


class Data(dict):
    def __init__(self, *args, **kwargs):
        dict.__init__(self, *args, **kwargs)


class Headers(dict):
    def __init__(self, *args, **kwargs):
        dict.__init__(self, *args, **kwargs)


class PassThroughRequestDto(BaseModel):
    def __init__(
        self,
        path: str,
        method: Method,
        data: Data = None,
        headers_: Headers = None,
        **kwargs,
    ):
        """
        Initialize PassThroughRequestDto
        Parameters:
        ----------
            path: str
            method: str
            data: Data
            headers_: Headers
        """
        self.path = path
        self.method = self._enum_matching(method, Method.list(), "method")
        if data is not None:
            self.data = data
        if headers_ is not None:
            self.headers_ = headers_
