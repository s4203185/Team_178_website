from pathlib import Path
import sqlite3

from flask import Flask, jsonify, request, send_from_directory

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "road_accidents.db"

app = Flask(__name__, static_folder=None)


def run_sql(sql: str):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        rows = conn.execute(sql).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


@app.post("/api/query")
def api_query():
    payload = request.get_json(silent=True) or {}
    sql = (payload.get("sql") or "").strip()
    if not sql:
        return jsonify({"error": "Missing SQL"}), 400
    try:
        data = run_sql(sql)
        return jsonify({"rows": data})
    except sqlite3.Error as err:
        return jsonify({"error": str(err)}), 400


@app.get("/assets/<path:filename>")
def assets(filename):
    return send_from_directory(BASE_DIR / "assets", filename)


@app.get("/mission/")
def mission_page():
    return send_from_directory(BASE_DIR / "mission", "index.html")


@app.get("/conditions/")
def conditions_page():
    return send_from_directory(BASE_DIR / "conditions", "index.html")


@app.get("/people/")
def people_page():
    return send_from_directory(BASE_DIR / "people", "index.html")


@app.get("/deep-conditions/")
def deep_conditions_page():
    return send_from_directory(BASE_DIR / "deep-conditions", "index.html")


@app.get("/deep-people/")
def deep_people_page():
    return send_from_directory(BASE_DIR / "deep-people", "index.html")


@app.get("/")
def home_page():
    return send_from_directory(BASE_DIR, "index.html")


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=8000)
