import unittest
from src.testsdk.models.CreateUserDto import CreateUserDto


class TestCreateUserDtoModel(unittest.TestCase):
    def test_true(self):
        self.assertTrue(True)

    def test_create_user_dto(self):
        # Create CreateUserDto class instance
        test_model = CreateUserDto(
            password_hash="unde", email="eius", last_name="saepe", first_name="itaque"
        )
        self.assertEqual(test_model.password_hash, "unde")
        self.assertEqual(test_model.email, "eius")
        self.assertEqual(test_model.last_name, "saepe")
        self.assertEqual(test_model.first_name, "itaque")

    def test_create_user_dto_required_fields_missing(self):
        # Assert CreateUserDto class generation fails without required fields
        with self.assertRaises(TypeError):
            test_model = CreateUserDto()


if __name__ == "__main__":
    unittest.main()
