import unittest
import responses
from src.panorasdk.net.http_client import HTTPClient
from http_exceptions import ClientException
from src.panorasdk.services.organisations import Organisations


class TestOrganisations_(unittest.TestCase):
    def test_true(self):
        self.assertTrue(True)

    @responses.activate
    def test_organisations_controller_get_oragnisations(self):
        # Mock the API response
        responses.get("http://api.example.com/organisations", json={}, status=200)
        # call the method to test
        test_service = Organisations("testkey")
        response = test_service.organisations_controller_get_oragnisations()
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_organisations_controller_get_oragnisations_error_on_non_200(self):
        # Mock the API response
        responses.get("http://api.example.com/organisations", json={}, status=404)
        with self.assertRaises(ClientException):
            test_service = Organisations("testkey")
            test_service.organisations_controller_get_oragnisations()
        responses.reset()

    @responses.activate
    def test_organisations_controller_create_org(self):
        # Mock the API response
        responses.post(
            "http://api.example.com/organisations/create", json={}, status=200
        )
        # call the method to test
        test_service = Organisations("testkey")
        response = test_service.organisations_controller_create_org({})
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_organisations_controller_create_org_error_on_non_200(self):
        # Mock the API response
        responses.post(
            "http://api.example.com/organisations/create", json={}, status=404
        )
        with self.assertRaises(ClientException):
            test_service = Organisations("testkey")
            test_service.organisations_controller_create_org({})
        responses.reset()


if __name__ == "__main__":
    unittest.main()
