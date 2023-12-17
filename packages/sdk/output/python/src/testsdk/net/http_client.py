from time import sleep
import requests
from http_exceptions import HTTPException, client_exceptions, server_exceptions
from json import JSONDecodeError
from .http_content_types import multipart_form_data_request
from .utils import to_serialize, rename_reserved_keys, rename_to_reserved_keys


class HTTPClient:
    """
    Provides functionality for invoking HTTP-based API calls to web services.
    """

    _retry_codes = [500, 503, 504]
    """list[int]: A list of status codes that invoke a retry."""

    _initial_delay = 150
    """int: The delay (in milliseconds) before performing a retry."""

    _max_retries = 3
    """int: The maximum number of retries."""

    def __init__(self, hook):
        self._hook = hook

    def _make_http_request(self, method, endpoint_url, headers, body_input):
        """
        Places API calls according to the HTTP method and content type.

        Parameters:
        ----------
            method : str
                The type of http call to perform
            endpoint_url : url
                The endpoint url to make the http call on
            headers : dict
                The http call's headers
            body_input : Any
                The request's body
        """
        request_method = getattr(requests, method)
        serialized_body = rename_to_reserved_keys(to_serialize(body_input))
        if "Content-type" in headers:
            data_type, subtype = headers["Content-type"].split("/")
            if data_type == "multipart":
                return multipart_form_data_request(
                    method, endpoint_url, headers, serialized_body
                )
            if data_type in ["text", "image"]:
                return request_method(
                    endpoint_url, headers=headers, data=serialized_body
                )
        if not serialized_body or method in {"get", "delete"}:
            return request_method(endpoint_url, headers=headers)
        return request_method(endpoint_url, headers=headers, json=serialized_body)

    def delete(self, endpoint_url: str, headers: dict, retry: bool = True):
        """
        Places API DELETE request and handles errors

        Parameters:
        ----------
            endpoint_url : str
                The endpoint url to make the http call on
            headers : dict
                The http call's headers
            retry : bool
                A boolean representing wether to attempt a retry
        """

        response = self._make_http_request("delete", endpoint_url, headers, None)
        if response.status_code in self._retry_codes and retry:
            try_cnt = 1
            while (
                response.status_code in self._retry_codes
                and try_cnt - 1 < self._max_retries
            ):
                sleep(self._initial_delay ** (try_cnt - 1) / 1000)
                response = self._make_http_request(
                    "delete", endpoint_url, headers, None
                )
                try_cnt += 1

        return self._handle_response(response)

    def get(self, endpoint_url: str, headers: dict, retry: bool = True):
        """
        Places an API GET request and handles errors

        Parameters:
        ----------
            endpoint_url : str
                The endpoint url to make the http call on
            headers : dict
                The http call's headers
            retry : bool
                A boolean representing wether to attempt a retry
        """

        response = self._make_http_request("get", endpoint_url, headers, None)
        if response.status_code in self._retry_codes and retry:
            try_cnt = 1
            while (
                response.status_code in self._retry_codes
                and try_cnt - 1 < self._max_retries
            ):
                sleep(self._initial_delay ** (try_cnt - 1) / 1000)
                response = self._make_http_request("get", endpoint_url, headers, None)
                try_cnt += 1

        return self._handle_response(response)

    def patch(self, endpoint_url: str, headers: dict, body_input, retry: bool = True):
        """
        Places an API PATCH request and handles errors

        Parameters:
        ----------
            endpoint_url : str
                The endpoint url to make the http call on
            headers : dict
                The http call's headers
            body_input:
                The patch request body
            retry : bool
                A boolean representing wether to attempt a retry
        """

        response = self._make_http_request("patch", endpoint_url, headers, body_input)
        if response.status_code in self._retry_codes and retry:
            try_cnt = 1
            while (
                response.status_code in self._retry_codes
                and try_cnt - 1 < self._max_retries
            ):
                sleep(self._initial_delay ** (try_cnt - 1) / 1000)
                response = self._make_http_request(
                    "patch", endpoint_url, headers, body_input
                )
                try_cnt += 1

        return self._handle_response(response)

    def post(self, endpoint_url: str, headers: dict, body_input, retry: bool = True):
        """
        Places an API POST request and handles errors

        Parameters:
        ----------
            endpoint_url : str
                The endpoint url to make the http call on
            headers : dict
                The http call's headers
            body_input:
                The post request body
            retry : bool
                A boolean representing wether to attempt a retry
        """

        response = self._make_http_request("post", endpoint_url, headers, body_input)
        if response.status_code in self._retry_codes and retry:
            try_cnt = 1
            while (
                response.status_code in self._retry_codes
                and try_cnt - 1 < self._max_retries
            ):
                sleep(self._initial_delay ** (try_cnt - 1) / 1000)
                response = self._make_http_request(
                    "post", endpoint_url, headers, body_input
                )
                try_cnt += 1

        return self._handle_response(response)

    def put(self, endpoint_url: str, headers: dict, body_input, retry: bool = True):
        """
        Places an API PUT request and handles errors

        Parameters:
        ----------
            endpoint_url : str
                The endpoint url to make the http call on
            headers : dict
                The http call's headers
            body_input:
                The put request body
            retry : bool
                A boolean representing whether to attempt a retry
        """

        response = self._make_http_request("put", endpoint_url, headers, body_input)
        if response.status_code in self._retry_codes and retry:
            try_cnt = 1
            while (
                response.status_code in self._retry_codes
                and try_cnt - 1 < self._max_retries
            ):
                sleep(self._initial_delay ** (try_cnt - 1) / 1000)
                response = self._make_http_request(
                    "put", endpoint_url, headers, body_input
                )
                try_cnt += 1

        return self._handle_response(response)

    def _create_exception_message(self, response, header: str) -> str:
        """
        Creates an exception message using a specific header

        Parameters:
        ----------
            response:
                Response data received from an http request
            header : str
                Header name for the created exception
        """
        if header in response.headers:
            return f"{response.text}, Headers {header}: {response.headers[header]}"
        return response.text

    def _handle_response(self, response: dict):
        """
        Handles a response from an API call

        Parameters:
        ----------
            response:
                Response data received from an http request
        """
        if response.status_code >= 200 and response.status_code < 400:
            try:
                return rename_reserved_keys(response.json())
            except JSONDecodeError:
                return response
        else:
            self._raise_from_status(response)

    def _raise_from_status(self, response) -> None:
        """
        Raises exception based response status, with additional information appended if useful

        Parameters:
        ----------
            response:
                Response data received from an http request
        """
        if response.status_code == 401:
            raise client_exceptions.UnauthorizedException(
                message=self._create_exception_message(response, "WWW-Authenticate")
            )
        elif response.status_code == 405:
            # this indicates a bug in the spec if it allows a method that the server rejects
            raise client_exceptions.MethodNotAllowedException(
                message=self._create_exception_message(response, "Allow")
            )
        elif response.status_code == 407:
            raise client_exceptions.ProxyAuthenticationRequiredException(
                message=self._create_exception_message(response, "Proxy-Authenticate")
            )
        elif response.status_code == 413:
            raise client_exceptions.PayloadTooLargeException(
                message=self._create_exception_message(response, "Retry-After")
            )
        elif response.status_code == 429:
            raise client_exceptions.TooManyRequestsException(
                message=self._create_exception_message(response, "Retry-After")
            )
        elif response.status_code == 503:
            raise server_exceptions.ServiceUnavailableException(
                message=self._create_exception_message(response, "Retry-After")
            )
        else:
            raise HTTPException.from_status_code(status_code=response.status_code)(
                message=response.text
            )
