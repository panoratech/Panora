import unittest
import responses
from http import HTTPStatus
from src.testsdk.services.base import BaseService
from http_exceptions import ClientException


class TestBaseService(unittest.TestCase):
    def test_true(self):
        self.assertTrue(True)


if __name__ == "__main__":
    unittest.main()
