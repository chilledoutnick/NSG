from __future__ import absolute_import, unicode_literals
import os

# Only initialize PyMySQL if explicitly using MySQL
db_engine = os.environ.get("DB_ENGINE", "")
db_url = os.environ.get("DATABASE_URL", "")

if "mysql" in db_engine or "mysql" in db_url:
    try:
        import pymysql
        pymysql.version_info = (2, 2, 8, "final", 0)
        pymysql.install_as_MySQLdb()
    except Exception:
        pass

try:
    from .celery import app
    __all__ = ('app',)
except ImportError:
    pass
