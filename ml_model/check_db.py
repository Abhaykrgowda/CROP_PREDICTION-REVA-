import sqlite3

c = sqlite3.connect("farmers.db")
rows = c.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
print("Tables:", rows)
c.close()
