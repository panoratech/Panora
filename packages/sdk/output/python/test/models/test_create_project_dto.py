import unittest
from src.testsdk.models.CreateProjectDto import CreateProjectDto


class TestCreateProjectDtoModel(unittest.TestCase):
    def test_true(self):
        self.assertTrue(True)

    def test_create_project_dto(self):
        # Create CreateProjectDto class instance
        test_model = CreateProjectDto(id_organization="ullam", name="unde")
        self.assertEqual(test_model.id_organization, "ullam")
        self.assertEqual(test_model.name, "unde")

    def test_create_project_dto_required_fields_missing(self):
        # Assert CreateProjectDto class generation fails without required fields
        with self.assertRaises(TypeError):
            test_model = CreateProjectDto()


if __name__ == "__main__":
    unittest.main()
