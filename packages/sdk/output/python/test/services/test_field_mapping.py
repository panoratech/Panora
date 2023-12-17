import unittest
import responses
from src.testsdk.net.http_client import HTTPClient
from http_exceptions import ClientException
from src.testsdk.services.field_mapping import FieldMapping


class TestFieldMapping_(unittest.TestCase):
    def test_true(self):
        self.assertTrue(True)

    @responses.activate
    def test_field_mapping_controller_get_entities(self):
        # Mock the API response
        responses.get(
            "http://api.example.com/field-mapping/entities", json={}, status=200
        )
        # call the method to test
        test_service = FieldMapping("testkey")
        response = test_service.field_mapping_controller_get_entities()
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_field_mapping_controller_get_entities_error_on_non_200(self):
        # Mock the API response
        responses.get(
            "http://api.example.com/field-mapping/entities", json={}, status=404
        )
        with self.assertRaises(ClientException):
            test_service = FieldMapping("testkey")
            test_service.field_mapping_controller_get_entities()
        responses.reset()

    @responses.activate
    def test_field_mapping_controller_get_attributes(self):
        # Mock the API response
        responses.get(
            "http://api.example.com/field-mapping/attribute", json={}, status=200
        )
        # call the method to test
        test_service = FieldMapping("testkey")
        response = test_service.field_mapping_controller_get_attributes()
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_field_mapping_controller_get_attributes_error_on_non_200(self):
        # Mock the API response
        responses.get(
            "http://api.example.com/field-mapping/attribute", json={}, status=404
        )
        with self.assertRaises(ClientException):
            test_service = FieldMapping("testkey")
            test_service.field_mapping_controller_get_attributes()
        responses.reset()

    @responses.activate
    def test_field_mapping_controller_get_values(self):
        # Mock the API response
        responses.get("http://api.example.com/field-mapping/value", json={}, status=200)
        # call the method to test
        test_service = FieldMapping("testkey")
        response = test_service.field_mapping_controller_get_values()
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_field_mapping_controller_get_values_error_on_non_200(self):
        # Mock the API response
        responses.get("http://api.example.com/field-mapping/value", json={}, status=404)
        with self.assertRaises(ClientException):
            test_service = FieldMapping("testkey")
            test_service.field_mapping_controller_get_values()
        responses.reset()

    @responses.activate
    def test_field_mapping_controller_define_target_field(self):
        # Mock the API response
        responses.post(
            "http://api.example.com/field-mapping/define", json={}, status=200
        )
        # call the method to test
        test_service = FieldMapping("testkey")
        response = test_service.field_mapping_controller_define_target_field({})
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_field_mapping_controller_define_target_field_error_on_non_200(self):
        # Mock the API response
        responses.post(
            "http://api.example.com/field-mapping/define", json={}, status=404
        )
        with self.assertRaises(ClientException):
            test_service = FieldMapping("testkey")
            test_service.field_mapping_controller_define_target_field({})
        responses.reset()

    @responses.activate
    def test_field_mapping_controller_map_field_to_provider(self):
        # Mock the API response
        responses.post("http://api.example.com/field-mapping/map", json={}, status=200)
        # call the method to test
        test_service = FieldMapping("testkey")
        response = test_service.field_mapping_controller_map_field_to_provider({})
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_field_mapping_controller_map_field_to_provider_error_on_non_200(self):
        # Mock the API response
        responses.post("http://api.example.com/field-mapping/map", json={}, status=404)
        with self.assertRaises(ClientException):
            test_service = FieldMapping("testkey")
            test_service.field_mapping_controller_map_field_to_provider({})
        responses.reset()

    @responses.activate
    def test_field_mapping_controller_get_custom_properties(self):
        # Mock the API response
        responses.get(
            "http://api.example.com/field-mapping/properties", json={}, status=200
        )
        # call the method to test
        test_service = FieldMapping("testkey")
        response = test_service.field_mapping_controller_get_custom_properties(
            "5832991987", "1688907611"
        )
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_field_mapping_controller_get_custom_properties_required_fields_missing(
        self,
    ):
        # Mock the API response
        responses.get(
            "http://api.example.com/field-mapping/properties", json={}, status=202
        )
        with self.assertRaises(TypeError):
            test_service = FieldMapping("testkey")
            test_service.field_mapping_controller_get_custom_properties()
        responses.reset(),

    @responses.activate
    def test_field_mapping_controller_get_custom_properties_error_on_non_200(self):
        # Mock the API response
        responses.get(
            "http://api.example.com/field-mapping/properties", json={}, status=404
        )
        with self.assertRaises(ClientException):
            test_service = FieldMapping("testkey")
            test_service.field_mapping_controller_get_custom_properties(
                "4350887327", "7929775168"
            )
        responses.reset()


if __name__ == "__main__":
    unittest.main()
