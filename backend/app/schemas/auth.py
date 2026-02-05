from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    """Login request schema"""
    username: str
    password: str


class TokenResponse(BaseModel):
    """Token response schema"""
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    """User response schema"""
    username: str
    email: str
    role: str


# Update forward reference
TokenResponse.model_rebuild()
