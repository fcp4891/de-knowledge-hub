.PHONY: help install validate test build dev

PYTHON ?= python

help:
	@echo Objetivos: install validate test build dev

install:
	$(PYTHON) -m pip install -r requirements.txt

validate:
	$(PYTHON) scripts/validate.py

test:
	$(PYTHON) -m pytest

build: validate
	@echo build: compilador content a PostgreSQL pendiente en A-F2.2

dev:
	@echo dev: backend y frontend pendientes en F2
