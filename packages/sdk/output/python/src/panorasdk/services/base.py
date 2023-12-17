"""
Creates a BaseService class.
Performs API calls,sets authentication tokens and handles http exceptions.

Class:
    BaseService
"""
from typing import List, Union
from enum import Enum
import re
from ..net.http_client import HTTPClient


class BaseService:
    """
    A class to represent a base serivce

    Attributes
    ----------
    _url_prefix : str
        The base URL

    Methods
    -------
    set_access_token(token: str) -> None:
        Sets bearer token key
    def _add_required_headers(headers: dict):
        Request authorization headers
    def set_base_url(url: str):
        Sets the base url
    """

    _url_prefix = "http://api.example.com"

    _http = HTTPClient(None)

    def __init__(self, access_token: str = "") -> None:
        """
        Initialize client

        Parameters:
        ----------
           access_token : str
                A Access access token
        """
        self._access_token = access_token

    def _pattern_matching(cls, value: str, pattern: str, variable_name: str):
        if re.match(r"{}".format(pattern), value):
            return value
        else:
            raise ValueError(f"Invalid value for {variable_name}: must match {pattern}")

    def _enum_matching(
        cls, value: Union[str, Enum], enum_values: List[str], variable_name: str
    ):
        str_value = value.value if isinstance(value, Enum) else value
        if str_value in enum_values:
            return value
        else:
            raise ValueError(
                f"Invalid value for {variable_name}: must match one of {enum_values}"
            )

    def set_base_url(self, url: str) -> None:
        """
        Sets the base URL

        Parameters:
        ----------
            url:
                The base URL
        """
        self._url_prefix = url

    def set_access_token(self, token: str) -> None:
        """
        Sets access token key

        Parameters
        ----------
        token: string
            Access token value
        """
        self._access_token = token

    def _add_required_headers(self, headers: dict):
        """
        Request authorization headers

        Parameters
        ----------
        headers: dict
            Headers dict to add auth headers to
        """
        headers["User-Agent"] = "liblab/0.1.28 PanoraSDK/1.0.0 python/2.7"
        headers["Authorization"] = f"Bearer {self._access_token}"
        return headers
