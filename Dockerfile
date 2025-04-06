FROM python:3.11-slim AS base

WORKDIR /app
RUN pip install --no-cache-dir poetry

# NEW
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

RUN node -v && npm -v

RUN npm install --save html2canvas
# ----------------------

FROM base AS builder
WORKDIR /app
COPY pyproject.toml poetry.lock ./

RUN poetry config virtualenvs.create false && \
    poetry config installer.parallel false && \
    poetry install --no-root

FROM python:3.11-slim AS runtime
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.11/site-packages/ /usr/local/lib/python3.11/site-packages/
COPY --from=builder /usr/local/bin/ /usr/local/bin/
COPY cc_cloud_run cc_cloud_run/
COPY static static/
COPY template template/

# new
COPY --from=base /app/node_modules/html2canvas/dist/html2canvas.min.js /app/static/html2canvas.min.js

EXPOSE 8000
CMD ["uvicorn", "cc_cloud_run.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
