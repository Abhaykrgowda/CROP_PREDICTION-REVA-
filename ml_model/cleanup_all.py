import sqlite3, os, glob

c = sqlite3.connect("farmers.db")
c.execute("DELETE FROM crop_photos WHERE phone='7411328409'")
c.commit()
print(f"Deleted {c.total_changes} DB rows")
c.close()
for f in glob.glob("crop_photos/7411328409/*"):
    os.remove(f)
    print(f"Removed {os.path.basename(f)}")
print("Done")
