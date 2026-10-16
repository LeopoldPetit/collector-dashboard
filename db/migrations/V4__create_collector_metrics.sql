-- =============================================================
-- V4 — Collector metrics (poussées par les pipelines CI)
-- =============================================================

CREATE TABLE collector_metric_points (
    id            BIGSERIAL       PRIMARY KEY,
    service       TEXT            NOT NULL,
    category      TEXT            NOT NULL CHECK (category IN ('quality', 'security', 'tests', 'performance')),
    name          TEXT            NOT NULL,
    value         NUMERIC(14, 4)  NOT NULL,
    unit          TEXT            NOT NULL DEFAULT '',
    commit_sha    TEXT,
    pipeline_run  TEXT,
    recorded_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_collector_metric_points_series
    ON collector_metric_points (service, name, recorded_at DESC);
