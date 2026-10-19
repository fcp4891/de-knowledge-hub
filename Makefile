.PHONY: help venv install snippets-deps validate test test-frontend check-airflow-dag build dev mocks static static-data db-up db-down migrate compile backup-me restore-me validate-terraform validate-actions validate-cfn validate-bicep validate-cfn validate-bicep validate-dockerfile validate-k8s

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
	@echo Objetivos: venv install snippets-deps validate test mocks static static-data db-up db-down migrate compile build dev backup-me restore-me validate-terraform validate-actions validate-cfn validate-bicep validate-cfn validate-bicep validate-dockerfile validate-k8s

venv:
	$(BOOTSTRAP_PYTHON) -m venv .venv
	$(VENV_PYTHON) -m pip install --upgrade pip
	$(VENV_PYTHON) -m pip install -r requirements.txt

install:
	$(REQUIRE_VENV)
	$(PYTHON) -m pip install -r requirements.txt

# Dependencias de los snippets de Python que se ejecutan en los tests (requirements-snippets.txt).
snippets-deps:
	$(REQUIRE_VENV)
	$(PYTHON) -m pip install -r requirements-snippets.txt

validate:
	$(REQUIRE_VENV)
	$(PYTHON) scripts/validate.py

test:
	$(REQUIRE_VENV)
	$(PYTHON) -m pytest

# Dags de Airflow de las fichas: se cargan con DagBag en un venv aparte (.venv-airflow), con apache-airflow
# fijado y las restricciones oficiales para Python 3.12, y se ejecutan las aserciones que cada ficha declara en
# scripts/snippets/airflow_dag_checks.py. Se ejecuta en la CI (Linux).
AIRFLOW_VERSION := 3.3.2
AIRFLOW_PYTHON ?= python3.12
check-airflow-dag:
	$(AIRFLOW_PYTHON) -m venv .venv-airflow
	.venv-airflow/bin/pip install --quiet "apache-airflow==$(AIRFLOW_VERSION)" --constraint https://raw.githubusercontent.com/apache/airflow/constraints-$(AIRFLOW_VERSION)/constraints-3.12.txt
	.venv-airflow/bin/python scripts/snippets/check_airflow_dag.py

# Parser de Markdown del frontend con el runner nativo de Node (24+ elimina los tipos al importar .ts).
test-frontend:
	node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test "tests/frontend/*.test.ts"

mocks: validate
	$(PYTHON) -m scripts.contracts.build_mocks

# Demo estática (cPanel): JSON de todo el contenido en frontend/public/data/, build de Next.js con
# BASE_PATH y zip en dist/. Git Bash no debe convertir "/DES_conocimiento" en una ruta de Windows.
BASE_PATH ?= /DES_conocimiento
static-data: validate
	$(PYTHON) -m scripts.static.build_static_data

static: static-data
	MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL="*" $(PYTHON) -m scripts.static.package_static --base-path $(BASE_PATH)

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

# HCL de snippets y fichas (ADR-008): extrae cada bloque a build/ y lo valida sin credenciales.
# Los fragmentos marcados con <!-- validate-terraform: excluido — motivo --> se reportan y no se validan.
# Requiere terraform (la CI lo instala). Providers fijados en los bloques: hashicorp/google y google-beta ~> 8.0,
# hashicorp/aws ~> 6.0 (Registry: 6.68.0 del 2026-10-07, consultado el 2026-10-12; ADR-011),
# hashicorp/azurerm ~> 5.0 (Registry: 5.9.0 del 2026-10-08, consultado el 2026-10-13; ADR-013).
# Terraform 1.16.6 fijado en la CI (ADR-015). Los bloques que se ejecutan con apply en los tests (providers sin nube) y
# las raíces que dependen de un módulo se excluyen de aquí con el marcador.
TF_DIR := build/terraform
# Caché de providers compartida y borrado de .terraform tras validar: cada provider se descarga una vez y no queda una
# copia por configuración (con azurerm y aws, las copias llenaban el disco del runner de la CI).
TF_PLUGIN_CACHE := $(abspath build/terraform-plugin-cache)
validate-terraform:
	$(REQUIRE_VENV)
	$(PYTHON) -m scripts.snippets.extract --language terraform --out $(TF_DIR)
	mkdir -p $(TF_PLUGIN_CACHE)
	for dir in $(TF_DIR)/*/*/; do \
		TF_PLUGIN_CACHE_DIR=$(TF_PLUGIN_CACHE) TF_PLUGIN_CACHE_MAY_BREAK_DEPENDENCY_LOCK_FILE=true \
			terraform -chdir=$$dir init -backend=false -input=false -no-color && \
		terraform -chdir=$$dir validate -no-color || exit 1; \
		rm -rf $$dir/.terraform; \
	done

# Workflows de GitHub Actions de las fichas (ADR-014): bloques ```yaml que empiezan con «# GitHub Actions», revisados
# con actionlint sin ejecutarlos. La CI descarga actionlint 1.7.12 con su checksum; en local, ACTIONLINT=<ruta>.
# Sin shellcheck ni pyflakes: el resultado no depende de lo que tenga instalado el runner.
GHA_DIR := build/github-actions
ACTIONLINT ?= actionlint
validate-actions:
	$(REQUIRE_VENV)
	$(PYTHON) -m scripts.snippets.extract --language github-actions --out $(GHA_DIR)
	files=$$(find $(GHA_DIR) -name workflow.yml | sort); \
	if [ -z "$$files" ]; then echo "sin workflows"; else $(ACTIONLINT) -shellcheck= -pyflakes= $$files && echo "actionlint: $$(echo $$files | wc -w) workflow(s) sin errores"; fi

# Plantillas de CloudFormation de las fichas (ADR-015): bloques ```yaml que empiezan con «# CloudFormation», revisados con
# cfn-lint (versión fija en requirements-snippets.txt; make snippets-deps). No se despliegan.
CFN_DIR := build/cloudformation
validate-cfn:
	$(REQUIRE_VENV)
	$(PYTHON) -m scripts.snippets.extract --language cloudformation --out $(CFN_DIR)
	files=$$(find $(CFN_DIR) -name template.yaml | sort); \
	if [ -z "$$files" ]; then echo "sin plantillas"; else $(PYTHON) -c "from cfnlint.runner import main; main()" $$files && echo "cfn-lint: $$(echo $$files | wc -w) plantilla(s) sin errores"; fi

# Archivos Bicep de las fichas (ADR-015): bloques ```bicep compilados a ARM JSON con `bicep build` (sin Azure). La CI
# descarga Bicep 0.48.1 con su SHA-256; en local, BICEP=<ruta>. No se despliegan.
BICEP_DIR := build/bicep
BICEP ?= bicep
validate-bicep:
	$(REQUIRE_VENV)
	$(PYTHON) -m scripts.snippets.extract --language bicep --out $(BICEP_DIR)
	files=$$(find $(BICEP_DIR) -name main.bicep | sort); \
	if [ -z "$$files" ]; then echo "sin archivos bicep"; else for f in $$files; do $(BICEP) build $$f --stdout > /dev/null || exit 1; done; echo "bicep build: $$(echo $$files | wc -w) archivo(s) sin errores"; fi

# Dockerfiles de las fichas (ADR-016): bloques ```dockerfile revisados con hadolint 2.15.1 (la CI lo descarga con su
# SHA-256; en local, HADOLINT=<ruta>). Los tests de Docker los construyen y ejecutan.
DOCKERFILE_DIR := build/dockerfile
HADOLINT ?= hadolint
validate-dockerfile:
	$(REQUIRE_VENV)
	$(PYTHON) -m scripts.snippets.extract --language dockerfile --out $(DOCKERFILE_DIR)
	files=$$(find $(DOCKERFILE_DIR) -name Dockerfile 2>/dev/null | sort); \
	if [ -z "$$files" ]; then echo "sin Dockerfiles"; else $(HADOLINT) $$files && echo "hadolint: $$(echo $$files | wc -w) Dockerfile(s) sin errores"; fi

# Manifiestos de Kubernetes de las fichas (ADR-016): bloques ```yaml que empiezan con «# Kubernetes», validados con
# kubeconform 0.8.0 contra los esquemas de la API, sin clúster (sin kind). En local, KUBECONFORM=<ruta>.
K8S_DIR := build/kubernetes
KUBECONFORM ?= kubeconform
K8S_VERSION ?= 1.37.0
validate-k8s:
	$(REQUIRE_VENV)
	$(PYTHON) -m scripts.snippets.extract --language kubernetes --out $(K8S_DIR)
	files=$$(find $(K8S_DIR) -name manifest.yaml 2>/dev/null | sort); \
	if [ -z "$$files" ]; then echo "sin manifiestos"; else $(KUBECONFORM) -strict -summary -kubernetes-version $(K8S_VERSION) $$files; fi

dev:
	$(REQUIRE_VENV)
	$(PYTHON) -m uvicorn backend.app.main:app --reload --port 8000
