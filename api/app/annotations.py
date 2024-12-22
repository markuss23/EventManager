from typing import Annotated

from fastapi import Path


ID_PATH_ANNOTATION = Annotated[
    str,
    Path(
        title="User ID",
        description="Unique MongoDB ObjectId identifier for the user",
        example="67680890d5a21a105bacb191",
    ),
]