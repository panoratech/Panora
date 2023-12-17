import unittest
from src.testsdk.models.CreateLinkedUserDto import CreateLinkedUserDto


class TestCreateLinkedUserDtoModel(unittest.TestCase):
    def test_true(self):
        self.assertTrue(True)

    def test_create_linked_user_dto(self):
        # Create CreateLinkedUserDto class instance
        test_model = CreateLinkedUserDto(
            id_project="beatae", alias="est", linked_user_origin_id="laboriosam"
        )
        self.assertEqual(test_model.id_project, "beatae")
        self.assertEqual(test_model.alias, "est")
        self.assertEqual(test_model.linked_user_origin_id, "laboriosam")

    def test_create_linked_user_dto_required_fields_missing(self):
        # Assert CreateLinkedUserDto class generation fails without required fields
        with self.assertRaises(TypeError):
            test_model = CreateLinkedUserDto()


if __name__ == "__main__":
    unittest.main()
