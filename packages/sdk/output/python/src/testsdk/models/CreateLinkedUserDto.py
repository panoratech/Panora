from .base import BaseModel


class CreateLinkedUserDto(BaseModel):
    def __init__(
        self, id_project: str, alias: str, linked_user_origin_id: str, **kwargs
    ):
        """
        Initialize CreateLinkedUserDto
        Parameters:
        ----------
            id_project: str
            alias: str
            linked_user_origin_id: str
        """
        self.id_project = id_project
        self.alias = alias
        self.linked_user_origin_id = linked_user_origin_id
