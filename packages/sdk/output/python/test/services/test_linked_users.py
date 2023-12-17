import unittest
import responses
from src.testsdk.net.http_client import HTTPClient
from http_exceptions import ClientException
from src.testsdk.services.linked_users import LinkedUsers


class TestLinkedUsers_(unittest.TestCase):
    def test_true(self):
        self.assertTrue(True)

    @responses.activate
    def test_linked_users_controller_add_linked_user(self):
        # Mock the API response
        responses.post(
            "http://api.example.com/linked-users/create", json={}, status=200
        )
        # call the method to test
        test_service = LinkedUsers("testkey")
        response = test_service.linked_users_controller_add_linked_user({})
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_linked_users_controller_add_linked_user_error_on_non_200(self):
        # Mock the API response
        responses.post(
            "http://api.example.com/linked-users/create", json={}, status=404
        )
        with self.assertRaises(ClientException):
            test_service = LinkedUsers("testkey")
            test_service.linked_users_controller_add_linked_user({})
        responses.reset()

    @responses.activate
    def test_linked_users_controller_get_linked_users(self):
        # Mock the API response
        responses.get("http://api.example.com/linked-users", json={}, status=200)
        # call the method to test
        test_service = LinkedUsers("testkey")
        response = test_service.linked_users_controller_get_linked_users()
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_linked_users_controller_get_linked_users_error_on_non_200(self):
        # Mock the API response
        responses.get("http://api.example.com/linked-users", json={}, status=404)
        with self.assertRaises(ClientException):
            test_service = LinkedUsers("testkey")
            test_service.linked_users_controller_get_linked_users()
        responses.reset()

    @responses.activate
    def test_linked_users_controller_get_linked_user(self):
        # Mock the API response
        responses.get("http://api.example.com/linked-users/single", json={}, status=200)
        # call the method to test
        test_service = LinkedUsers("testkey")
        response = test_service.linked_users_controller_get_linked_user("4717047622")
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_linked_users_controller_get_linked_user_required_fields_missing(self):
        # Mock the API response
        responses.get("http://api.example.com/linked-users/single", json={}, status=202)
        with self.assertRaises(TypeError):
            test_service = LinkedUsers("testkey")
            test_service.linked_users_controller_get_linked_user()
        responses.reset(),

    @responses.activate
    def test_linked_users_controller_get_linked_user_error_on_non_200(self):
        # Mock the API response
        responses.get("http://api.example.com/linked-users/single", json={}, status=404)
        with self.assertRaises(ClientException):
            test_service = LinkedUsers("testkey")
            test_service.linked_users_controller_get_linked_user("6478475263")
        responses.reset()


if __name__ == "__main__":
    unittest.main()
