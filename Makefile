.PHONY: help venv install validate test build dev mocks db-up db-down migrate compile backup-me restore-me

# Entorno del proyecto: .venv con Python 3.12 (README, «Entorno de Python»). Nunca el Python global.
ifeq ($(OS),Windows_NT)
VENV_PYTHON := .venv/Scripts/python.exe
BOOTSTRAP_PYTHON ?= py -3.12
else
VENV_PYTHON := .venv/bin/python
BOOTSTRAP_PYTHON ?= python3.12
endif
PYTHON := $(VENV_PYTHON)

# Los objetivos que ejecutan Python fallan con un mensaje claro si falta el entorno.
ifeq ($(wildcard $(VENV_PYTHON)),)
REQUIRE_VENV = $(error Falta el entorno .venv: ejecuta `make venv` (ver README))
else
REQUIRE_VENV =
endif

help:
	@echo Objetivos: venv install validate test mocks db-up db-down migrate compile build dev backup-me restore-me

venv:
	$(BOOTSTRAP_PYTHON) -m venv .venv
	$(VENV_PYTHON) -m pip install --upgrade pip
	$(VENV_PYTHON) -m pip install -r requirements.txt

install:
	$(REQUIRE_VENV)
	$(PYTHON) -m pip install -r requirements.txt

validate:
	$(REQUIRE_VENV)
	$(PYTHON) scripts/validate.py

test:
	$(REQUIRE_VENV)
	$(PYTHON) -m pytest

mocks: validate
	$(PYTHON) -m scripts.contracts.build_mocks

db-up:
	docker compose up -d --wait

db-down:
	docker compose down

migrate:
	$(REQUIRE_VENV)
	$(PYTHON) -m alembic upgrade head

compile:
	$(REQUIRE_VENV)
	$(PYTHON) -m scripts.compile

build: validate migrate compile

# Estado personal (me_*): respaldo fuera del repo en BACKUP_DIR (.env). restore-me FILE=ruta, o el último.
backup-me:
	$(REQUIRE_VENV)
	$(PYTHON) -m scripts.personal_backup backup

restore-me:
	$(REQUIRE_VENV)
	$(PYTHON) -m scripts.personal_backup restore $(FILE)

dev:
	$(REQUIRE_VENV)
	$(PYTHON) -m uvicorn backend.app.main:app --reload --port 8000
