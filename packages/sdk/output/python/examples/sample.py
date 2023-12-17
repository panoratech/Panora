from os import getenv
from pprint import pprint
from testsdk import Testsdk

sdk = Testsdk()
sdk.set_access_token(getenv("TESTSDK_ACCESS_TOKEN"))

results = sdk.main.app_controller_get_hello()

pprint(vars(results))
