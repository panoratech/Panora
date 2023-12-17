"""
Helper functions for http calls.

Functions:
    to_serialize
"""

import io
from enum import Enum


def to_serialize(obj):
    """
    Recursively converts objects into dictionaries.

    Parameters:
    ----------
        obj:
            The object to transform into a dictionary.
    """
    result = {}
    if not hasattr(obj, "__dict__") or isinstance(
        obj, (io.TextIOWrapper, io.BufferedIOBase)
    ):
        return obj
    iter_obj = obj.__dict__.items() if hasattr(obj, "__dict__") else obj.items()
    for key, value in iter_obj:
        if isinstance(value, (io.TextIOWrapper, io.BufferedIOBase)):
            result[key] = value
        elif isinstance(value, Enum):
            result[key] = value.value
        elif isinstance(value, (list, set, tuple)):
            for i in range(len(value)):
                value[i] = to_serialize(value[i])
            result[key] = value
        elif hasattr(value, "__dict__"):
            result[key] = to_serialize(value)
        else:
            result[key] = value
    return result


response_mapper = {"headers": "headers_"}
request_mapper = {"headers_": "headers"}


def rename_keys(data, mapper):
    if isinstance(data, dict):
        new_data = {}
        for key, value in data.items():
            new_key = mapper[key] if key in mapper else key
            new_data[new_key] = rename_keys(value, mapper)
        return new_data
    elif isinstance(data, list):
        return [rename_keys(item, mapper) for item in data]
    else:
        return data


def rename_reserved_keys(data):
    return rename_keys(data, response_mapper)


def rename_to_reserved_keys(data):
    return rename_keys(data, request_mapper)
