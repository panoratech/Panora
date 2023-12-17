import unittest
from src.panorasdk.models.LoginCredentials import LoginCredentials


class TestLoginCredentialsModel(unittest.TestCase):
    def test_true(self):
        self.assertTrue(True)

    def test_login_credentials(self):
        # Create LoginCredentials class instance
        test_model = LoginCredentials(password_hash="facere", id_user=5, email="nam")
        self.assertEqual(test_model.password_hash, "facere")
        self.assertEqual(test_model.id_user, 5)
        self.assertEqual(test_model.email, "nam")

    def test_login_credentials_required_fields_missing(self):
        # Assert LoginCredentials class generation fails without required fields
        with self.assertRaises(TypeError):
            test_model = LoginCredentials()


if __name__ == "__main__":
    unittest.main()
