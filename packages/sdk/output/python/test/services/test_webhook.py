import unittest
import responses
from src.testsdk.net.http_client import HTTPClient
from http_exceptions import ClientException
from src.testsdk.services.webhook import Webhook


class TestWebhook_(unittest.TestCase):
    def test_true(self):
        self.assertTrue(True)

    @responses.activate
    def test_webhook_controller_get_webhooks(self):
        # Mock the API response
        responses.get("http://api.example.com/webhook", json={}, status=200)
        # call the method to test
        test_service = Webhook("testkey")
        response = test_service.webhook_controller_get_webhooks()
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_webhook_controller_get_webhooks_error_on_non_200(self):
        # Mock the API response
        responses.get("http://api.example.com/webhook", json={}, status=404)
        with self.assertRaises(ClientException):
            test_service = Webhook("testkey")
            test_service.webhook_controller_get_webhooks()
        responses.reset()

    @responses.activate
    def test_webhook_controller_add_webhook(self):
        # Mock the API response
        responses.post("http://api.example.com/webhook", json={}, status=200)
        # call the method to test
        test_service = Webhook("testkey")
        response = test_service.webhook_controller_add_webhook({})
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_webhook_controller_add_webhook_error_on_non_200(self):
        # Mock the API response
        responses.post("http://api.example.com/webhook", json={}, status=404)
        with self.assertRaises(ClientException):
            test_service = Webhook("testkey")
            test_service.webhook_controller_add_webhook({})
        responses.reset()

    @responses.activate
    def test_webhook_controller_update_webhook_status(self):
        # Mock the API response
        responses.put("http://api.example.com/webhook/4042696984", json={}, status=200)
        # call the method to test
        test_service = Webhook("testkey")
        response = test_service.webhook_controller_update_webhook_status("4042696984")
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_webhook_controller_update_webhook_status_required_fields_missing(self):
        # Mock the API response
        responses.put("http://api.example.com/webhook/8525511821", json={}, status=202)
        with self.assertRaises(TypeError):
            test_service = Webhook("testkey")
            test_service.webhook_controller_update_webhook_status()
        responses.reset(),

    @responses.activate
    def test_webhook_controller_update_webhook_status_error_on_non_200(self):
        # Mock the API response
        responses.put("http://api.example.com/webhook/9638434724", json={}, status=404)
        with self.assertRaises(ClientException):
            test_service = Webhook("testkey")
            test_service.webhook_controller_update_webhook_status("9638434724")
        responses.reset()


if __name__ == "__main__":
    unittest.main()
