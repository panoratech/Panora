import unittest
import responses
from src.testsdk.net.http_client import HTTPClient
from http_exceptions import ClientException
from src.testsdk.services.magic_link import MagicLink


class TestMagicLink_(unittest.TestCase):
    def test_true(self):
        self.assertTrue(True)

    @responses.activate
    def test_magic_link_controller_create_link(self):
        # Mock the API response
        responses.post("http://api.example.com/magic-link/create", json={}, status=200)
        # call the method to test
        test_service = MagicLink("testkey")
        response = test_service.magic_link_controller_create_link({})
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_magic_link_controller_create_link_error_on_non_200(self):
        # Mock the API response
        responses.post("http://api.example.com/magic-link/create", json={}, status=404)
        with self.assertRaises(ClientException):
            test_service = MagicLink("testkey")
            test_service.magic_link_controller_create_link({})
        responses.reset()

    @responses.activate
    def test_magic_link_controller_get_magic_links(self):
        # Mock the API response
        responses.get("http://api.example.com/magic-link", json={}, status=200)
        # call the method to test
        test_service = MagicLink("testkey")
        response = test_service.magic_link_controller_get_magic_links()
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_magic_link_controller_get_magic_links_error_on_non_200(self):
        # Mock the API response
        responses.get("http://api.example.com/magic-link", json={}, status=404)
        with self.assertRaises(ClientException):
            test_service = MagicLink("testkey")
            test_service.magic_link_controller_get_magic_links()
        responses.reset()

    @responses.activate
    def test_magic_link_controller_get_magic_link(self):
        # Mock the API response
        responses.get("http://api.example.com/magic-link/single", json={}, status=200)
        # call the method to test
        test_service = MagicLink("testkey")
        response = test_service.magic_link_controller_get_magic_link("6285193196")
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_magic_link_controller_get_magic_link_required_fields_missing(self):
        # Mock the API response
        responses.get("http://api.example.com/magic-link/single", json={}, status=202)
        with self.assertRaises(TypeError):
            test_service = MagicLink("testkey")
            test_service.magic_link_controller_get_magic_link()
        responses.reset(),

    @responses.activate
    def test_magic_link_controller_get_magic_link_error_on_non_200(self):
        # Mock the API response
        responses.get("http://api.example.com/magic-link/single", json={}, status=404)
        with self.assertRaises(ClientException):
            test_service = MagicLink("testkey")
            test_service.magic_link_controller_get_magic_link("3232216306")
        responses.reset()


if __name__ == "__main__":
    unittest.main()
