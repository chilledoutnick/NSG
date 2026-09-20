try:
    import gspread
    from oauth2client.service_account import ServiceAccountCredentials
except ImportError:
    gspread = None
    ServiceAccountCredentials = None
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import action

from advisorapp import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import os
from datetime import datetime

SCOPE = ["https://spreadsheets.google.com/feeds",
         "https://www.googleapis.com/auth/drive"]
SHEET_ID = getattr(settings, "GOOGLE_SHEET_ID", os.getenv("GOOGLE_SHEET_ID", ""))

def get_sheet(sheet_id):
    cred_path = getattr(settings, "GOOGLE_APPLICATION_CREDENTIALS", os.getenv("GOOGLE_APPLICATION_CREDENTIALS", ""))
    if not cred_path or not os.path.exists(cred_path):
        raise FileNotFoundError("Google Application Credentials file not configured or found")
    creds = ServiceAccountCredentials.from_json_keyfile_name(cred_path, SCOPE)
    client = gspread.authorize(creds)
    return client.open_by_key(sheet_id).sheet1

@method_decorator(csrf_exempt, name='dispatch')
def post( request):
        sheet = get_sheet(SHEET_ID)

        phone_number = request.data.get("phone_number")
        call_status = request.data.get("status")
        name = request.data.get("name", "")
        email = request.data.get("email", "")
        notes = request.data.get("notes", "")

        if not phone_number or not call_status:
            return Response({"error": "phone_number and status required"}, status=status.HTTP_400_BAD_REQUEST)

        sheet.append_row([
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            phone_number,
            call_status,
            name,
            email,
            notes
        ])

        return Response({"status": "logged"}, status=status.HTTP_201_CREATED)

if __name__ == '__main__':
    sheet_ = get_sheet(SHEET_ID)
    print(sheet_.row_values(1))