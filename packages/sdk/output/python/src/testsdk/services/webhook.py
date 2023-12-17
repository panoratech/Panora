from urllib.parse import quote
from ..net import query_serializer
from .base import BaseService
from ..models.WebhookDto import WebhookDto as WebhookDtoModel


class Webhook(BaseService):
    def webhook_controller_get_webhooks(self):
        url_endpoint = "/webhook"
        headers = {}
        self._add_required_headers(headers)

        final_url = self._url_prefix + url_endpoint
        res = self._http.get(final_url, headers, True)
        return res

    def webhook_controller_add_webhook(self, request_input: WebhookDtoModel):
        url_endpoint = "/webhook"
        headers = {"Content-type": "application/json"}
        self._add_required_headers(headers)

        final_url = self._url_prefix + url_endpoint
        res = self._http.post(final_url, headers, request_input, True)
        return res

    def webhook_controller_update_webhook_status(self, id: str):
        url_endpoint = "/webhook/{id}"
        headers = {}
        self._add_required_headers(headers)
        if not id:
            raise ValueError("Parameter id is required, cannot be empty or blank.")
        url_endpoint = url_endpoint.replace(
            "{id}",
            quote(str(query_serializer.serialize_path("simple", False, id, None))),
        )
        final_url = self._url_prefix + url_endpoint
        res = self._http.put(final_url, headers, {}, True)
        return res
