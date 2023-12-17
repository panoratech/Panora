import unittest
import responses
from src.testsdk.net.http_client import HTTPClient
from http_exceptions import ClientException
from src.testsdk.services.crm_contact import CrmContact


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
            "5555572723", "6823460501"
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
                "9707143631", "1194469616"
            )
        responses.reset()

    @responses.activate
    def test_contact_controller_get_contacts(self):
        # Mock the API response
        responses.get("http://api.example.com/crm/contact", json={}, status=200)
        # call the method to test
        test_service = CrmContact("testkey")
        response = test_service.contact_controller_get_contacts(
            True, "3066342183", "7184697355"
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
                True, "9648602073", "4277432604"
            )
        responses.reset()

    @responses.activate
    def test_contact_controller_add_contacts(self):
        # Mock the API response
        responses.post("http://api.example.com/crm/contact", json={}, status=200)
        # call the method to test
        test_service = CrmContact("testkey")
        response = test_service.contact_controller_add_contacts(
            {}, True, "5501601678", "2348685774"
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
                {}, True, "6498176790", "3838905845"
            )
        responses.reset()

    @responses.activate
    def test_contact_controller_update_contact(self):
        # Mock the API response
        responses.patch("http://api.example.com/crm/contact", json={}, status=200)
        # call the method to test
        test_service = CrmContact("testkey")
        response = test_service.contact_controller_update_contact("3990911059")
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
            test_service.contact_controller_update_contact("8975318338")
        responses.reset()

    @responses.activate
    def test_contact_controller_sync_contacts(self):
        # Mock the API response
        responses.get("http://api.example.com/crm/contact/sync", json={}, status=200)
        # call the method to test
        test_service = CrmContact("testkey")
        response = test_service.contact_controller_sync_contacts(
            True, "6783269660", "6506193189"
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
                True, "7954320135", "3946917380"
            )
        responses.reset()


if __name__ == "__main__":
    unittest.main()
