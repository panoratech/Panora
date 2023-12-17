import unittest
from src.testsdk.models.PassThroughResponse import PassThroughResponse


class TestPassThroughResponseModel(unittest.TestCase):
    def test_true(self):
        self.assertTrue(True)

    def test_pass_through_response(self):
        # Create PassThroughResponse class instance
        test_model = PassThroughResponse(data={"tempora": 4}, status=2, url="ex")
        self.assertEqual(test_model.data, {"tempora": 4})
        self.assertEqual(test_model.status, 2)
        self.assertEqual(test_model.url, "ex")

    def test_pass_through_response_required_fields_missing(self):
        # Assert PassThroughResponse class generation fails without required fields
        with self.assertRaises(TypeError):
            test_model = PassThroughResponse()


if __name__ == "__main__":
    unittest.main()
