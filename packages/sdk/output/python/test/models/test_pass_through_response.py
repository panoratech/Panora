import unittest
from src.testsdk.models.PassThroughResponse import PassThroughResponse


class TestPassThroughResponseModel(unittest.TestCase):
    def test_true(self):
        self.assertTrue(True)

    def test_pass_through_response(self):
        # Create PassThroughResponse class instance
        test_model = PassThroughResponse(
            data={"pariatur": 1}, status=4, url="praesentium"
        )
        self.assertEqual(test_model.data, {"pariatur": 1})
        self.assertEqual(test_model.status, 4)
        self.assertEqual(test_model.url, "praesentium")

    def test_pass_through_response_required_fields_missing(self):
        # Assert PassThroughResponse class generation fails without required fields
        with self.assertRaises(TypeError):
            test_model = PassThroughResponse()


if __name__ == "__main__":
    unittest.main()
