from typing import Any, Dict, List
from enum import Enum

explode = bool


def simple(value: Any, explode: bool) -> str:
    if value is None:
        return "null"

    if isinstance(value, Enum):
        return str(value.value)

    if isinstance(value, bool):
        return str(value).lower()

    if isinstance(value, list):
        serialized_list = [simple(item, explode) for item in value]
        return ",".join(serialized_list)

    if isinstance(value, dict):
        if explode:
            # Serialize object with exploded format: "key=value,key2=value2"
            return ",".join([f"{k}={simple(v, explode)}" for k, v in value.items()])
        else:
            # Serialize object with non-exploded format: "key,value,key2,value2"
            return ",".join(
                [simple(item, explode) for sublist in value.items() for item in sublist]
            )

    return str(value)


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
    "simple": simple,
    "form": form,
}


def serialize_query(parameter_style, explode, key: str, parameter_value: Any) -> str:
    method = style_methods.get(parameter_style)
    return method(key, parameter_value, explode) if method else ""


def serialize_path(
    parameter_style, explode: bool, parameter_value: Any, parameter_key=None
):
    method = style_methods.get(parameter_style)
    if not method:
        return ""

    # The `simple` and `label` styles do not require a `parameter_key`
    if not parameter_key:
        return method(parameter_value, explode)
    else:
        return method(parameter_key, parameter_value, explode)
