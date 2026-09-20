import json
import hashlib
import os
import sys
import shutil
import uuid
from typing import Callable, Optional, TypedDict
from zipfile import ZipFile

from pass_dict import pass_dict




PK_PASS_NAME = os.environ.get("APPLE_PASS_NAME", "NSG")
OPENSSL_APP = os.environ.get("OPENSSL_APP", "openssl")
key_password = os.environ.get("APPLE_PASS_PASSWORD", "")
CERTIFICATE_PATH = os.environ.get("APPLE_CERTIFICATE_PATH", os.path.join(os.path.dirname(__file__), 'Certificates.p12'))
wwdr_path = os.environ.get("APPLE_WWDR_PATH", os.path.join(os.path.dirname(__file__), 'WWDR.pem'))






SUPPORTED_ASSET_FILES = [
    "icon.png",
    "icon@2x.png",
    "background.png",
    "background@2x.png",
    "logo.png",
    "logo@2x.png",
    "footer.png",
    "footer@2x.png",
    "strip.png",
    "strip@2x.png",
    "thumbnail.png",
    "thumbnail@2x.png",
]


def with_clean_up(func: Callable):
    def wrapper(*args, **kwargs):
        try:
            func(*args, **kwargs)
        except Exception as e:
            print(e)
        finally:
            generated_files = [
                "pass.json",
                "manifest.json",
                "passcertificate.pem",
                "passkey.pem",
                "signature",
            ]

            for asset_file in SUPPORTED_ASSET_FILES + generated_files:
                if os.path.exists(asset_file):
                    os.remove(asset_file)
    return wrapper


@with_clean_up
def main():
    name = sys.argv[1]
    company = sys.argv[2]
    username = sys.argv[3] 
    print("Name:", name)

    pass_type_identifier = os.environ.get("APPLE_PASS_TYPE_IDENTIFIER", "pass.crm.nsg.card")
    team_identifier = os.environ.get("APPLE_TEAM_IDENTIFIER", "L6K6XRCKG7")
    name = name
    company = company
    username = username

    pass_dict_copy = create_pass_dict(
        pass_type_identifier=pass_type_identifier,
        team_identifier=team_identifier,
        name=name,
        company=company,
        username=username
    )
    pass_dict_json = json.dumps(pass_dict_copy, indent=2)
    with open("pass.json", "w") as f:
        f.write(pass_dict_json)

    create_manifest_json(asset_path = os.path.join(os.path.dirname(__file__), PK_PASS_NAME + ".pass")) 

    os_code = os.system(f"{OPENSSL_APP} pkcs12 -in {CERTIFICATE_PATH} -clcerts -nokeys -out passcertificate.pem -passin pass:{key_password} -legacy")
    if os_code != 0:
        raise Exception("could not create pass certificate")

    os_code = os.system(f"{OPENSSL_APP} pkcs12 -in {CERTIFICATE_PATH} -nocerts -out passkey.pem -passin pass:{key_password} -passout pass:{key_password} -legacy")
    if os_code != 0:
        raise Exception("could not create pass key")

    os_code = os.system(f"{OPENSSL_APP} smime -binary -sign -certfile {wwdr_path} -signer passcertificate.pem -inkey passkey.pem -in manifest.json -out signature -outform DER -passin pass:{key_password}")
    if os_code != 0:
        raise Exception("could not create signature")

    asset_files_to_delete = [
        "passkey.pem",
        "passcertificate.pem",
        "signature",
        "pass.json",
    ] 
    asset_files = [
        "signature",
        "pass.json",
        "manifest.json",
    ]

    for (_, _, filenames) in os.walk(os.path.join(os.path.dirname(__file__), PK_PASS_NAME + ".pass")):
        for filename in filenames:
            if filename in SUPPORTED_ASSET_FILES:
                """ shutil.copy2(f"{PK_PASS_NAME}.pass/{filename}", filename) """
                shutil.copy2(os.path.join(os.path.dirname(__file__), PK_PASS_NAME + ".pass", filename), filename)

                asset_files_to_delete.append(filename) 
                asset_files.append(filename)

    with ZipFile(os.path.join(os.path.dirname(__file__), PK_PASS_NAME + ".pkpass"), "w") as zip_file:
        for asset_file in asset_files:
            zip_file.write(asset_file)

    """ os_code = os.system(f"open {PK_PASS_NAME}.pkpass")
    if os_code != 0:
        raise Exception("could not open pkpass") """
    print(f"Pass created successfully! The .pkpass file is located at {PK_PASS_NAME}.pkpass")


class Arguments(TypedDict):
    certificate_password: str
    pass_type_identifier: str
    team_identifier: str
    certificate_path: str
    wwdr_path: str

def parse_arguments() -> "Arguments":
    certificate_password: Optional[str] = None
    pass_type_identifier: Optional[str] = None
    team_identifier: Optional[str] = None
    certificate_path: Optional[str] = None
    wwdr_path: Optional[str] = None

    skip_next_value = False
    for index, arg in enumerate(sys.argv[1:]):
        if skip_next_value:
            skip_next_value = False
            continue

        def get_next_value():
            if index + 1 < len(sys.argv):
                nonlocal skip_next_value
                skip_next_value = True

                return sys.argv[index + 2]

        if arg == "--certificate-password":
            certificate_password = get_next_value()
        elif arg == "--pass-type-identifier":
            pass_type_identifier = get_next_value()
        elif arg == "--team-identifier":
            team_identifier = get_next_value()
        elif arg == "--certificate-path":
            certificate_path = get_next_value()
        elif arg == "--wwdr-path":
            wwdr_path = get_next_value()

    if certificate_password is None:
        certificate_password = input("what is the password of the provided certificate?\n")

    if pass_type_identifier is None:
        pass_type_identifier = input("provide a pass type identifier\n")

    if team_identifier is None:
        team_identifier = input("provide a team identifier\n")

    if certificate_path is None:
        certificate_path = input("provide the path to your certificate\n")

    if wwdr_path is None:
        wwdr_path = input("provide the path to your WWDR certificate\n")

    return {
        "certificate_password": certificate_password,
        "pass_type_identifier": pass_type_identifier,
        "team_identifier": team_identifier,
        "certificate_path": certificate_path,
        "wwdr_path": wwdr_path,
    }


def create_manifest_json(asset_path: str):
    with open("pass.json", "r") as f:
        pass_json = f.read()

    hashed_pass_json = hashlib.sha1(pass_json.encode('utf-8')).hexdigest()

    manifest_dict = {"pass.json": hashed_pass_json}

    for (_, _, filenames) in os.walk(asset_path):
        for filename in filenames:
            if filename in SUPPORTED_ASSET_FILES:
                manifest_dict[filename] = hashlib.sha1(
                    open(f"{asset_path}/{filename}", "rb").read()
                ).hexdigest()

    with open(f"manifest.json", "w") as f:
        f.write(json.dumps(manifest_dict, indent=4))


def create_pass_dict(pass_type_identifier: str, team_identifier: str ,name:str, company:str, username:str ):
    pass_dict_copy = pass_dict.copy()
    pass_dict_copy["serialNumber"] = f"{name}_{username}"
    pass_dict_copy["passTypeIdentifier"] = pass_type_identifier
    pass_dict_copy["teamIdentifier"] = team_identifier
    pass_dict_copy["logoText"] = "NSG Business Card" 
    pass_dict_copy["generic"]["primaryFields"] = [{"key": "member", "value": name}]
    pass_dict_copy["generic"]["secondaryFields"] = [{
        "key": "company",
        "value": company
    }]
    pass_dict_copy["barcode"]["message"] = f"nsgcrm.com/{username}"
    return pass_dict_copy
if __name__ == "__main__":
    main() 
