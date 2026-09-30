.PHONY: help install validate test build dev mocks

PYTHON ?= python

help:
	@echo Objetivos: install validate test build dev mocks

install:
	$(PYTHON) -m pip install -r requirements.txt

validate:
	$(PYTHON) scripts/validate.py

test:
	$(PYTHON) -m pytest

mocks: validate
	$(PYTHON) -m scripts.contracts.build_mocks

build: validate
	@echo build: compilador content a PostgreSQL pendiente en A-F2.2

dev:
	@echo dev: backend y frontend pendientes en F2
