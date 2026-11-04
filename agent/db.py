"""Read-only DuckDB access with a SQL guard and per-query timeout."""
import re
import threading

import duckdb

from . import config

_con = duckdb.connect(config.DB_PATH, read_only=True, config={"memory_limit": "300MB", "threads": 2})
_lock = threading.Lock()

_FORBIDDEN = re.compile(
    r"\b(insert|update|delete|drop|alter|create|attach|detach|copy|export|import|install|load|pragma|set|call|"
    r"checkpoint|vacuum|read_csv\w*|read_parquet|read_json\w*|glob|read_text|read_blob|httpfs)\b", re.I)


class SQLError(Exception):
    pass


def check_sql(sql: str) -> str:
    s = sql.strip().rstrip(";").strip()
    if ";" in s:
        raise SQLError("only one statement allowed")
    if not re.match(r"^\(*\s*(with|select|from)\b", s, re.I):
        raise SQLError("only SELECT queries allowed")
    if _FORBIDDEN.search(re.sub(r"'[^']*'", "''", s)):
        raise SQLError("forbidden keyword")
    return s


def query(sql: str, max_rows: int = 50, timeout: float = 10.0) -> tuple[list[str], list[tuple]]:
    s = check_sql(sql)
    cur = _con.cursor()
    timer = threading.Timer(timeout, cur.interrupt)
    timer.start()
    try:
        rel = cur.execute(s)
        cols = [d[0] for d in rel.description]
        rows = rel.fetchmany(max_rows + 1)
    except duckdb.Error as e:
        raise SQLError(str(e).split("\n")[0][:300]) from None
    finally:
        timer.cancel()
        cur.close()
    return cols, rows


def raw(sql: str, params=None) -> list[tuple]:
    """Trusted internal queries (resolver)."""
    with _lock:
        return _con.execute(sql, params or []).fetchall()
