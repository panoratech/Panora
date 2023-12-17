from .base import BaseModel


class ObjectTypeOwner(dict):
    def __init__(self, *args, **kwargs):
        dict.__init__(self, *args, **kwargs)


class DefineTargetFieldDto(BaseModel):
    def __init__(
        self,
        data_type: str,
        description: str,
        name: str,
        object_type_owner: ObjectTypeOwner,
        **kwargs,
    ):
        """
        Initialize DefineTargetFieldDto
        Parameters:
        ----------
            data_type: str
            description: str
            name: str
            object_type_owner: ObjectTypeOwner
        """
        self.data_type = data_type
        self.description = description
        self.name = name
        self.object_type_owner = object_type_owner
