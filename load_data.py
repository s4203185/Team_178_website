"""
Run this script ONCE to load your SQL dump into the SQLite database.
Usage: python load_data.py
"""
import sqlite3, re, os, sys

SQL_FILE = 'Road_Accidents__2__db.sql'
DB_FILE = 'road_accidents.db'

if not os.path.exists(SQL_FILE):
    print(f"ERROR: {SQL_FILE} not found. Place it in the same folder as this script.")
    sys.exit(1)

print(f"Loading {SQL_FILE} into {DB_FILE}...")
conn = sqlite3.connect(DB_FILE)
conn.execute("PRAGMA journal_mode=WAL")
conn.execute("PRAGMA synchronous=OFF")
conn.execute("PRAGMA cache_size=100000")

with open(SQL_FILE, 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

# Load schema (first ~130 lines)
schema = ''.join(l for l in lines if not l.strip().startswith('INSERT'))
conn.executescript(schema)
conn.commit()
print("Schema loaded.")

# Load data in batches
batch_size = 500
batch = []
count = 0
for line in lines:
    if line.strip().startswith('INSERT'):
        batch.append(line.strip())
        if len(batch) >= batch_size:
            conn.executescript('\n'.join(batch))
            conn.commit()
            count += len(batch)
            batch = []
            print(f"\r  {count:,} rows loaded...", end='')

if batch:
    conn.executescript('\n'.join(batch))
    conn.commit()
    count += len(batch)

conn.close()
print(f"\nDone! {count:,} total rows loaded.")
