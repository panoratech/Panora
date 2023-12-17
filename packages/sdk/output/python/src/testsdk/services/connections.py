from urllib.parse import quote
from ..net import query_serializer
from .base import BaseService


class Connections(BaseService):
    def connections_controller_handle_callback(
        self, location: str, code: str, state: str
    ):
        url_endpoint = "/connections/oauth/callback"
        headers = {}
        query_params = []
        self._add_required_headers(headers)
        if not state:
            raise ValueError("Parameter state is required, cannot be empty or blank.")
        query_params.append(
            query_serializer.serialize_query("form", False, "state", state)
        )
        if not code:
            raise ValueError("Parameter code is required, cannot be empty or blank.")
        query_params.append(
            query_serializer.serialize_query("form", False, "code", code)
        )
        if not location:
            raise ValueError(
                "Parameter location is required, cannot be empty or blank."
            )
        query_params.append(
            query_serializer.serialize_query("form", False, "location", location)
        )
        final_url = self._url_prefix + url_endpoint + "?" + "&".join(query_params)
        res = self._http.get(final_url, headers, True)
        return res

    def connections_controller_get_connections(self):
        url_endpoint = "/connections"
        headers = {}
        self._add_required_headers(headers)

        final_url = self._url_prefix + url_endpoint
        res = self._http.get(final_url, headers, True)
        return res
