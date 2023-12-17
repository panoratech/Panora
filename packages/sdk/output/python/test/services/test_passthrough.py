import unittest
import responses
from src.panorasdk.net.http_client import HTTPClient
from http_exceptions import ClientException
from src.panorasdk.services.passthrough import Passthrough


class TestPassthrough_(unittest.TestCase):
    def test_true(self):
        self.assertTrue(True)

    @responses.activate
    def test_passthrough_controller_passthrough_request(self):
        # Mock the API response
        responses.post("http://api.example.com/passthrough", json={}, status=200)
        # call the method to test
        test_service = Passthrough("testkey")
        response = test_service.passthrough_controller_passthrough_request(
            {}, "3489969353", "4813789499"
        )
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_passthrough_controller_passthrough_request_required_fields_missing(self):
        # Mock the API response
        responses.post("http://api.example.com/passthrough", json={}, status=202)
        with self.assertRaises(TypeError):
            test_service = Passthrough("testkey")
            test_service.passthrough_controller_passthrough_request()
        responses.reset(),

    @responses.activate
    def test_passthrough_controller_passthrough_request_error_on_non_200(self):
        # Mock the API response
        responses.post("http://api.example.com/passthrough", json={}, status=404)
        with self.assertRaises(ClientException):
            test_service = Passthrough("testkey")
            test_service.passthrough_controller_passthrough_request(
                {}, "6729873310", "4090646714"
            )
        responses.reset()


if __name__ == "__main__":
    unittest.main()
