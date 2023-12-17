import unittest
import responses
from src.panorasdk.net.http_client import HTTPClient
from http_exceptions import ClientException
from src.panorasdk.services.events import Events


class TestEvents_(unittest.TestCase):
    def test_true(self):
        self.assertTrue(True)

    @responses.activate
    def test_events_controller_get_events(self):
        # Mock the API response
        responses.get("http://api.example.com/events", json={}, status=200)
        # call the method to test
        test_service = Events("testkey")
        response = test_service.events_controller_get_events()
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_events_controller_get_events_error_on_non_200(self):
        # Mock the API response
        responses.get("http://api.example.com/events", json={}, status=404)
        with self.assertRaises(ClientException):
            test_service = Events("testkey")
            test_service.events_controller_get_events()
        responses.reset()


if __name__ == "__main__":
    unittest.main()
