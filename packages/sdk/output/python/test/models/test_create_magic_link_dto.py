import unittest
from src.panorasdk.models.CreateMagicLinkDto import CreateMagicLinkDto


class TestCreateMagicLinkDtoModel(unittest.TestCase):
    def test_true(self):
        self.assertTrue(True)

    def test_create_magic_link_dto(self):
        # Create CreateMagicLinkDto class instance
        test_model = CreateMagicLinkDto(
            id_project="reprehenderit",
            alias="quo",
            email="sapiente",
            linked_user_origin_id="quia",
        )
        self.assertEqual(test_model.id_project, "reprehenderit")
        self.assertEqual(test_model.alias, "quo")
        self.assertEqual(test_model.email, "sapiente")
        self.assertEqual(test_model.linked_user_origin_id, "quia")

    def test_create_magic_link_dto_required_fields_missing(self):
        # Assert CreateMagicLinkDto class generation fails without required fields
        with self.assertRaises(TypeError):
            test_model = CreateMagicLinkDto()


if __name__ == "__main__":
    unittest.main()
