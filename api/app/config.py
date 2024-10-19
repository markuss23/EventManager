from pydantic import (
    SecretStr,
    Field,
    BaseModel,
)
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing_extensions import Annotated

Port = Annotated[int, Field(ge=0, le=65535)]


class MongoSettings(BaseModel):
    host: str
    port: Port
    db: str
    username: str
    password: SecretStr

    def url(self) -> str:
        return f'mongodb://{self.username}:{self.password.get_secret_value()}@{self.host}{":" + str(self.port)}/'
    
    
class RedisSettings(BaseModel):
    host: str
    port: Port
    db: int


class Settings(BaseSettings):
    mongo: MongoSettings
    redis: RedisSettings
    model_config = SettingsConfigDict(
        env_file=".env",  # Pokud není definováno, nenačte se žádný soubor.
        env_file_encoding="utf-8",  # Pokud není definováno, použije se kódování systému
        case_sensitive=False,  # Pokud není definováno, použije se hodnota False
        extra="ignore",  # Pokud není definováno, použije se hodnota "forbid"
        arbitrary_types_allowed=True,  # Pokud není definováno, použije se hodnota False
        env_nested_delimiter="__",  # Definice víceúrovňových proměnných
    )


settings = Settings()
