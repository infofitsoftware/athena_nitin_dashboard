from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Athena Dashboard API"
    app_version: str = "0.1.0"
    debug: bool = True

    aws_access_key_id: str | None = None
    aws_secret_access_key: str | None = None
    aws_region: str = "us-east-1"

    athena_workgroup: str | None = None
    athena_database: str | None = None
    athena_table: str | None = None
    athena_output_s3: str | None = None

    # Authentication
    jwt_secret_key: str = "your-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = 15

    # Admin credentials (for v1 mock auth)
    admin_username: str = "admin"
    admin_password: str = "admin123"  # Change in production
    admin_email: str = "admin@athena-dashboard.com"

    # CORS
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

