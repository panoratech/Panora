import unittest
import responses
from src.panorasdk.net.http_client import HTTPClient
from http_exceptions import ClientException
from src.panorasdk.services.crm_contact import CrmContact


class TestCrmContact_(unittest.TestCase):
    def test_true(self):
        self.assertTrue(True)

    @responses.activate
    def test_contact_controller_get_custom_properties(self):
        # Mock the API response
        responses.get(
            "http://api.example.com/crm/contact/properties", json={}, status=200
        )
        # call the method to test
        test_service = CrmContact("testkey")
        response = test_service.contact_controller_get_custom_properties(
            "8159227516", "6958991998"
        )
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_contact_controller_get_custom_properties_required_fields_missing(self):
        # Mock the API response
        responses.get(
            "http://api.example.com/crm/contact/properties", json={}, status=202
        )
        with self.assertRaises(TypeError):
            test_service = CrmContact("testkey")
            test_service.contact_controller_get_custom_properties()
        responses.reset(),

    @responses.activate
    def test_contact_controller_get_custom_properties_error_on_non_200(self):
        # Mock the API response
        responses.get(
            "http://api.example.com/crm/contact/properties", json={}, status=404
        )
        with self.assertRaises(ClientException):
            test_service = CrmContact("testkey")
            test_service.contact_controller_get_custom_properties(
                "8270896883", "3309094878"
            )
        responses.reset()

    @responses.activate
    def test_contact_controller_get_contacts(self):
        # Mock the API response
        responses.get("http://api.example.com/crm/contact", json={}, status=200)
        # call the method to test
        test_service = CrmContact("testkey")
        response = test_service.contact_controller_get_contacts(
            True, "5909535309", "8339740290"
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
                True, "9531487091", "6240163368"
            )
        responses.reset()

    @responses.activate
    def test_contact_controller_add_contacts(self):
        # Mock the API response
        responses.post("http://api.example.com/crm/contact", json={}, status=200)
        # call the method to test
        test_service = CrmContact("testkey")
        response = test_service.contact_controller_add_contacts(
            {}, True, "1753590633", "6414798099"
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
                {}, True, "8873156615", "7956796564"
            )
        responses.reset()

    @responses.activate
    def test_contact_controller_update_contact(self):
        # Mock the API response
        responses.patch("http://api.example.com/crm/contact", json={}, status=200)
        # call the method to test
        test_service = CrmContact("testkey")
        response = test_service.contact_controller_update_contact("2334343188")
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
            test_service.contact_controller_update_contact("5676611675")
        responses.reset()

    @responses.activate
    def test_contact_controller_sync_contacts(self):
        # Mock the API response
        responses.get("http://api.example.com/crm/contact/sync", json={}, status=200)
        # call the method to test
        test_service = CrmContact("testkey")
        response = test_service.contact_controller_sync_contacts(
            True, "2089808435", "1762838672"
        )
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_contact_controller_sync_contacts_required_fields_missing(self):
        # Mock the API response
        responses.get("http://api.example.com/crm/contact/sync", json={}, status=202)
        with self.assertRaises(TypeError):
            test_service = CrmContact("testkey")
            test_service.contact_controller_sync_contacts()
        responses.reset(),

    @responses.activate
    def test_contact_controller_sync_contacts_error_on_non_200(self):
        # Mock the API response
        responses.get("http://api.example.com/crm/contact/sync", json={}, status=404)
        with self.assertRaises(ClientException):
            test_service = CrmContact("testkey")
            test_service.contact_controller_sync_contacts(
                True, "6460226027", "9492580645"
            )
        responses.reset()


if __name__ == "__main__":
    unittest.main()
