SCRIPT_DIR="$(cd "$(dirname "$(readlink -f "$0")")" && pwd -P)"
venv/bin/python3 "$SCRIPT_DIR/app.py"