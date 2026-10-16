-- =============================================================
-- V1 — StreamFlow Dashboard schema
-- =============================================================

-- ─── Technical ───────────────────────────────────────────────

CREATE TABLE technical_overview (
    id                  SERIAL PRIMARY KEY,
    total_requests      BIGINT          NOT NULL,
    error_requests      BIGINT          NOT NULL,
    error_rate          NUMERIC(5, 2)   NOT NULL,
    uptime_total_hours  NUMERIC(8, 2)   NOT NULL,
    uptime_downtime_h   NUMERIC(8, 3)   NOT NULL,
    uptime_percent      NUMERIC(5, 2)   NOT NULL,
    mttr_avg_hours      NUMERIC(6, 3)   NOT NULL,
    rt_average_ms       INTEGER         NOT NULL,
    rt_p95_ms           INTEGER         NOT NULL,
    recorded_at         TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE technical_incidents (
    id               SERIAL PRIMARY KEY,
    title            TEXT            NOT NULL,
    duration_hours   NUMERIC(6, 2)   NOT NULL,
    duration_minutes INTEGER         NOT NULL,
    severity         TEXT            NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status           TEXT            NOT NULL CHECK (status IN ('open', 'resolved')),
    recorded_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE technical_incidents_summary (
    id                    SERIAL PRIMARY KEY,
    total                 INTEGER         NOT NULL,
    total_downtime_hours  NUMERIC(6, 2)   NOT NULL,
    mttr_hours            NUMERIC(6, 3)   NOT NULL,
    period_days           INTEGER         NOT NULL,
    recorded_at           TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE technical_response_time_samples (
    id          SERIAL PRIMARY KEY,
    sample_index INTEGER        NOT NULL,
    ms          INTEGER         NOT NULL,
    recorded_at TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE technical_response_time_stats (
    id          SERIAL PRIMARY KEY,
    min_ms      INTEGER         NOT NULL,
    max_ms      INTEGER         NOT NULL,
    average_ms  INTEGER         NOT NULL,
    p50_ms      INTEGER         NOT NULL,
    p90_ms      INTEGER         NOT NULL,
    p95_ms      INTEGER         NOT NULL,
    recorded_at TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ─── Project ─────────────────────────────────────────────────

CREATE TABLE project_overview (
    id               SERIAL PRIMARY KEY,
    bugs_detected    INTEGER         NOT NULL,
    bugs_fixed       INTEGER         NOT NULL,
    bugs_open        INTEGER         NOT NULL,
    fix_rate         NUMERIC(5, 2)   NOT NULL,
    features_delivered INTEGER       NOT NULL,
    bug_rate         NUMERIC(5, 2)   NOT NULL,
    period           TEXT            NOT NULL,
    recorded_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE project_sprints (
    id                      SERIAL PRIMARY KEY,
    sprint_id               INTEGER         NOT NULL,
    name                    TEXT            NOT NULL,
    short_name              TEXT            NOT NULL,
    story_points_planned    INTEGER         NOT NULL,
    story_points_done       INTEGER         NOT NULL,
    velocity_percent        NUMERIC(5, 1)   NOT NULL,
    status                  TEXT            NOT NULL CHECK (status IN ('planned', 'active', 'completed')),
    recorded_at             TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE project_sprints_summary (
    id                          SERIAL PRIMARY KEY,
    total_planned               INTEGER         NOT NULL,
    total_done                  INTEGER         NOT NULL,
    average_velocity_percent    NUMERIC(5, 1)   NOT NULL,
    trend                       TEXT            NOT NULL,
    recorded_at                 TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ─── DevOps ──────────────────────────────────────────────────

CREATE TABLE devops_overview (
    id                    SERIAL PRIMARY KEY,
    deploy_total          INTEGER         NOT NULL,
    deploy_successful     INTEGER         NOT NULL,
    deploy_failed         INTEGER         NOT NULL,
    change_failure_rate   NUMERIC(5, 2)   NOT NULL,
    frequency_per_day     NUMERIC(6, 2)   NOT NULL,
    period_days           INTEGER         NOT NULL,
    lead_time_avg_days    INTEGER         NOT NULL,
    team_developers       INTEGER         NOT NULL,
    team_devops           INTEGER         NOT NULL,
    team_product_owner    INTEGER         NOT NULL,
    team_cto              INTEGER         NOT NULL,
    recorded_at           TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ─── Business ────────────────────────────────────────────────

CREATE TABLE business_overview (
    id                  SERIAL PRIMARY KEY,
    revenue_total       NUMERIC(14, 2)  NOT NULL,
    revenue_currency    TEXT            NOT NULL,
    revenue_period      TEXT            NOT NULL,
    arpu_value          NUMERIC(8, 2)   NOT NULL,
    arpu_currency       TEXT            NOT NULL,
    subscription_price  NUMERIC(6, 2)   NOT NULL,
    conv_visitors       INTEGER         NOT NULL,
    conv_new_subs       INTEGER         NOT NULL,
    conv_rate           NUMERIC(5, 2)   NOT NULL,
    churn_users         INTEGER         NOT NULL,
    churn_rate          NUMERIC(5, 1)   NOT NULL,
    retention_rate      NUMERIC(5, 1)   NOT NULL,
    recorded_at         TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE business_users (
    id                  SERIAL PRIMARY KEY,
    total               INTEGER         NOT NULL,
    active_monthly      INTEGER         NOT NULL,
    start_of_month      INTEGER         NOT NULL,
    end_of_month        INTEGER         NOT NULL,
    new_this_month      INTEGER         NOT NULL,
    churned_this_month  INTEGER         NOT NULL,
    recorded_at         TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE business_user_evolution (
    id          SERIAL PRIMARY KEY,
    label       TEXT            NOT NULL,
    value       INTEGER         NOT NULL,
    recorded_at TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ─── Dashboard ───────────────────────────────────────────────

CREATE TABLE dashboard_kpis (
    id          SERIAL PRIMARY KEY,
    title       TEXT            NOT NULL,
    value       NUMERIC(10, 2)  NOT NULL,
    unit        TEXT,
    status      TEXT            NOT NULL CHECK (status IN ('ok', 'warning', 'critical')),
    trend       NUMERIC(8, 2),
    description TEXT,
    recorded_at TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE dashboard_request_volume (
    id          SERIAL PRIMARY KEY,
    time_label  TEXT            NOT NULL,
    requests    INTEGER         NOT NULL,
    recorded_at TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE dashboard_weekly_deploys (
    id          SERIAL PRIMARY KEY,
    day_label   TEXT            NOT NULL,
    deploys     INTEGER         NOT NULL,
    failures    INTEGER         NOT NULL,
    recorded_at TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE dashboard_recent_activity (
    id          SERIAL PRIMARY KEY,
    label       TEXT            NOT NULL,
    time_label  TEXT            NOT NULL,
    severity    TEXT            NOT NULL CHECK (severity IN ('ok', 'warning', 'critical', 'info')),
    recorded_at TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ─── Notifications ───────────────────────────────────────────

CREATE TABLE notifications (
    id          SERIAL PRIMARY KEY,
    text        TEXT            NOT NULL,
    time_label  TEXT            NOT NULL,
    severity    TEXT            NOT NULL CHECK (severity IN ('ok', 'warning', 'critical', 'info')),
    is_read     BOOLEAN         NOT NULL DEFAULT FALSE,
    recorded_at TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ─── KPI Summary ─────────────────────────────────────────────

CREATE TABLE kpi_summary (
    id              SERIAL PRIMARY KEY,
    generated_at    TIMESTAMPTZ     NOT NULL,
    period          TEXT            NOT NULL,
    company         TEXT            NOT NULL,
    global_status   TEXT            NOT NULL CHECK (global_status IN ('ok', 'warning', 'critical')),
    recorded_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE kpi_metrics (
    id              SERIAL PRIMARY KEY,
    summary_id      INTEGER         NOT NULL REFERENCES kpi_summary(id) ON DELETE CASCADE,
    domain          TEXT            NOT NULL,  -- 'technical' | 'project' | 'devops' | 'business'
    metric_key      TEXT            NOT NULL,
    value           NUMERIC(10, 4)  NOT NULL,
    unit            TEXT            NOT NULL,
    status          TEXT            NOT NULL CHECK (status IN ('ok', 'warning', 'critical')),
    threshold       NUMERIC(10, 4),
    recorded_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
