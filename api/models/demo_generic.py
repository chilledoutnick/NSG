#
# Copyright 2022 Google Inc. All rights reserved.
#
#
# Licensed under the Apache License, Version 2.0 (the "License"); you may not
# use this file except in compliance with the License. You may obtain a copy of
# the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations under
# the License.
#

# [START setup]
# [START imports]
import json
import os
import uuid

from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.oauth2.service_account import Credentials
from google.auth import jwt, crypt

from django.conf import settings

GOOGLE_APPLICATION_CREDENTIALS = getattr(settings, "GOOGLE_APPLICATION_CREDENTIALS", "")
API_URL = getattr(settings, "API_URL", "")


# [END imports]


class DemoGeneric:
    """Demo class for creating and managing Generic passes in Google Wallet.

    Attributes:
        key_file_path: Path to service account key file from Google Cloud
            Console. Environment variable: GOOGLE_APPLICATION_CREDENTIALS.
        base_url: Base URL for Google Wallet API requests.
    """

    def __init__(self):
        self.key_file_path = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS',
                                            GOOGLE_APPLICATION_CREDENTIALS)
        self.credentials = None
        self.client = None
        # Set up authenticated client if credentials file exists
        if self.key_file_path and os.path.exists(self.key_file_path):
            try:
                self.auth()
            except Exception:
                pass

    # [END setup]

    # [START auth]
    def auth(self):
        """Create authenticated HTTP client using a service account file."""
        if not self.key_file_path or not os.path.exists(self.key_file_path):
            raise FileNotFoundError("Google Application Credentials file not found")
        self.credentials = Credentials.from_service_account_file(
            self.key_file_path,
            scopes=['https://www.googleapis.com/auth/wallet_object.issuer'])

        self.client = build('walletobjects', 'v1', credentials=self.credentials)

    # [END auth]

    # [START createClass]
    def create_class(self, issuer_id: str, class_suffix: str) -> str:
        """Create a class.

        Args:
            issuer_id (str): The issuer ID being used for this request.
            class_suffix (str): Developer-defined unique ID for this pass class.

        Returns:
            The pass class ID: f"{issuer_id}.{class_suffix}"
        """

        # Check if the class exists
        try:
            self.client.genericclass().get(resourceId=f'{issuer_id}.{class_suffix}').execute()
        except HttpError as e:
            if e.status_code != 404:
                # Something else went wrong...
                print(e.error_details)
                return f'{issuer_id}.{class_suffix}'
        else:
            print(f'Class {issuer_id}.{class_suffix} already exists!')
            return f'{issuer_id}.{class_suffix}'

        # See link below for more information on required properties
        # https://developers.google.com/wallet/generic/rest/v1/genericclass
        new_class = {'id': f'{issuer_id}.{class_suffix}'}

        response = self.client.genericclass().insert(body=new_class).execute()

        print('Class insert response')
        print(response)

        return f'{issuer_id}.{class_suffix}'

    # [END createClass]

    # [START createObject]
    def create_object(self, issuer_id: str, class_suffix: str, object_suffix: str) -> str:
        """Create an object if it doesn't exist.

        Args:
            issuer_id (str): The issuer ID being used for this request.
            class_suffix (str): Developer-defined unique ID for the pass class.
            object_suffix (str): Developer-defined unique ID for the pass object.

        Returns:
            The pass object ID: f"{issuer_id}.{object_suffix}"
        """

        # Generate the resource ID for the object
        resource_id = f'{issuer_id}.{object_suffix}'
        
        # Check if the object exists
        try:
            self.client.genericobject().get(resourceId=resource_id).execute()
            print(f'Object {resource_id} already exists!')
            return resource_id  # Object already exists, return its ID
        except HttpError as e:
            if e.resp.status != 404:
                # Something else went wrong (not a 404 error)
                print(f'Error occurred while checking for existing object: {str(e)}')
                return resource_id

        # Object does not exist, proceed with creating a new one
        new_object = {
            'id': resource_id,
            'classId': f'{issuer_id}.{class_suffix}',
            'state': 'ACTIVE',
            'logo': {
                'sourceUri': {
                    'uri': 'https://storage.googleapis.com/nsg-crm-storage-public/media/webp_images/Group_1000002657_png.webp'
                },
                'contentDescription': {
                    'defaultValue': {
                        'language': 'en-US',
                        'value': 'LOGO_IMAGE_DESCRIPTION'
                    }
                }
            },
            'cardTitle': {
                'defaultValue': {
                    'language': 'en-US',
                    'value': 'NSG Business Card'
                }
            },
            'subheader': {
                'defaultValue': {
                    'language': 'en-US',
                    'value': 'Nikhil'
                }
            },
            'header': {
                'defaultValue': {
                    'language': 'en-US',
                    'value': 'NSG'
                }
            },
            'textModulesData': [
                {
                    'id': 'designation',
                    'header': 'Designation',
                    'body': ''
                }
            ],
            'barcode': {
                'type': 'QR_CODE',
                'value': 'nsgcrm.com',
                'alternateText': ''
            },
            'hexBackgroundColor': '#000000'
        }

        # Create the object
        try:
            response = self.client.genericobject().insert(body=new_object).execute()
            print('Object insert response:', response)
            return resource_id
        except HttpError as e:
            print(f'Error occurred while creating object: {str(e)}')
            return None

    # [END createObject]

    # [START updateObject]
    def update_object(self, issuer_id: str, object_suffix: str,name: str, company: str, username: str) -> str:
        """Update an object.

        **Warning:** This replaces all existing object attributes!

        Args:
            issuer_id (str): The issuer ID being used for this request.
            object_suffix (str): Developer-defined unique ID for the pass object.

        Returns:
            The pass object ID: f"{issuer_id}.{object_suffix}"
        """

        # Check if the object exists
        try:
            response = self.client.genericobject().get(resourceId=f'{issuer_id}.{object_suffix}').execute()
        except HttpError as e:
            if e.status_code == 404:
                print(f'Object {issuer_id}.{object_suffix} not found!')
                return f'{issuer_id}.{object_suffix}'
            else:
                # Something else went wrong...
                print(e.error_details)
                return f'{issuer_id}.{object_suffix}'

        # Object exists
        updated_object = response

        updated_object['subheader']['defaultValue']['value']=name
        updated_object['header']['defaultValue']['value'] = company
        username_str = ''.join(username)
        updated_object['barcode']['value'] = f'nsgcrm.com/{username_str}'
        print (username_str)
        

        # Update the object by adding a link
        new_link = {
            'uri': 'https://developers.google.com/wallet',
            'description': 'New link description'
        }
        if not updated_object.get('linksModuleData'):
            updated_object['linksModuleData'] = {'uris': []}
        updated_object['linksModuleData']['uris'].append(new_link)

        response = self.client.genericobject().update(
            resourceId=f'{issuer_id}.{object_suffix}',
            body=updated_object).execute()

        print('Object update response')
        print(response)

        return f'{issuer_id}.{object_suffix}'

    # [END updateObject]

    # [START jwtNew]
    def create_jwt_new_objects(self, issuer_id: str, class_suffix: str,
                               object_suffix: str) -> str:
        """Generate a signed JWT that creates a new pass class and object.

        When the user opens the "Add to Google Wallet" URL and saves the pass to
        their wallet, the pass class and object defined in the JWT are
        created. This allows you to create multiple pass classes and objects in
        one API call when the user saves the pass to their wallet.

        Args:
            issuer_id (str): The issuer ID being used for this request.
            class_suffix (str): Developer-defined unique ID for the pass class.
            object_suffix (str): Developer-defined unique ID for the pass object.

        Returns:
            An "Add to Google Wallet" link.
        """

        # See link below for more information on required properties
        # https://developers.google.com/wallet/generic/rest/v1/genericclass
        new_class = {'id': f'{issuer_id}.{class_suffix}'}

        # See link below for more information on required properties
        # https://developers.google.com/wallet/generic/rest/v1/genericobject
        new_object = {
            'id': f'{issuer_id}.{object_suffix}',
            'classId': f'{issuer_id}.{class_suffix}',
            'state': 'ACTIVE',
                        "logo": {
                            "sourceUri": {
                            "uri": "https://storage.googleapis.com/nsg-crm-storage-public/media/webp_images/Group_1000002657_png.webp"
                            },
                            "contentDescription": {
                            "defaultValue": {
                                "language": "en-US",
                                "value": "LOGO_IMAGE_DESCRIPTION"
                            }
                            }
                        },
                        "cardTitle": {
                            "defaultValue": {
                            "language": "en-US",
                            "value": "NSG Business Card"
                            }
                        },
                        "header": {
                            "defaultValue": {
                            "language": "en-US",
                            "value": "Nikhil Pawar"
                            }
                        },
                        "textModulesData": [
                            {
                            "id": "designation",
                            "header": "Designation",
                            "body": ""
                            }
                        ],
                        "barcode": {
                            "type": "QR_CODE",
                            "value": "nsgcrm.com",
                            "alternateText": ""
                        },
                        "hexBackgroundColor": "#000000"

                    }

        # Create the JWT claims
        claims = {
            'iss': self.credentials.service_account_email,
            'aud': 'google',
            'origins': [API_URL],
            'typ': 'savetowallet',
            'payload': {
                # The listed classes and objects will be created
                'genericClasses': [new_class],
                'genericObjects': [new_object]
            }
        }

        # The service account credentials are used to sign the JWT
        signer = crypt.RSASigner.from_service_account_file(self.key_file_path)
        token = jwt.encode(signer, claims).decode('utf-8')

        print('Add to Google Wallet link')
        print(f'https://pay.google.com/gp/v/save/{token}')

        return f'https://pay.google.com/gp/v/save/{token}'

    # [END jwtNew]

    # [START jwtExisting]
    def create_jwt_existing_objects(self, issuer_id: str) -> str:
        """Generate a signed JWT that references an existing pass object.

        When the user opens the "Add to Google Wallet" URL and saves the pass to
        their wallet, the pass objects defined in the JWT are added to the
        user's Google Wallet app. This allows the user to save multiple pass
        objects in one API call.

        The objects to add must follow the below format:

        {
            'id': 'ISSUER_ID.OBJECT_SUFFIX',
            'classId': 'ISSUER_ID.CLASS_SUFFIX'
        }

        Args:
            issuer_id (str): The issuer ID being used for this request.

        Returns:
            An "Add to Google Wallet" link
        """

        # Multiple pass types can be added at the same time
        # At least one type must be specified in the JWT claims
        # Note: Make sure to replace the placeholder class and object suffixes
        objects_to_add = {
            # Event tickets
          
            # Generic passes
            'genericObjects': [{
                'id': f'{issuer_id}.nsg_obj',
                'classId': f'{issuer_id}.codelab_class'
            }],

                    }

        # Create the JWT claims
        claims = {
            'iss': self.credentials.service_account_email,
            'aud': 'google',
            'origins': [API_URL],
            'typ': 'savetowallet',
            'payload': objects_to_add
        }

        # The service account credentials are used to sign the JWT
        signer = crypt.RSASigner.from_service_account_file(self.key_file_path)
        token = jwt.encode(signer, claims).decode('utf-8')

        print('Add to Google Wallet link')
        print(f'https://pay.google.com/gp/v/save/{token}')

        return f'https://pay.google.com/gp/v/save/{token}'

    # [END jwtExisting]

   
