import unittest
import responses
from src.testsdk.net.http_client import HTTPClient
from http_exceptions import ClientException
from src.testsdk.services.auth import Auth


class TestAuth_(unittest.TestCase):
    def test_true(self):
        self.assertTrue(True)

    @responses.activate
    def test_auth_controller_register_user(self):
        # Mock the API response
        responses.post("http://api.example.com/auth/register", json={}, status=200)
        # call the method to test
        test_service = Auth("testkey")
        response = test_service.auth_controller_register_user({})
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_auth_controller_register_user_error_on_non_200(self):
        # Mock the API response
        responses.post("http://api.example.com/auth/register", json={}, status=404)
        with self.assertRaises(ClientException):
            test_service = Auth("testkey")
            test_service.auth_controller_register_user({})
        responses.reset()

    @responses.activate
    def test_auth_controller_login(self):
        # Mock the API response
        responses.post("http://api.example.com/auth/login", json={}, status=200)
        # call the method to test
        test_service = Auth("testkey")
        response = test_service.auth_controller_login({})
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_auth_controller_login_error_on_non_200(self):
        # Mock the API response
        responses.post("http://api.example.com/auth/login", json={}, status=404)
        with self.assertRaises(ClientException):
            test_service = Auth("testkey")
            test_service.auth_controller_login({})
        responses.reset()

    @responses.activate
    def test_auth_controller_users(self):
        # Mock the API response
        responses.get("http://api.example.com/auth/users", json={}, status=200)
        # call the method to test
        test_service = Auth("testkey")
        response = test_service.auth_controller_users()
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_auth_controller_users_error_on_non_200(self):
        # Mock the API response
        responses.get("http://api.example.com/auth/users", json={}, status=404)
        with self.assertRaises(ClientException):
            test_service = Auth("testkey")
            test_service.auth_controller_users()
        responses.reset()

    @responses.activate
    def test_auth_controller_api_keys(self):
        # Mock the API response
        responses.get("http://api.example.com/auth/api-keys", json={}, status=200)
        # call the method to test
        test_service = Auth("testkey")
        response = test_service.auth_controller_api_keys()
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_auth_controller_api_keys_error_on_non_200(self):
        # Mock the API response
        responses.get("http://api.example.com/auth/api-keys", json={}, status=404)
        with self.assertRaises(ClientException):
            test_service = Auth("testkey")
            test_service.auth_controller_api_keys()
        responses.reset()

    @responses.activate
    def test_auth_controller_generate_api_key(self):
        # Mock the API response
        responses.post(
            "http://api.example.com/auth/generate-apikey", json={}, status=200
        )
        # call the method to test
        test_service = Auth("testkey")
        response = test_service.auth_controller_generate_api_key({})
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_auth_controller_generate_api_key_error_on_non_200(self):
        # Mock the API response
        responses.post(
            "http://api.example.com/auth/generate-apikey", json={}, status=404
        )
        with self.assertRaises(ClientException):
            test_service = Auth("testkey")
            test_service.auth_controller_generate_api_key({})
        responses.reset()


if __name__ == "__main__":
    unittest.main()
