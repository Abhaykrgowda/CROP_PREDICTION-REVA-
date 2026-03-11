# ---------- Stage: Python Flask Backend ----------
FROM python:3.11-slim

WORKDIR /app

# Install system deps for scikit-learn / numpy
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc g++ && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code & model artefacts
COPY app.py .
COPY cultivation_service.py .
COPY market_price_service.py .
COPY crop_model.pkl .
COPY Crop_recommendation.csv .
COPY train_model.py .

# Create directories that may be written to at runtime
RUN mkdir -p crop_photos

EXPOSE 5000

# Run with gunicorn (4 workers, bind all interfaces)
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120", "app:app"]
