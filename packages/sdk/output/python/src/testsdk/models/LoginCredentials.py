from .base import BaseModel


class LoginCredentials(BaseModel):
    def __init__(
        self, password_hash: str, id_user: str = None, email: str = None, **kwargs
    ):
        """
        Initialize LoginCredentials
        Parameters:
        ----------
            password_hash: str
            id_user: str
            email: str
        """
        self.password_hash = password_hash
        if id_user is not None:
            self.id_user = id_user
        if email is not None:
            self.email = email
