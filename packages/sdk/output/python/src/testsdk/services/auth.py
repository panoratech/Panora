from urllib.parse import quote

from .base import BaseService
from ..models.CreateUserDto import CreateUserDto as CreateUserDtoModel
from ..models.LoginCredentials import LoginCredentials as LoginCredentialsModel


class Auth(BaseService):
    def auth_controller_register_user(self, request_input: CreateUserDtoModel):
        url_endpoint = "/auth/register"
        headers = {"Content-type": "application/json"}
        self._add_required_headers(headers)

        final_url = self._url_prefix + url_endpoint
        res = self._http.post(final_url, headers, request_input, True)
        return res

    def auth_controller_login(self, request_input: LoginCredentialsModel):
        url_endpoint = "/auth/login"
        headers = {"Content-type": "application/json"}
        self._add_required_headers(headers)

        final_url = self._url_prefix + url_endpoint
        res = self._http.post(final_url, headers, request_input, True)
        return res

    def auth_controller_users(self):
        url_endpoint = "/auth/users"
        headers = {}
        self._add_required_headers(headers)

        final_url = self._url_prefix + url_endpoint
        res = self._http.get(final_url, headers, True)
        return res

    def auth_controller_api_keys(self):
        url_endpoint = "/auth/api-keys"
        headers = {}
        self._add_required_headers(headers)

        final_url = self._url_prefix + url_endpoint
        res = self._http.get(final_url, headers, True)
        return res

    def auth_controller_generate_api_key(self, request_input: str):
        url_endpoint = "/auth/generate-apikey"
        headers = {"Content-type": "application/json"}
        self._add_required_headers(headers)

        final_url = self._url_prefix + url_endpoint
        res = self._http.post(final_url, headers, request_input, True)
        return res
