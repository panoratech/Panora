from typing import Any, Dict, List
from enum import Enum

explode = bool


def form(parameter_name: str, parameter_value: Any, explode: bool) -> str:
    if isinstance(parameter_value, Enum):
        return f"{parameter_name}=" + str(parameter_value.value)

    if isinstance(parameter_value, list):
        return (
            "&".join([f"{parameter_name}={v}" for v in parameter_value])
            if explode
            else f"{parameter_name}=" + ",".join([str(v) for v in parameter_value])
        )

    if isinstance(parameter_value, dict):
        if explode:
            # Serialize object with exploded format: "key1=value1&key2=value2"
            return "&".join([f"{k}={v}" for k, v in parameter_value.items()])
        else:
            # Serialize object with non-exploded format: "key=key1,value1,key2,value2"
            return f"{parameter_name}=" + ",".join(
                [str(item) for sublist in parameter_value.items() for item in sublist]
            )

    return f"{parameter_name}=" + str(parameter_value)


style_methods = {
    "form": form,
}


def serialize_query(parameter_style, explode, key: str, parameter_value: Any) -> str:
    method = style_methods.get(parameter_style)
    return method(key, parameter_value, explode) if method else ""
