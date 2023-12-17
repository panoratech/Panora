from os import getenv
from pprint import pprint
from panorasdk import PanoraSDK

sdk = PanoraSDK()
sdk.set_access_token(getenv("PANORASDK_ACCESS_TOKEN"))

results = sdk.main.app_controller_get_hello()

pprint(vars(results))
