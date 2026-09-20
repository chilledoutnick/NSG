web: gunicorn --timeout 60 --workers 2 advisorapp.wsgi
release: python manage.py migrate --noinput
worker: celery -A advisorapp worker  -E -l info
