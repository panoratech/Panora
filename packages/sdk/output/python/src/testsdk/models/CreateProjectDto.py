from .base import BaseModel


class CreateProjectDto(BaseModel):
    def __init__(self, id_organization: str, name: str, **kwargs):
        """
        Initialize CreateProjectDto
        Parameters:
        ----------
            id_organization: str
            name: str
        """
        self.id_organization = id_organization
        self.name = name
