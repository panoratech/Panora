import unittest
from src.testsdk.models.PassThroughRequestDto import PassThroughRequestDto


class TestPassThroughRequestDtoModel(unittest.TestCase):
    def test_true(self):
        self.assertTrue(True)

    def test_pass_through_request_dto(self):
        # Create PassThroughRequestDto class instance
        test_model = PassThroughRequestDto(
            path="cum", method="GET", data={"sunt": 1}, headers_={"dignissimos": 2}
        )
        self.assertEqual(test_model.path, "cum")
        self.assertEqual(test_model.method, "GET")
        self.assertEqual(test_model.data, {"sunt": 1})
        self.assertEqual(test_model.headers_, {"dignissimos": 2})

    def test_pass_through_request_dto_required_fields_missing(self):
        # Assert PassThroughRequestDto class generation fails without required fields
        with self.assertRaises(TypeError):
            test_model = PassThroughRequestDto()


if __name__ == "__main__":
    unittest.main()
