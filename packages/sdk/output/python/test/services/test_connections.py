import unittest
import responses
from src.testsdk.net.http_client import HTTPClient
from http_exceptions import ClientException
from src.testsdk.services.connections import Connections


class TestConnections_(unittest.TestCase):
    def test_true(self):
        self.assertTrue(True)

    @responses.activate
    def test_connections_controller_handle_callback(self):
        # Mock the API response
        responses.get(
            "http://api.example.com/connections/oauth/callback", json={}, status=200
        )
        # call the method to test
        test_service = Connections("testkey")
        response = test_service.connections_controller_handle_callback(
            "optio", "hic", "at"
        )
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_connections_controller_handle_callback_required_fields_missing(self):
        # Mock the API response
        responses.get(
            "http://api.example.com/connections/oauth/callback", json={}, status=202
        )
        with self.assertRaises(TypeError):
            test_service = Connections("testkey")
            test_service.connections_controller_handle_callback()
        responses.reset(),

    @responses.activate
    def test_connections_controller_handle_callback_error_on_non_200(self):
        # Mock the API response
        responses.get(
            "http://api.example.com/connections/oauth/callback", json={}, status=404
        )
        with self.assertRaises(ClientException):
            test_service = Connections("testkey")
            test_service.connections_controller_handle_callback(
                "nemo", "ipsa", "laudantium"
            )
        responses.reset()

    @responses.activate
    def test_connections_controller_get_connections(self):
        # Mock the API response
        responses.get("http://api.example.com/connections", json={}, status=200)
        # call the method to test
        test_service = Connections("testkey")
        response = test_service.connections_controller_get_connections()
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_connections_controller_get_connections_error_on_non_200(self):
        # Mock the API response
        responses.get("http://api.example.com/connections", json={}, status=404)
        with self.assertRaises(ClientException):
            test_service = Connections("testkey")
            test_service.connections_controller_get_connections()
        responses.reset()


if __name__ == "__main__":
    unittest.main()
