from typing import Any

from pydantic import (
    SecretStr,
    field_validator,
    Field,
    BaseModel,
)
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing_extensions import Annotated

Port = Annotated[int, Field(ge=0, le=65535)]


def normalize_none(env_value: str) -> Any | None:
    if env_value == "":
        return None
    return env_value
 
    
class MongoSettings(BaseModel):
    # host: str
    # port: Port
    # username: str
    # password: SecretStr
    # db: str
    # collection: str
    # auth_source: str

    normalize_none = field_validator("*", mode="before")(normalize_none)

    def url(self) -> str:
        # return f'mongodb://{self.username}:{self.password.get_secret_value()}@{self.host}{":" + str(self.port) if self.port else None}/{self.db}?authSource={self.auth_source}'
        return 'mongodb://root:example@localhost:27017/'



class Settings(BaseSettings):
    # mongo: MongoSettings
    mongo : str = 'mongodb://root:example@localhost:27017/'
    model_config = SettingsConfigDict(
        env_file=".env",  # Pokud není definováno, nenačte se žádný soubor.
        env_file_encoding="utf-8",  # Pokud není definováno, použije se kódování systému
        case_sensitive=False,  # Pokud není definováno, použije se hodnota False
        extra="ignore",  # Pokud není definováno, použije se hodnota "forbid"
        arbitrary_types_allowed=True,  # Pokud není definováno, použije se hodnota False
        env_nested_delimiter="__",  # Definice víceúrovňových proměnných
    )


settings = Settings()
