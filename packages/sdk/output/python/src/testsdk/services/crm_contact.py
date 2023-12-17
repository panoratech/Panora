from urllib.parse import quote
from ..net import query_serializer
from .base import BaseService


class CrmContact(BaseService):
    def contact_controller_get_custom_properties(
        self, provider_id: str, linked_user_id: str
    ):
        url_endpoint = "/crm/contact/properties"
        headers = {}
        query_params = []
        self._add_required_headers(headers)
        if not linked_user_id:
            raise ValueError(
                "Parameter linked_user_id is required, cannot be empty or blank."
            )
        query_params.append(
            query_serializer.serialize_query(
                "form", False, "linkedUserId", linked_user_id
            )
        )
        if not provider_id:
            raise ValueError(
                "Parameter provider_id is required, cannot be empty or blank."
            )
        query_params.append(
            query_serializer.serialize_query("form", False, "providerId", provider_id)
        )
        final_url = self._url_prefix + url_endpoint + "?" + "&".join(query_params)
        res = self._http.get(final_url, headers, True)
        return res

    def contact_controller_get_contacts(
        self, remote_data: bool, linked_user_id: str, integration_id: str
    ):
        url_endpoint = "/crm/contact"
        headers = {}
        query_params = []
        self._add_required_headers(headers)
        if not integration_id:
            raise ValueError(
                "Parameter integration_id is required, cannot be empty or blank."
            )
        query_params.append(
            query_serializer.serialize_query(
                "form", False, "integrationId", integration_id
            )
        )
        if not linked_user_id:
            raise ValueError(
                "Parameter linked_user_id is required, cannot be empty or blank."
            )
        query_params.append(
            query_serializer.serialize_query(
                "form", False, "linkedUserId", linked_user_id
            )
        )
        if not remote_data:
            raise ValueError(
                "Parameter remote_data is required, cannot be empty or blank."
            )
        query_params.append(
            query_serializer.serialize_query("form", False, "remote_data", remote_data)
        )
        final_url = self._url_prefix + url_endpoint + "?" + "&".join(query_params)
        res = self._http.get(final_url, headers, True)
        return res

    def contact_controller_add_contacts(
        self,
        request_input: list,
        remote_data: bool,
        linked_user_id: str,
        integration_id: str,
    ):
        url_endpoint = "/crm/contact"
        headers = {"Content-type": "application/json"}
        query_params = []
        self._add_required_headers(headers)
        if not integration_id:
            raise ValueError(
                "Parameter integration_id is required, cannot be empty or blank."
            )
        query_params.append(
            query_serializer.serialize_query(
                "form", False, "integrationId", integration_id
            )
        )
        if not linked_user_id:
            raise ValueError(
                "Parameter linked_user_id is required, cannot be empty or blank."
            )
        query_params.append(
            query_serializer.serialize_query(
                "form", False, "linkedUserId", linked_user_id
            )
        )
        if not remote_data:
            raise ValueError(
                "Parameter remote_data is required, cannot be empty or blank."
            )
        query_params.append(
            query_serializer.serialize_query("form", False, "remote_data", remote_data)
        )
        final_url = self._url_prefix + url_endpoint + "?" + "&".join(query_params)
        res = self._http.post(final_url, headers, request_input, True)
        return res

    def contact_controller_update_contact(self, id: str):
        url_endpoint = "/crm/contact"
        headers = {}
        query_params = []
        self._add_required_headers(headers)
        if not id:
            raise ValueError("Parameter id is required, cannot be empty or blank.")
        query_params.append(query_serializer.serialize_query("form", False, "id", id))
        final_url = self._url_prefix + url_endpoint + "?" + "&".join(query_params)
        res = self._http.patch(final_url, headers, {}, True)
        return res

    def contact_controller_sync_contacts(
        self, remote_data: bool, linked_user_id: str, integration_id: str
    ):
        url_endpoint = "/crm/contact/sync"
        headers = {}
        query_params = []
        self._add_required_headers(headers)
        if not integration_id:
            raise ValueError(
                "Parameter integration_id is required, cannot be empty or blank."
            )
        query_params.append(
            query_serializer.serialize_query(
                "form", False, "integrationId", integration_id
            )
        )
        if not linked_user_id:
            raise ValueError(
                "Parameter linked_user_id is required, cannot be empty or blank."
            )
        query_params.append(
            query_serializer.serialize_query(
                "form", False, "linkedUserId", linked_user_id
            )
        )
        if not remote_data:
            raise ValueError(
                "Parameter remote_data is required, cannot be empty or blank."
            )
        query_params.append(
            query_serializer.serialize_query("form", False, "remote_data", remote_data)
        )
        final_url = self._url_prefix + url_endpoint + "?" + "&".join(query_params)
        res = self._http.get(final_url, headers, True)
        return res
