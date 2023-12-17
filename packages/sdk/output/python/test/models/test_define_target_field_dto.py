import unittest
from src.testsdk.models.DefineTargetFieldDto import DefineTargetFieldDto


class TestDefineTargetFieldDtoModel(unittest.TestCase):
    def test_true(self):
        self.assertTrue(True)

    def test_define_target_field_dto(self):
        # Create DefineTargetFieldDto class instance
        test_model = DefineTargetFieldDto(
            data_type="quas",
            description="consectetur",
            name="asperiores",
            object_type_owner={"ex": 9},
        )
        self.assertEqual(test_model.data_type, "quas")
        self.assertEqual(test_model.description, "consectetur")
        self.assertEqual(test_model.name, "asperiores")
        self.assertEqual(test_model.object_type_owner, {"ex": 9})

    def test_define_target_field_dto_required_fields_missing(self):
        # Assert DefineTargetFieldDto class generation fails without required fields
        with self.assertRaises(TypeError):
            test_model = DefineTargetFieldDto()


if __name__ == "__main__":
    unittest.main()
