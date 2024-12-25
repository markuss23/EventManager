from typing import Annotated

from fastapi import Path, Query


ID_PATH_ANNOTATION = Annotated[
    str,
    Path(
        title="User ID",
        description="Unique MongoDB ObjectId identifier for the user",
        example="67680890d5a21a105bacb191",
    ),
]


ATTEND_ANNOTATION = Annotated[
    list[str] | None,
    Query(
        title="Attend",
        description="Filter events by attendance status",
        example="67680890d5a21a105bacb191",
    ),
]
