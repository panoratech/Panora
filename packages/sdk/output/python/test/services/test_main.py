import unittest
import responses
from src.panorasdk.net.http_client import HTTPClient
from http_exceptions import ClientException
from src.panorasdk.services.main import Main


class TestMain_(unittest.TestCase):
    def test_true(self):
        self.assertTrue(True)

    @responses.activate
    def test_app_controller_get_hello(self):
        # Mock the API response
        responses.get("http://api.example.com/", json={}, status=200)
        # call the method to test
        test_service = Main("testkey")
        response = test_service.app_controller_get_hello()
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_app_controller_get_hello_error_on_non_200(self):
        # Mock the API response
        responses.get("http://api.example.com/", json={}, status=404)
        with self.assertRaises(ClientException):
            test_service = Main("testkey")
            test_service.app_controller_get_hello()
        responses.reset()


if __name__ == "__main__":
    unittest.main()
