import unittest
from src.testsdk.models.DefineTargetFieldDto import DefineTargetFieldDto


class TestDefineTargetFieldDtoModel(unittest.TestCase):
    def test_true(self):
        self.assertTrue(True)

    def test_define_target_field_dto(self):
        # Create DefineTargetFieldDto class instance
        test_model = DefineTargetFieldDto(
            data_type="ipsam",
            description="minima",
            name="unde",
            object_type_owner={"numquam": 1},
        )
        self.assertEqual(test_model.data_type, "ipsam")
        self.assertEqual(test_model.description, "minima")
        self.assertEqual(test_model.name, "unde")
        self.assertEqual(test_model.object_type_owner, {"numquam": 1})

    def test_define_target_field_dto_required_fields_missing(self):
        # Assert DefineTargetFieldDto class generation fails without required fields
        with self.assertRaises(TypeError):
            test_model = DefineTargetFieldDto()


if __name__ == "__main__":
    unittest.main()
