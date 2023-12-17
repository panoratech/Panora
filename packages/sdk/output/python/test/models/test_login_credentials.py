import unittest
from src.testsdk.models.LoginCredentials import LoginCredentials


class TestLoginCredentialsModel(unittest.TestCase):
    def test_true(self):
        self.assertTrue(True)

    def test_login_credentials(self):
        # Create LoginCredentials class instance
        test_model = LoginCredentials(password_hash="labore", id_user=1, email="quis")
        self.assertEqual(test_model.password_hash, "labore")
        self.assertEqual(test_model.id_user, 1)
        self.assertEqual(test_model.email, "quis")

    def test_login_credentials_required_fields_missing(self):
        # Assert LoginCredentials class generation fails without required fields
        with self.assertRaises(TypeError):
            test_model = LoginCredentials()


if __name__ == "__main__":
    unittest.main()
