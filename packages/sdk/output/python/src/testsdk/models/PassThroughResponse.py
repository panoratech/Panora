from .base import BaseModel


class Data(dict):
    def __init__(self, *args, **kwargs):
        dict.__init__(self, *args, **kwargs)


class PassThroughResponse(BaseModel):
    def __init__(self, data: Data, status: float, url: str, **kwargs):
        """
        Initialize PassThroughResponse
        Parameters:
        ----------
            data: Data
            status: float
            url: str
        """
        self.data = data
        self.status = status
        self.url = url
