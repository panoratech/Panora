from .base import BaseModel


class MapFieldToProviderDto(BaseModel):
    def __init__(
        self,
        linked_user_id: str,
        source_provider: str,
        source_custom_field_id: str,
        attributeId: str,
        **kwargs,
    ):
        """
        Initialize MapFieldToProviderDto
        Parameters:
        ----------
            linked_user_id: str
            source_provider: str
            source_custom_field_id: str
            attributeId: str
        """
        self.linked_user_id = linked_user_id
        self.source_provider = source_provider
        self.source_custom_field_id = source_custom_field_id
        self.attributeId = attributeId
