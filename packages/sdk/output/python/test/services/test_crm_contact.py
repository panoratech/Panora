import unittest
import responses
from src.testsdk.net.http_client import HTTPClient
from http_exceptions import ClientException
from src.testsdk.services.crm_contact import CrmContact


class TestCrmContact_(unittest.TestCase):
    def test_true(self):
        self.assertTrue(True)

    @responses.activate
    def test_contact_controller_get_contacts(self):
        # Mock the API response
        responses.get("http://api.example.com/crm/contact", json={}, status=200)
        # call the method to test
        test_service = CrmContact("testkey")
        response = test_service.contact_controller_get_contacts(
            "8370091872", "4831362244", True
        )
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_contact_controller_get_contacts_required_fields_missing(self):
        # Mock the API response
        responses.get("http://api.example.com/crm/contact", json={}, status=202)
        with self.assertRaises(TypeError):
            test_service = CrmContact("testkey")
            test_service.contact_controller_get_contacts()
        responses.reset(),

    @responses.activate
    def test_contact_controller_get_contacts_error_on_non_200(self):
        # Mock the API response
        responses.get("http://api.example.com/crm/contact", json={}, status=404)
        with self.assertRaises(ClientException):
            test_service = CrmContact("testkey")
            test_service.contact_controller_get_contacts(
                "7513499459", "1366154757", True
            )
        responses.reset()

    @responses.activate
    def test_contact_controller_add_contacts(self):
        # Mock the API response
        responses.post("http://api.example.com/crm/contact", json={}, status=200)
        # call the method to test
        test_service = CrmContact("testkey")
        response = test_service.contact_controller_add_contacts(
            {}, "2764670262", "1885567456", True
        )
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_contact_controller_add_contacts_required_fields_missing(self):
        # Mock the API response
        responses.post("http://api.example.com/crm/contact", json={}, status=202)
        with self.assertRaises(TypeError):
            test_service = CrmContact("testkey")
            test_service.contact_controller_add_contacts()
        responses.reset(),

    @responses.activate
    def test_contact_controller_add_contacts_error_on_non_200(self):
        # Mock the API response
        responses.post("http://api.example.com/crm/contact", json={}, status=404)
        with self.assertRaises(ClientException):
            test_service = CrmContact("testkey")
            test_service.contact_controller_add_contacts(
                {}, "7661519231", "7475748474", True
            )
        responses.reset()

    @responses.activate
    def test_contact_controller_update_contact(self):
        # Mock the API response
        responses.patch("http://api.example.com/crm/contact", json={}, status=200)
        # call the method to test
        test_service = CrmContact("testkey")
        response = test_service.contact_controller_update_contact("3314436272")
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_contact_controller_update_contact_required_fields_missing(self):
        # Mock the API response
        responses.patch("http://api.example.com/crm/contact", json={}, status=202)
        with self.assertRaises(TypeError):
            test_service = CrmContact("testkey")
            test_service.contact_controller_update_contact()
        responses.reset(),

    @responses.activate
    def test_contact_controller_update_contact_error_on_non_200(self):
        # Mock the API response
        responses.patch("http://api.example.com/crm/contact", json={}, status=404)
        with self.assertRaises(ClientException):
            test_service = CrmContact("testkey")
            test_service.contact_controller_update_contact("5838330951")
        responses.reset()

    @responses.activate
    def test_contact_controller_get_contact(self):
        # Mock the API response
        responses.get(
            "http://api.example.com/crm/contact/4658895433", json={}, status=200
        )
        # call the method to test
        test_service = CrmContact("testkey")
        response = test_service.contact_controller_get_contact("4658895433", True)
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_contact_controller_get_contact_required_fields_missing(self):
        # Mock the API response
        responses.get(
            "http://api.example.com/crm/contact/3207892354", json={}, status=202
        )
        with self.assertRaises(TypeError):
            test_service = CrmContact("testkey")
            test_service.contact_controller_get_contact()
        responses.reset(),

    @responses.activate
    def test_contact_controller_get_contact_error_on_non_200(self):
        # Mock the API response
        responses.get(
            "http://api.example.com/crm/contact/1238718850", json={}, status=404
        )
        with self.assertRaises(ClientException):
            test_service = CrmContact("testkey")
            test_service.contact_controller_get_contact("1238718850", True)
        responses.reset()


if __name__ == "__main__":
    unittest.main()
