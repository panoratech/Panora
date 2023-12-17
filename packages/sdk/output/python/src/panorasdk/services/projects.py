from urllib.parse import quote

from .base import BaseService
from ..models.CreateProjectDto import CreateProjectDto as CreateProjectDtoModel


class Projects(BaseService):
    def projects_controller_get_projects(self):
        url_endpoint = "/projects"
        headers = {}
        self._add_required_headers(headers)

        final_url = self._url_prefix + url_endpoint
        res = self._http.get(final_url, headers, True)
        return res

    def projects_controller_create_project(self, request_input: CreateProjectDtoModel):
        url_endpoint = "/projects/create"
        headers = {"Content-type": "application/json"}
        self._add_required_headers(headers)

        final_url = self._url_prefix + url_endpoint
        res = self._http.post(final_url, headers, request_input, True)
        return res
