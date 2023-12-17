from .base import BaseModel


class CreateOrganizationDto(BaseModel):
    def __init__(self, stripe_customer_id: str, name: str, **kwargs):
        """
        Initialize CreateOrganizationDto
        Parameters:
        ----------
            stripe_customer_id: str
            name: str
        """
        self.stripe_customer_id = stripe_customer_id
        self.name = name
