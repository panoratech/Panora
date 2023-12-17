import re
from typing import List, Union
from enum import Enum


class BaseModel:
    """
    A base class that all models in the SDK inherit from (expect for Enum models).

    Methods
    -------
    _pattern_matching(cls, value: str, pattern: str, variable_name: str) -> str:
        Checks if a value matches a regex pattern.
        Returns the value if there's a match, otherwise throws an error.
    _enum_matching(cls, value: Union[str,Enum], enum_values: List[str], variable_name: str) -> str:
        Checks if a value (str or enum) matches the required enum values.
        Returns the value if there's a match, otherwise throws an error.
    _one_of(cls, required_array, all_array, functions_array, input_data):
        Validates whether an input_data satisfies the oneOf requirements.
    """

    def __init__(self):
        pass

    def _pattern_matching(cls, value: str, pattern: str, variable_name: str):
        if re.match(r"{}".format(pattern), value):
            return value
        else:
            raise ValueError(f"Invalid value for {variable_name}: must match {pattern}")

    def _enum_matching(
        cls, value: Union[str, Enum], enum_values: List[str], variable_name: str
    ):
        str_value = value.value if isinstance(value, Enum) else value
        if str_value in enum_values:
            return value
        else:
            raise ValueError(
                f"Invalid value for {variable_name}: must match one of {enum_values}"
            )

    @classmethod
    def _one_of(cls, required_array, all_array, functions_array, input_data):
        input_array = list(input_data.keys())
        for model, fields in required_array.items():
            input_copy = input_array.copy()
            matches_required = True
            for param in fields:
                if param not in input_copy:
                    matches_required = False
                    break
                input_copy.remove(param)
            if matches_required:
                matches_all = True
                for input in input_copy:
                    if input not in all_array[model]:
                        matches_all = False
                        break
                if matches_all:
                    return functions_array[model](input_data)
