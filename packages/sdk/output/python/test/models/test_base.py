import unittest
import responses
from http import HTTPStatus
from src.panorasdk.models.base import BaseModel
from http_exceptions import ClientException


class TestBaseModel(unittest.TestCase):
    def test_true(self):
        self.assertTrue(True)


if __name__ == "__main__":
    unittest.main()
