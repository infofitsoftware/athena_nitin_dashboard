from app.core.config import settings
from app.core.security import create_access_token
from app.schemas.auth import UserResponse


class AuthService:
    """Authentication service with mock authentication for v1"""
    
    # Mock user database (in production, use a real database)
    MOCK_USERS = {
        settings.admin_username: {
            "username": settings.admin_username,
            "password": settings.admin_password,  # In production, use hashed passwords
            "email": settings.admin_email,
            "role": "admin",
        }
    }
    
    @classmethod
    def authenticate_user(cls, username: str, password: str) -> UserResponse | None:
        """
        Authenticate a user (mock implementation for v1)
        
        Args:
            username: Username
            password: Password
            
        Returns:
            UserResponse if authenticated, None otherwise
        """
        user = cls.MOCK_USERS.get(username)
        
        if not user:
            return None
        
        # In production, use password hashing (passlib)
        if user["password"] != password:
            return None
        
        return UserResponse(
            username=user["username"],
            email=user["email"],
            role=user["role"],
        )
    
    @classmethod
    def create_token_for_user(cls, user: UserResponse) -> str:
        """
        Create JWT token for authenticated user
        
        Args:
            user: UserResponse object
            
        Returns:
            JWT token string
        """
        token_data = {
            "sub": user.username,
            "email": user.email,
            "role": user.role,
        }
        return create_access_token(token_data)
