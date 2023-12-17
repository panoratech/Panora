import unittest
from src.testsdk.models.CreateProjectDto import CreateProjectDto


class TestCreateProjectDtoModel(unittest.TestCase):
    def test_true(self):
        self.assertTrue(True)

    def test_create_project_dto(self):
        # Create CreateProjectDto class instance
        test_model = CreateProjectDto(id_organization="hic", name="corrupti")
        self.assertEqual(test_model.id_organization, "hic")
        self.assertEqual(test_model.name, "corrupti")

    def test_create_project_dto_required_fields_missing(self):
        # Assert CreateProjectDto class generation fails without required fields
        with self.assertRaises(TypeError):
            test_model = CreateProjectDto()


if __name__ == "__main__":
    unittest.main()
