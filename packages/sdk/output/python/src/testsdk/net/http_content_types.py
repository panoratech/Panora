"""
Collection of API calls according to the HTTP method and content type.

Functions:
    multipart_form_data_request
"""
import requests
import io
from mimetypes import guess_type


def multipart_form_data_request(method, endpoint_url, headers, body_input):
    """
    Places a multipart/formdata http request.

    Parameters:
    ----------
        method : str
            The type of http call to perform
        endpoint_url : url
            The endpoint url to make the http call on
        headers : dict
            The http call's headers
        body_input : Any
            The request's body
    """
    data = {}
    files = {}
    request_method = getattr(requests, method)
    del headers["Content-type"]
    for key, value in body_input.items():
        if isinstance(value, (io.TextIOWrapper, io.BufferedIOBase)):
            mime_type, encoding = guess_type(value.name)
            file_tuple = (
                (value.name, value, mime_type) if mime_type else (value.name, value)
            )
            files[key] = file_tuple
        else:
            data[key] = value
    if files:
        return request_method(endpoint_url, headers=headers, files=files, data=data)
    return request_method(endpoint_url, headers=headers, data=data)
