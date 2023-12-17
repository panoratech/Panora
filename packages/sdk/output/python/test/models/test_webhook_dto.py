import unittest
from src.testsdk.models.WebhookDto import WebhookDto


class TestWebhookDtoModel(unittest.TestCase):
    def test_true(self):
        self.assertTrue(True)

    def test_webhook_dto(self):
        # Create WebhookDto class instance
        test_model = WebhookDto(
            scope="tempore", id_project="quo", url="assumenda", description="esse"
        )
        self.assertEqual(test_model.scope, "tempore")
        self.assertEqual(test_model.id_project, "quo")
        self.assertEqual(test_model.url, "assumenda")
        self.assertEqual(test_model.description, "esse")

    def test_webhook_dto_required_fields_missing(self):
        # Assert WebhookDto class generation fails without required fields
        with self.assertRaises(TypeError):
            test_model = WebhookDto()


if __name__ == "__main__":
    unittest.main()
