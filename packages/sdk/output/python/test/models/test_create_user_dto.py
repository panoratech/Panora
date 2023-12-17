import unittest
from src.testsdk.models.CreateUserDto import CreateUserDto


class TestCreateUserDtoModel(unittest.TestCase):
    def test_true(self):
        self.assertTrue(True)

    def test_create_user_dto(self):
        # Create CreateUserDto class instance
        test_model = CreateUserDto(
            password_hash="non",
            email="vero",
            last_name="quidem",
            first_name="consequatur",
        )
        self.assertEqual(test_model.password_hash, "non")
        self.assertEqual(test_model.email, "vero")
        self.assertEqual(test_model.last_name, "quidem")
        self.assertEqual(test_model.first_name, "consequatur")

    def test_create_user_dto_required_fields_missing(self):
        # Assert CreateUserDto class generation fails without required fields
        with self.assertRaises(TypeError):
            test_model = CreateUserDto()


if __name__ == "__main__":
    unittest.main()
