from .base import BaseModel


class CreateMagicLinkDto(BaseModel):
    def __init__(
        self,
        id_project: str,
        alias: str,
        email: str,
        linked_user_origin_id: str,
        **kwargs,
    ):
        """
        Initialize CreateMagicLinkDto
        Parameters:
        ----------
            id_project: str
            alias: str
            email: str
            linked_user_origin_id: str
        """
        self.id_project = id_project
        self.alias = alias
        self.email = email
        self.linked_user_origin_id = linked_user_origin_id
