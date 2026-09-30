.PHONY: help install validate test build dev mocks db-up db-down migrate compile backup-me restore-me

PYTHON ?= python

help:
	@echo Objetivos: install validate test mocks db-up db-down migrate compile build dev backup-me restore-me

install:
	$(PYTHON) -m pip install -r requirements.txt

validate:
	$(PYTHON) scripts/validate.py

test:
	$(PYTHON) -m pytest

mocks: validate
	$(PYTHON) -m scripts.contracts.build_mocks

db-up:
	docker compose up -d --wait

db-down:
	docker compose down

migrate:
	$(PYTHON) -m alembic upgrade head

compile:
	$(PYTHON) -m scripts.compile

build: validate migrate compile

# Estado personal (me_*): respaldo fuera del repo en BACKUP_DIR (.env). restore-me FILE=ruta, o el último.
backup-me:
	$(PYTHON) -m scripts.personal_backup backup

restore-me:
	$(PYTHON) -m scripts.personal_backup restore $(FILE)

dev:
	$(PYTHON) -m uvicorn backend.app.main:app --reload --port 8000
