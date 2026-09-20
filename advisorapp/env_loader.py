import os
from pathlib import Path

def load_env(env_file=None):
    """
    Lightweight .env loader that populates os.environ without requiring external packages.
    Safely ignores comments and trims quotes.
    """
    if env_file is None:
        base_dir = Path(__file__).resolve().parent.parent
        env_file = base_dir / ".env"
    else:
        env_file = Path(env_file)

    if not env_file.exists():
        return

    with open(env_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, val = line.split("=", 1)
            key = key.strip()
            val = val.strip()
            # Remove surrounding matching quotes
            if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
                val = val[1:-1]
            # Do not overwrite already existing environment variables (e.g. injected by Heroku/Docker)
            if key not in os.environ:
                os.environ[key] = val

def get_env(key, default=None, cast=None):
    """
    Retrieve an environment variable, optionally cast to type (bool, int, list).
    """
    val = os.environ.get(key)
    if val is None:
        return default
    if cast is bool:
        return val.strip().lower() in ("true", "1", "t", "yes", "y")
    if cast is int:
        try:
            return int(val.strip())
        except ValueError:
            return default
    if cast is list:
        return [item.strip() for item in val.split(",") if item.strip()]
    if cast:
        return cast(val)
    return val

