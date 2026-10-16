-- =============================================================
-- V2 — StreamFlow Dashboard seed data (from WireMock fixtures)
-- =============================================================

-- ─── Technical overview ──────────────────────────────────────
INSERT INTO technical_overview
    (total_requests, error_requests, error_rate,
     uptime_total_hours, uptime_downtime_h, uptime_percent,
     mttr_avg_hours, rt_average_ms, rt_p95_ms)
VALUES
    (1200000, 48000, 4.0,
     720, 6.5, 99.1,
     1.625, 562, 2500);

-- ─── Technical incidents ─────────────────────────────────────
INSERT INTO technical_incidents (title, duration_hours, duration_minutes, severity, status) VALUES
    ('Lenteur chargement vidéos',       2,    120, 'high',     'resolved'),
    ('Erreurs paiement en production',  1,    60,  'critical', 'resolved'),
    ('Indisponibilité partielle API',   3,    180, 'critical', 'resolved'),
    ('Timeout base de données',         0.5,  30,  'medium',   'resolved');

INSERT INTO technical_incidents_summary (total, total_downtime_hours, mttr_hours, period_days)
VALUES (4, 6.5, 1.625, 30);

-- ─── Technical response time samples ─────────────────────────
INSERT INTO technical_response_time_samples (sample_index, ms) VALUES
    (1,  120),  (2,  140),  (3,  150),  (4,  200),  (5,  250),
    (6,  300),  (7,  350),  (8,  400),  (9,  500),  (10, 800),
    (11, 1200), (12, 1800), (13, 2500);

INSERT INTO technical_response_time_stats (min_ms, max_ms, average_ms, p50_ms, p90_ms, p95_ms)
VALUES (120, 2500, 562, 350, 1800, 2500);

-- ─── Project overview ────────────────────────────────────────
INSERT INTO project_overview
    (bugs_detected, bugs_fixed, bugs_open, fix_rate,
     features_delivered, bug_rate, period)
VALUES
    (320, 180, 140, 56.25, 60, 5.33, 'monthly');

-- ─── Project sprints ─────────────────────────────────────────
INSERT INTO project_sprints (sprint_id, name, short_name, story_points_planned, story_points_done, velocity_percent, status) VALUES
    (1, 'Sprint 1', 'S1', 40, 35, 87.5, 'completed'),
    (2, 'Sprint 2', 'S2', 45, 30, 66.7, 'completed'),
    (3, 'Sprint 3', 'S3', 50, 25, 50.0, 'completed');

INSERT INTO project_sprints_summary (total_planned, total_done, average_velocity_percent, trend)
VALUES (135, 90, 68.1, 'declining');

-- ─── DevOps overview ─────────────────────────────────────────
INSERT INTO devops_overview
    (deploy_total, deploy_successful, deploy_failed,
     change_failure_rate, frequency_per_day, period_days,
     lead_time_avg_days,
     team_developers, team_devops, team_product_owner, team_cto)
VALUES
    (40, 28, 12, 30.0, 1.33, 30, 5, 15, 2, 1, 1);

-- ─── Business overview ───────────────────────────────────────
INSERT INTO business_overview
    (revenue_total, revenue_currency, revenue_period,
     arpu_value, arpu_currency, subscription_price,
     conv_visitors, conv_new_subs, conv_rate,
     churn_users, churn_rate, retention_rate)
VALUES
    (1000000, 'EUR', 'monthly',
     10.0, 'EUR', 9.99,
     200000, 8000, 4.0,
     40000, 33.3, 66.7);

-- ─── Business users ──────────────────────────────────────────
INSERT INTO business_users (total, active_monthly, start_of_month, end_of_month, new_this_month, churned_this_month)
VALUES (250000, 100000, 120000, 100000, 20000, 40000);

INSERT INTO business_user_evolution (label, value) VALUES
    ('Début du mois', 120000),
    ('Fin du mois',   100000);

-- ─── Dashboard KPIs ──────────────────────────────────────────
INSERT INTO dashboard_kpis (title, value, unit, status, trend, description) VALUES
    ('Uptime',         99.1,  '%',  'warning',  -0.8, 'vs last month'),
    ('Open Incidents', 4,     NULL, 'warning',  -25,  'vs last week'),
    ('Deploys Today',  12,    NULL, 'ok',        20,  'vs yesterday'),
    ('Avg Response',   562,   'ms', 'warning',   8,   'vs last hour');

-- ─── Dashboard request volume ────────────────────────────────
INSERT INTO dashboard_request_volume (time_label, requests) VALUES
    ('00:00', 820),
    ('04:00', 400),
    ('08:00', 1200),
    ('12:00', 1800),
    ('16:00', 2400),
    ('20:00', 1600),
    ('23:59', 900);

-- ─── Dashboard weekly deploys ────────────────────────────────
INSERT INTO dashboard_weekly_deploys (day_label, deploys, failures) VALUES
    ('Mon', 4,  1),
    ('Tue', 7,  0),
    ('Wed', 5,  2),
    ('Thu', 9,  0),
    ('Fri', 12, 1),
    ('Sat', 3,  0),
    ('Sun', 2,  0);

-- ─── Dashboard recent activity ───────────────────────────────
INSERT INTO dashboard_recent_activity (label, time_label, severity) VALUES
    ('Deployment #247 succeeded on production',   '2 min ago',  'ok'),
    ('Incident #88 — API latency spike detected', '14 min ago', 'critical'),
    ('Sprint #12 review scheduled for tomorrow',  '1h ago',     'info'),
    ('SonarQube scan passed (coverage 84%)',       '3h ago',     'ok'),
    ('New team member onboarded: Marc D.',         '5h ago',     'warning');

-- ─── Notifications ───────────────────────────────────────────
INSERT INTO notifications (text, time_label, severity, is_read) VALUES
    ('Deployment pipeline completed',     '2 min ago',  'ok',       FALSE),
    ('Critical incident detected on API', '14 min ago', 'critical', FALSE),
    ('Sprint #12 review scheduled',       '1h ago',     'info',     FALSE);

-- ─── KPI summary ─────────────────────────────────────────────
INSERT INTO kpi_summary (generated_at, period, company, global_status)
VALUES ('2026-05-07T00:00:00Z', '2026-04', 'StreamFlow', 'critical');

INSERT INTO kpi_metrics (summary_id, domain, metric_key, value, unit, status, threshold)
SELECT id, 'technical', 'errorRate',       4.0,    '%',   'critical', 1.0    FROM kpi_summary WHERE period = '2026-04' UNION ALL
SELECT id, 'technical', 'avgResponseTime', 562,    'ms',  'warning',  300    FROM kpi_summary WHERE period = '2026-04' UNION ALL
SELECT id, 'technical', 'p95ResponseTime', 2500,   'ms',  'critical', 500    FROM kpi_summary WHERE period = '2026-04' UNION ALL
SELECT id, 'technical', 'uptime',          99.1,   '%',   'warning',  99.9   FROM kpi_summary WHERE period = '2026-04' UNION ALL
SELECT id, 'technical', 'mttr',            1.625,  'h',   'warning',  1.0    FROM kpi_summary WHERE period = '2026-04' UNION ALL
SELECT id, 'project',   'velocityS1',      87.5,   '%',   'ok',       NULL   FROM kpi_summary WHERE period = '2026-04' UNION ALL
SELECT id, 'project',   'velocityS2',      66.7,   '%',   'warning',  NULL   FROM kpi_summary WHERE period = '2026-04' UNION ALL
SELECT id, 'project',   'velocityS3',      50.0,   '%',   'critical', NULL   FROM kpi_summary WHERE period = '2026-04' UNION ALL
SELECT id, 'project',   'bugRate',         5.33,   'bugs/feat', 'critical', NULL FROM kpi_summary WHERE period = '2026-04' UNION ALL
SELECT id, 'project',   'fixRate',         56.25,  '%',   'critical', 80.0   FROM kpi_summary WHERE period = '2026-04' UNION ALL
SELECT id, 'devops',    'deployFrequency', 1.33,   '/day','ok',        NULL  FROM kpi_summary WHERE period = '2026-04' UNION ALL
SELECT id, 'devops',    'changeFailureRate',30.0,  '%',   'critical', 5.0    FROM kpi_summary WHERE period = '2026-04' UNION ALL
SELECT id, 'devops',    'leadTime',        5,      'days','warning',  1.0    FROM kpi_summary WHERE period = '2026-04' UNION ALL
SELECT id, 'business',  'churnRate',       33.3,   '%',   'critical', 5.0    FROM kpi_summary WHERE period = '2026-04' UNION ALL
SELECT id, 'business',  'retentionRate',   66.7,   '%',   'critical', 80.0   FROM kpi_summary WHERE period = '2026-04' UNION ALL
SELECT id, 'business',  'arpu',            10.0,   '€',   'ok',       NULL   FROM kpi_summary WHERE period = '2026-04' UNION ALL
SELECT id, 'business',  'conversionRate',  4.0,    '%',   'warning',  5.0    FROM kpi_summary WHERE period = '2026-04';
