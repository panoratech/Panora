from urllib.parse import quote
from ..net import query_serializer
from .base import BaseService
from ..models.PassThroughRequestDto import (
    PassThroughRequestDto as PassThroughRequestDtoModel,
)
from ..models.PassThroughResponse import PassThroughResponse as PassThroughResponseModel


class Passthrough(BaseService):
    def passthrough_controller_passthrough_request(
        self,
        request_input: PassThroughRequestDtoModel,
        linked_user_id: str,
        integration_id: str,
    ) -> PassThroughResponseModel:
        url_endpoint = "/passthrough"
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
        final_url = self._url_prefix + url_endpoint + "?" + "&".join(query_params)
        res = self._http.post(final_url, headers, request_input, True)
        if res and isinstance(res, dict):
            return PassThroughResponseModel(**res)
        return res
