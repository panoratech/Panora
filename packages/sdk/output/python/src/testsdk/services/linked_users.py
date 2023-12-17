from urllib.parse import quote
from ..net import query_serializer
from .base import BaseService
from ..models.CreateLinkedUserDto import CreateLinkedUserDto as CreateLinkedUserDtoModel


class LinkedUsers(BaseService):
    def linked_users_controller_add_linked_user(
        self, request_input: CreateLinkedUserDtoModel
    ):
        url_endpoint = "/linked-users/create"
        headers = {"Content-type": "application/json"}
        self._add_required_headers(headers)

        final_url = self._url_prefix + url_endpoint
        res = self._http.post(final_url, headers, request_input, True)
        return res

    def linked_users_controller_get_linked_users(self):
        url_endpoint = "/linked-users"
        headers = {}
        self._add_required_headers(headers)

        final_url = self._url_prefix + url_endpoint
        res = self._http.get(final_url, headers, True)
        return res

    def linked_users_controller_get_linked_user(self, id: str):
        url_endpoint = "/linked-users/single"
        headers = {}
        query_params = []
        self._add_required_headers(headers)
        if not id:
            raise ValueError("Parameter id is required, cannot be empty or blank.")
        query_params.append(query_serializer.serialize_query("form", False, "id", id))
        final_url = self._url_prefix + url_endpoint + "?" + "&".join(query_params)
        res = self._http.get(final_url, headers, True)
        return res
