"""Aserciones que cada ficha declara sobre su Dag de Airflow; las ejecuta check_airflow_dag.py en la CI.

Este módulo no importa Airflow: la suite de pytest también lo lee para exigir que todo bloque "# Airflow" de la
sección 10 tenga aserciones declaradas aquí. Cada aserción recibe los Dags parseados (bag.dags) y el módulo del
Dag importado (para leer objetos de nivel de módulo, como un Asset), y devuelve qué verificó; si algo no se
cumple, lanza AssertionError.
"""

from __future__ import annotations

import datetime
from collections.abc import Callable, Mapping
from dataclasses import dataclass
from types import ModuleType
from typing import Any

Dags = Mapping[str, Any]
Check = Callable[[Dags, ModuleType], str]


@dataclass(frozen=True)
class DagChecks:
    dag_ids: frozenset[str]
    checks: tuple[Check, ...]


def _task(dags: Dags, dag_id: str, task_id: str) -> Any:
    return dags[dag_id].get_task(task_id)


def _upstream(dag_id: str, task_id: str, expected: set[str]) -> Check:
    def check(dags: Dags, _: ModuleType) -> str:
        found = set(_task(dags, dag_id, task_id).upstream_task_ids)
        assert found == expected, (dag_id, task_id, found)
        return f"{dag_id}.{task_id} depende de {sorted(expected)}"

    return check


def _attrs(dag_id: str, task_id: str, **expected: Any) -> Check:
    def check(dags: Dags, _: ModuleType) -> str:
        task = _task(dags, dag_id, task_id)
        for name, value in expected.items():
            assert getattr(task, name) == value, (dag_id, task_id, name, getattr(task, name))
        return f"{dag_id}.{task_id}: {', '.join(f'{k}={v}' for k, v in expected.items())}"

    return check


def _class_name(dag_id: str, task_id: str, expected: str) -> Check:
    """La clase de la tarea o una de sus bases se llama expected (p. ej., DecoratedMappedOperator es un MappedOperator)."""

    def check(dags: Dags, _: ModuleType) -> str:
        found = type(_task(dags, dag_id, task_id))
        assert expected in {c.__name__ for c in found.__mro__}, (dag_id, task_id, found.__name__)
        return f"{dag_id}.{task_id} es {expected} ({found.__name__})"

    return check


def _callback_names(value: Any) -> set[str]:
    callbacks = value if isinstance(value, list | tuple) else [value]
    return {getattr(c, "__name__", "") for c in callbacks if c}


def _callbacks(dag_id: str, task_id: str | None, **expected: str) -> Check:
    def check(dags: Dags, _: ModuleType) -> str:
        target = dags[dag_id] if task_id is None else _task(dags, dag_id, task_id)
        for name, function in expected.items():
            assert function in _callback_names(getattr(target, name)), (dag_id, task_id, name)
        return f"{dag_id}{'' if task_id is None else '.' + task_id}: {sorted(expected)}"

    return check


def _asset_watcher(asset_var: str, dag_id: str) -> Check:
    def check(dags: Dags, module: ModuleType) -> str:
        from airflow.triggers.base import BaseEventTrigger  # import tardío: solo en el venv de Airflow

        asset = getattr(module, asset_var)
        triggers = [watcher.trigger for watcher in asset.watchers]
        assert triggers and all(isinstance(t, BaseEventTrigger) for t in triggers), triggers
        timetable = type(dags[dag_id].timetable).__name__
        assert "Asset" in timetable, timetable
        return f"{dag_id} programado por {asset.name} ({timetable}); triggers {[type(t).__name__ for t in triggers]}"

    return check


MINUTES = datetime.timedelta(minutes=1)

CHECKS: dict[str, DagChecks] = {
    "pipeline-dependencies": DagChecks(
        frozenset({"ventas_diarias", "reporte_ventas"}),
        (
            _upstream("ventas_diarias", "validar", {"extraer_pos", "extraer_web"}),
            _attrs("ventas_diarias", "limpiar_temporales", trigger_rule="all_done"),
        ),
    ),
    "orchestration-task": DagChecks(
        frozenset({"ventas_por_particion"}),
        (
            _class_name("ventas_por_particion", "esperar_archivo", "FileSensor"),
            _class_name("ventas_por_particion", "cargar_particion", "BashOperator"),
            _attrs("ventas_por_particion", "cargar_particion", retries=3, execution_timeout=30 * MINUTES),
            _upstream("ventas_por_particion", "verificar_conteo", {"cargar_particion"}),
        ),
    ),
    "sensors": DagChecks(
        frozenset({"espera_archivos_proveedor"}),
        (
            _attrs("espera_archivos_proveedor", "esperar_ventas", mode="reschedule", poke_interval=600,
                   timeout=21600, soft_fail=False),
            _attrs("espera_archivos_proveedor", "esperar_catalogo", deferrable=True),
            _upstream("espera_archivos_proveedor", "cargar", {"esperar_ventas", "esperar_catalogo"}),
        ),
    ),
    "dynamic-workflows": DagChecks(
        frozenset({"procesar_archivos_del_dia"}),
        (
            _class_name("procesar_archivos_del_dia", "procesar", "MappedOperator"),
            _upstream("procesar_archivos_del_dia", "procesar", {"listar_archivos"}),
            _upstream("procesar_archivos_del_dia", "resumir", {"procesar"}),
        ),
    ),
    "event-driven-orchestration": DagChecks(
        frozenset({"procesar_pedidos"}),
        (_asset_watcher("PEDIDOS", "procesar_pedidos"),),
    ),
    "orchestration-observability": DagChecks(
        frozenset({"ventas_con_alertas"}),
        (
            _callbacks("ventas_con_alertas", None, on_success_callback="registrar_exito"),
            _callbacks("ventas_con_alertas", "extraer", on_failure_callback="avisar_fallo",
                       on_retry_callback="avisar_reintento"),
            _attrs("ventas_con_alertas", "cargar", retries=2, execution_timeout=60 * MINUTES),
        ),
    ),
    "airflow-operators-and-hooks": DagChecks(
        frozenset({"exportar_ventas"}),
        (
            _class_name("exportar_ventas", "exportar", "ExportarVentasOperator"),
            _attrs("exportar_ventas", "exportar", template_fields=("fecha",), conn_id="api_ventas"),
            _class_name("exportar_ventas", "registrar_carga", "SQLExecuteQueryOperator"),
            _upstream("exportar_ventas", "registrar_carga", {"exportar"}),
        ),
    ),
}
