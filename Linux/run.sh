SCRIPT_DIR="$(cd "$(dirname "$(readlink -f "$0")")" && pwd -P)"
python3 "$SCRIPT_DIR/app.py"