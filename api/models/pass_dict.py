import os
import uuid

from advisorapp.settings import API_URL

pass_dict = {
    "formatVersion": 1,
    "webServiceURL": f"{API_URL}/passes/",
    "authenticationToken": os.environ.get("APPLE_PASS_AUTH_TOKEN", uuid.uuid4().hex),
    "locations": [
        {"longitude": -122.3748889, "latitude": 37.6189722},
        {"longitude": -122.03118, "latitude": 37.33182},
    ],
    "barcode": {
        "message": "nsgcrm.com/nikhilpawar",
        "format": "PKBarcodeFormatQR",
        "messageEncoding": "iso-8859-1",
    },
    "organizationName": "NSG Business Card",
    "description": "Digital Business Card",
    "logoText": "NSG Business Card",
    "foregroundColor": "rgb(255, 255, 255)",
    "backgroundColor": "rgb(0, 0, 0)",
    "labelColor": "rgb(255, 255, 255)", 
    "generic": {
       
        
    },
}
