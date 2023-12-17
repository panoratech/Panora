import unittest
import responses
from src.panorasdk.net.http_client import HTTPClient
from http_exceptions import ClientException
from src.panorasdk.services.projects import Projects


class TestProjects_(unittest.TestCase):
    def test_true(self):
        self.assertTrue(True)

    @responses.activate
    def test_projects_controller_get_projects(self):
        # Mock the API response
        responses.get("http://api.example.com/projects", json={}, status=200)
        # call the method to test
        test_service = Projects("testkey")
        response = test_service.projects_controller_get_projects()
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_projects_controller_get_projects_error_on_non_200(self):
        # Mock the API response
        responses.get("http://api.example.com/projects", json={}, status=404)
        with self.assertRaises(ClientException):
            test_service = Projects("testkey")
            test_service.projects_controller_get_projects()
        responses.reset()

    @responses.activate
    def test_projects_controller_create_project(self):
        # Mock the API response
        responses.post("http://api.example.com/projects/create", json={}, status=200)
        # call the method to test
        test_service = Projects("testkey")
        response = test_service.projects_controller_create_project({})
        self.assertEqual(response, {})
        responses.reset(),

    @responses.activate
    def test_projects_controller_create_project_error_on_non_200(self):
        # Mock the API response
        responses.post("http://api.example.com/projects/create", json={}, status=404)
        with self.assertRaises(ClientException):
            test_service = Projects("testkey")
            test_service.projects_controller_create_project({})
        responses.reset()


if __name__ == "__main__":
    unittest.main()
