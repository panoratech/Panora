import unittest
from src.panorasdk.models.CreateUserDto import CreateUserDto


class TestCreateUserDtoModel(unittest.TestCase):
    def test_true(self):
        self.assertTrue(True)

    def test_create_user_dto(self):
        # Create CreateUserDto class instance
        test_model = CreateUserDto(
            password_hash="eveniet", email="sed", last_name="magnam", first_name="sed"
        )
        self.assertEqual(test_model.password_hash, "eveniet")
        self.assertEqual(test_model.email, "sed")
        self.assertEqual(test_model.last_name, "magnam")
        self.assertEqual(test_model.first_name, "sed")

    def test_create_user_dto_required_fields_missing(self):
        # Assert CreateUserDto class generation fails without required fields
        with self.assertRaises(TypeError):
            test_model = CreateUserDto()


if __name__ == "__main__":
    unittest.main()
