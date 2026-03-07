import sqlite3, os, glob

c = sqlite3.connect("farmers.db")
c.execute(
    "DELETE FROM crop_photos WHERE phone='7411328409' AND date BETWEEN '2026-03-02' AND '2026-03-06'"
)
c.commit()
print(f"Deleted {c.total_changes} DB rows")
c.close()

# Also remove the actual image files for those dates
photo_dir = os.path.join(os.path.dirname(__file__), "crop_photos", "7411328409")
for f in glob.glob(os.path.join(photo_dir, "2026-03-0[2-6]_*")):
    os.remove(f)
    print(f"Removed file: {os.path.basename(f)}")
print("Done")
