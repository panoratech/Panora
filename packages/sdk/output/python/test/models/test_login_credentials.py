import unittest
from src.testsdk.models.LoginCredentials import LoginCredentials


class TestLoginCredentialsModel(unittest.TestCase):
    def test_true(self):
        self.assertTrue(True)

    def test_login_credentials(self):
        # Create LoginCredentials class instance
        test_model = LoginCredentials(
            password_hash="nihil", id_user="commodi", email="id"
        )
        self.assertEqual(test_model.password_hash, "nihil")
        self.assertEqual(test_model.id_user, "commodi")
        self.assertEqual(test_model.email, "id")

    def test_login_credentials_required_fields_missing(self):
        # Assert LoginCredentials class generation fails without required fields
        with self.assertRaises(TypeError):
            test_model = LoginCredentials()


if __name__ == "__main__":
    unittest.main()
