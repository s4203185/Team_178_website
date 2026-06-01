# VicRoads Incident Intelligence
## Programming Studio S1 2026 — RMIT University

This project runs with a lightweight Python backend (`Flask`) plus `HTML/CSS/JavaScript` frontend.
SQL is executed from Python (`sqlite3`) against `road_accidents.db`.


### Setup Instructions

1. Install Python 3.12+.
2. Place `road_accidents.db` in the project root (same level as `index.html`).
3. Install Flask:
   ```
   python -m pip install flask
   ```
4. Start the app from the project root:
   ```
   python app.py
   ```
5. Open your browser at `http://127.0.0.1:8000`.

### Pages

| URL | Level | Description |
|-----|-------|-------------|
| `/` | L1A | Landing page — key facts + charts |
| `/mission/` | L1B | Mission statement — personas + team |
| `/conditions/` | L2A | Conditions summary — JOIN + GROUP BY |
| `/people/` | L2B | People and injuries summary |
| `/deep-conditions/` | L3A | Deep conditions subquery analysis |
| `/deep-people/` | L3B | Deep people subquery analysis |

### Project Structure
```
road_project/
├── app.py
├── index.html
├── mission/index.html
├── conditions/index.html
├── people/index.html
├── deep-conditions/index.html
├── deep-people/index.html
├── assets/
│   ├── styles.css
│   ├── app.js
│   ├── db.js
│   └── queries.js
└── road_accidents.db
```
