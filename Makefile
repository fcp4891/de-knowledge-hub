.PHONY: help install validate test build dev mocks db-up db-down migrate compile

PYTHON ?= python

help:
	@echo Objetivos: install validate test mocks db-up db-down migrate compile build dev

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

dev:
	@echo dev: backend y frontend pendientes en F2
