# advisorapp/celery.py
from __future__ import absolute_import, unicode_literals
import os
from celery import Celery

from advisorapp.settings import CELERY_BROKER_URL

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'advisorapp.settings')

app = Celery('advisorapp',
             # broker='redis://localhost:6379/0',
             broker=CELERY_BROKER_URL
             )

app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()


# @app.task(bind=True)
# def debug_task(self):
#     print(f"Request: {self.request!r}")
