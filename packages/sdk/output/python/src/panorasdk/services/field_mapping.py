from urllib.parse import quote

from .base import BaseService
from ..models.DefineTargetFieldDto import (
    DefineTargetFieldDto as DefineTargetFieldDtoModel,
)
from ..models.MapFieldToProviderDto import (
    MapFieldToProviderDto as MapFieldToProviderDtoModel,
)


class FieldMapping(BaseService):
    def field_mapping_controller_get_entities(self):
        url_endpoint = "/field-mapping/entities"
        headers = {}
        self._add_required_headers(headers)

        final_url = self._url_prefix + url_endpoint
        res = self._http.get(final_url, headers, True)
        return res

    def field_mapping_controller_get_attributes(self):
        url_endpoint = "/field-mapping/attribute"
        headers = {}
        self._add_required_headers(headers)

        final_url = self._url_prefix + url_endpoint
        res = self._http.get(final_url, headers, True)
        return res

    def field_mapping_controller_get_values(self):
        url_endpoint = "/field-mapping/value"
        headers = {}
        self._add_required_headers(headers)

        final_url = self._url_prefix + url_endpoint
        res = self._http.get(final_url, headers, True)
        return res

    def field_mapping_controller_define_target_field(
        self, request_input: DefineTargetFieldDtoModel
    ):
        url_endpoint = "/field-mapping/define"
        headers = {"Content-type": "application/json"}
        self._add_required_headers(headers)

        final_url = self._url_prefix + url_endpoint
        res = self._http.post(final_url, headers, request_input, True)
        return res

    def field_mapping_controller_map_field_to_provider(
        self, request_input: MapFieldToProviderDtoModel
    ):
        url_endpoint = "/field-mapping/map"
        headers = {"Content-type": "application/json"}
        self._add_required_headers(headers)

        final_url = self._url_prefix + url_endpoint
        res = self._http.post(final_url, headers, request_input, True)
        return res
