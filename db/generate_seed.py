#!/usr/bin/env python3
"""
generate_seed.py — Generates db/migrations/V3__seed_realistic.sql

Produces 6 months of coherent, production-like data for the StreamFlow dashboard
covering November 2025 → April 2026 (the 6 months before the current date May 2026).

Run:
    python3 db/generate_seed.py
Output:
    db/migrations/V3__seed_realistic.sql
"""

from __future__ import annotations
import random
import math
from datetime import datetime, timezone
from pathlib import Path

random.seed(42)  # deterministic output

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def ts(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")

def month_label(dt: datetime) -> str:
    return dt.strftime("%Y-%m")

def pct(numerator: float, denominator: float, decimals: int = 2) -> float:
    if denominator == 0:
        return 0.0
    return round((numerator / denominator) * 100, decimals)

# ---------------------------------------------------------------------------
# Time axis: 6 months, end of each month
# ---------------------------------------------------------------------------

MONTHS = [
    datetime(2025, 11, 30, 23, 59, 0, tzinfo=timezone.utc),
    datetime(2025, 12, 31, 23, 59, 0, tzinfo=timezone.utc),
    datetime(2026,  1, 31, 23, 59, 0, tzinfo=timezone.utc),
    datetime(2026,  2, 28, 23, 59, 0, tzinfo=timezone.utc),
    datetime(2026,  3, 31, 23, 59, 0, tzinfo=timezone.utc),
    datetime(2026,  4, 30, 23, 59, 0, tzinfo=timezone.utc),
]

PERIOD_LABELS = [month_label(m) for m in MONTHS]

# ---------------------------------------------------------------------------
# Business growth trajectory (gradual improvement over 6 months)
# ---------------------------------------------------------------------------

def business_trajectory(month_idx: int) -> dict:
    """Returns business metrics that improve progressively month over month."""
    # Starting point Nov 2025, ending Apr 2026
    base_total        = 210_000 + month_idx * 12_000
    churn_rate        = round(max(4.5, 33.3 - month_idx * 4.8), 1)
    retention_rate    = round(100 - churn_rate, 1)
    new_this_month    = 18_000 + month_idx * 1_200
    churned           = int(base_total * churn_rate / 100)
    active_monthly    = int(base_total * retention_rate / 100 * 0.85)
    start_of_month    = base_total
    end_of_month      = base_total + new_this_month - churned
    revenue           = round(base_total * (9.99 * 0.42), 2)   # ~42% paying
    arpu              = round(revenue / base_total, 2)
    conv_visitors     = 180_000 + month_idx * 8_000
    conv_rate         = round(min(6.5, 4.0 + month_idx * 0.4), 2)
    conv_new_subs     = int(conv_visitors * conv_rate / 100)
    return dict(
        total=base_total, active_monthly=active_monthly,
        start_of_month=start_of_month, end_of_month=end_of_month,
        new_this_month=new_this_month, churned_this_month=churned,
        revenue=revenue, arpu=arpu, sub_price=9.99,
        conv_visitors=conv_visitors, conv_new_subs=conv_new_subs, conv_rate=conv_rate,
        churn_rate=churn_rate, churn_users=churned, retention_rate=retention_rate,
    )

# ---------------------------------------------------------------------------
# Technical trajectory (starts poor, improves significantly)
# ---------------------------------------------------------------------------

def technical_trajectory(month_idx: int) -> dict:
    """Returns technical metrics improving over time (ops maturity)."""
    total_req    = 1_100_000 + month_idx * 150_000
    error_rate   = round(max(0.8, 4.0 - month_idx * 0.55), 2)
    error_req    = int(total_req * error_rate / 100)
    uptime_pct   = round(min(99.95, 99.1 + month_idx * 0.14), 2)
    total_hours  = 720
    downtime_h   = round(total_hours * (1 - uptime_pct / 100), 3)
    mttr         = round(max(0.25, 1.625 - month_idx * 0.22), 3)
    rt_avg       = max(120, 562 - month_idx * 55)
    rt_p95       = max(300, 2500 - month_idx * 320)
    return dict(
        total_requests=total_req, error_requests=error_req, error_rate=error_rate,
        uptime_total_hours=total_hours, uptime_downtime_h=downtime_h, uptime_percent=uptime_pct,
        mttr_avg_hours=mttr, rt_average_ms=rt_avg, rt_p95_ms=rt_p95,
    )

# ---------------------------------------------------------------------------
# DevOps trajectory (CI/CD matures)
# ---------------------------------------------------------------------------

def devops_trajectory(month_idx: int) -> dict:
    period_days   = 30
    total         = 40 + month_idx * 12
    cfr           = round(max(3.5, 30.0 - month_idx * 4.4), 2)
    failed        = max(1, int(total * cfr / 100))
    successful    = total - failed
    freq          = round(total / period_days, 2)
    lead_time     = max(1, 5 - month_idx)
    return dict(
        deploy_total=total, deploy_successful=successful, deploy_failed=failed,
        change_failure_rate=cfr, frequency_per_day=freq,
        period_days=period_days, lead_time_avg_days=lead_time,
        team_developers=15, team_devops=2, team_product_owner=1, team_cto=1,
    )

# ---------------------------------------------------------------------------
# Project trajectory (velocity recovering after bad start)
# ---------------------------------------------------------------------------

SPRINT_DATA: list[dict] = []
sprint_id = 1
# 2 sprints per month → 12 sprints over 6 months, +1 active, +1 planned
velocities = [88, 67, 50, 58, 65, 72, 75, 79, 82, 84, 87, 89]
for idx, vel in enumerate(velocities):
    planned = random.randint(38, 55)
    done    = int(planned * vel / 100)
    SPRINT_DATA.append(dict(
        sprint_id=sprint_id,
        name=f"Sprint {sprint_id}",
        short_name=f"S{sprint_id}",
        planned=planned, done=done, velocity=vel,
        status="completed",
    ))
    sprint_id += 1

# active sprint
SPRINT_DATA.append(dict(
    sprint_id=sprint_id, name=f"Sprint {sprint_id}", short_name=f"S{sprint_id}",
    planned=50, done=32, velocity=64, status="active",
))
sprint_id += 1

# planned sprint
SPRINT_DATA.append(dict(
    sprint_id=sprint_id, name=f"Sprint {sprint_id}", short_name=f"S{sprint_id}",
    planned=52, done=0, velocity=0, status="planned",
))

def project_trajectory(month_idx: int) -> dict:
    bugs_detected    = max(20, 320 - month_idx * 42)
    fix_rate         = round(min(90.0, 56.25 + month_idx * 5.6), 2)
    bugs_fixed       = int(bugs_detected * fix_rate / 100)
    bugs_open        = bugs_detected - bugs_fixed
    features         = 50 + month_idx * 8
    bug_rate         = round(bugs_detected / max(features, 1), 2)
    return dict(
        bugs_detected=bugs_detected, bugs_fixed=bugs_fixed, bugs_open=bugs_open,
        fix_rate=fix_rate, features_delivered=features,
        bug_rate=bug_rate, period="monthly",
    )

# ---------------------------------------------------------------------------
# Incidents — realistic spread over 6 months
# ---------------------------------------------------------------------------

INCIDENT_TEMPLATES = [
    ("DB connection timeout",               "medium",   0.5, 30),
    ("API gateway 502 errors",              "high",     1.0, 60),
    ("Video streaming CDN failure",         "critical", 2.0, 120),
    ("Payment service degraded",            "critical", 1.5, 90),
    ("Memory leak in worker process",       "medium",   0.75, 45),
    ("SSL certificate renewal failure",     "high",     0.5, 30),
    ("Kubernetes node eviction",            "medium",   0.25, 15),
    ("Elasticsearch indexing backlog",      "medium",   1.0, 60),
    ("Redis cache eviction storm",          "high",     0.5, 30),
    ("Notification service unresponsive",   "low",      0.25, 15),
    ("Build pipeline stuck",                "low",      0.5, 30),
    ("Auth service token validation bug",   "critical", 0.75, 45),
    ("S3 bucket permission misconfiguration","high",    0.25, 15),
    ("Webhook retry loop",                  "medium",   0.5, 30),
    ("Rate limiter misconfigured",          "low",      0.25, 15),
    ("Load balancer health check failing",  "high",     0.5, 30),
    ("Database replication lag spike",      "medium",   0.75, 45),
    ("Frontend bundle cache poisoning",     "medium",   0.5, 30),
    ("Third-party analytics timeout",       "low",      0.25, 15),
    ("SMTP relay blacklisted",              "medium",   0.5, 30),
]

def generate_incidents(month_idx: int) -> list[dict]:
    """Fewer & less severe incidents as ops matures."""
    count = max(2, 8 - month_idx)
    chosen = random.sample(INCIDENT_TEMPLATES, min(count, len(INCIDENT_TEMPLATES)))
    result = []
    for title, sev, dur_h, dur_m in chosen:
        # All past months → resolved; last month may have open ones
        status = "resolved" if month_idx < 5 else random.choice(["resolved", "resolved", "open"])
        result.append(dict(title=title, severity=sev,
                           duration_hours=dur_h, duration_minutes=dur_m, status=status))
    return result

# ---------------------------------------------------------------------------
# Response time samples (improving curve each month)
# ---------------------------------------------------------------------------

def generate_rt_samples(month_idx: int) -> list[int]:
    base   = max(80, 120 - month_idx * 5)
    p95    = max(300, 2500 - month_idx * 320)
    # log-normal-ish distribution with 20 sample points
    samples = []
    for i in range(1, 21):
        # exponential ramp to simulate tail latency
        factor = math.exp(i / 20 * math.log(p95 / base))
        ms = int(base * factor + random.randint(-10, 10))
        samples.append(max(50, ms))
    return sorted(samples)

# ---------------------------------------------------------------------------
# Dashboard KPIs (computed from the latest month)
# ---------------------------------------------------------------------------

def dashboard_kpis(tech: dict, prev_tech: dict, devops: dict, prev_devops: dict) -> list[dict]:
    uptime_trend = round(tech["uptime_percent"] - prev_tech["uptime_percent"], 2)
    rt_trend     = round(-(tech["rt_average_ms"] - prev_tech["rt_average_ms"]) / prev_tech["rt_average_ms"] * 100, 1)
    deploy_trend = round((devops["deploy_total"] - prev_devops["deploy_total"]) / max(prev_devops["deploy_total"], 1) * 100, 1)
    return [
        dict(title="Uptime",           value=tech["uptime_percent"], unit="%",  status=_status(tech["uptime_percent"], 99.9, 99.5, higher_is_better=True),  trend=uptime_trend, description="vs last month"),
        dict(title="Avg Response Time",value=tech["rt_average_ms"],  unit="ms", status=_status(tech["rt_average_ms"], 200, 400, higher_is_better=False),     trend=rt_trend,     description="vs last month"),
        dict(title="Deploys / Month",  value=devops["deploy_total"], unit=None, status="ok",                                                                 trend=deploy_trend, description="vs last month"),
        dict(title="Error Rate",       value=tech["error_rate"],     unit="%",  status=_status(tech["error_rate"], 1.0, 2.0, higher_is_better=False),        trend=round(-(tech["error_rate"] - prev_tech["error_rate"]), 2), description="vs last month"),
    ]

def _status(value: float, ok_thresh: float, warn_thresh: float, higher_is_better: bool) -> str:
    if higher_is_better:
        if value >= ok_thresh:
            return "ok"
        if value >= warn_thresh:
            return "warning"
        return "critical"
    else:
        if value <= ok_thresh:
            return "ok"
        if value <= warn_thresh:
            return "warning"
        return "critical"

# ---------------------------------------------------------------------------
# Request volume (24h pattern, scaled by month traffic)
# ---------------------------------------------------------------------------

HOUR_WEIGHTS = [0.3,0.2,0.15,0.1,0.12,0.2, 0.4,0.7,0.9,1.0,0.95,0.92,
                0.88,0.85,0.9,0.92,0.95,0.98,0.85,0.75,0.65,0.55,0.45,0.35]

def generate_request_volume(total_monthly: int) -> list[dict]:
    daily_avg = total_monthly / 30
    rows = []
    for h, w in enumerate(HOUR_WEIGHTS):
        req = int(daily_avg / 24 * w * random.uniform(0.9, 1.1))
        rows.append(dict(time_label=f"{h:02d}:00", requests=max(50, req)))
    return rows

# ---------------------------------------------------------------------------
# Weekly deploy chart (Mon–Sun)
# ---------------------------------------------------------------------------

DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
DAY_WEIGHTS = [0.9, 1.0, 0.95, 1.0, 1.1, 0.4, 0.2]

def generate_weekly_deploys(devops: dict) -> list[dict]:
    weekly_total = devops["deploy_total"] // 4
    rows = []
    for day, w in zip(DAYS, DAY_WEIGHTS):
        deploys  = max(0, int(weekly_total / 7 * w * random.uniform(0.8, 1.2)))
        failures = max(0, int(deploys * devops["change_failure_rate"] / 100 * random.uniform(0.5, 1.5)))
        rows.append(dict(day_label=day, deploys=deploys, failures=min(failures, deploys)))
    return rows

# ---------------------------------------------------------------------------
# Recent activity (last 5 events per snapshot)
# ---------------------------------------------------------------------------

ACTIVITY_TEMPLATES = [
    ("Deployment #{n} succeeded on production",        "ok"),
    ("Incident #{n} — API latency spike detected",     "critical"),
    ("Sprint #{n} review completed",                   "info"),
    ("SonarQube scan passed (coverage {c}%)",          "ok"),
    ("Dependency vulnerability patched",               "warning"),
    ("Automated backup completed successfully",        "ok"),
    ("Canary deploy #{n} rolled back",                 "warning"),
    ("New team member onboarded",                      "info"),
    ("Database index rebuild completed",               "ok"),
    ("Alert: memory usage > 80% on worker-{n}",       "warning"),
]

def generate_activity(deploy_n: int, sprint_n: int) -> list[dict]:
    templates = random.sample(ACTIVITY_TEMPLATES, 5)
    times     = ["2 min ago", "18 min ago", "1h ago", "3h ago", "6h ago"]
    rows = []
    for (label_tpl, sev), t in zip(templates, times):
        label = (label_tpl
                 .replace("{n}", str(random.randint(deploy_n - 5, deploy_n)))
                 .replace("{c}", str(random.randint(78, 92))))
        rows.append(dict(label=label, time_label=t, severity=sev))
    return rows

# ---------------------------------------------------------------------------
# Notifications (5 per month)
# ---------------------------------------------------------------------------

NOTIF_TEMPLATES = [
    ("Deployment pipeline completed successfully",    "ok"),
    ("Critical incident detected: {t}",              "critical"),
    ("New sprint started: Sprint {n}",               "info"),
    ("Uptime SLA at risk — {u}% this month",         "warning"),
    ("Churn rate improved to {c}%",                  "info"),
    ("Security scan found 0 critical issues",        "ok"),
    ("Build failure on branch feature/{n}",          "warning"),
    ("Monthly backup verified",                      "ok"),
    ("Response time p95 exceeded 1s threshold",      "critical"),
    ("Team velocity trending up +{v}%",              "ok"),
]

def generate_notifications(sprint_n: int, uptime: float, churn: float) -> list[dict]:
    templates = random.sample(NOTIF_TEMPLATES, 5)
    times     = ["just now", "5 min ago", "1h ago", "3h ago", "yesterday"]
    rows = []
    for (text_tpl, sev), t in zip(templates, times):
        text = (text_tpl
                .replace("{n}", str(sprint_n))
                .replace("{u}", str(uptime))
                .replace("{c}", str(churn))
                .replace("{v}", str(random.randint(3, 12)))
                .replace("{t}", random.choice(["DB timeout", "API 502", "payment error"])))
        rows.append(dict(text=text, time_label=t, severity=sev, is_read=False))
    return rows

# ---------------------------------------------------------------------------
# KPI summary metrics
# ---------------------------------------------------------------------------

def generate_kpi_metrics(period: str, tech: dict, proj: dict, devops: dict, biz: dict) -> list[dict]:
    return [
        dict(domain="technical", metric_key="errorRate",        value=tech["error_rate"],        unit="%",       status=_status(tech["error_rate"],      1.0, 2.0, False),  threshold=1.0),
        dict(domain="technical", metric_key="avgResponseTime",  value=tech["rt_average_ms"],     unit="ms",      status=_status(tech["rt_average_ms"],   200, 400, False),  threshold=200),
        dict(domain="technical", metric_key="p95ResponseTime",  value=tech["rt_p95_ms"],         unit="ms",      status=_status(tech["rt_p95_ms"],       500, 1000, False), threshold=500),
        dict(domain="technical", metric_key="uptime",           value=tech["uptime_percent"],    unit="%",       status=_status(tech["uptime_percent"],  99.9, 99.5, True), threshold=99.9),
        dict(domain="technical", metric_key="mttr",             value=tech["mttr_avg_hours"],    unit="h",       status=_status(tech["mttr_avg_hours"],  0.5, 1.0, False),  threshold=1.0),
        dict(domain="project",   metric_key="fixRate",          value=proj["fix_rate"],          unit="%",       status=_status(proj["fix_rate"],        80.0, 65.0, True), threshold=80.0),
        dict(domain="project",   metric_key="bugRate",          value=proj["bug_rate"],          unit="bugs/feat",status=_status(proj["bug_rate"],       2.0,  4.0, False), threshold=2.0),
        dict(domain="devops",    metric_key="deployFrequency",  value=devops["frequency_per_day"],unit="/day",   status="ok",                                               threshold=None),
        dict(domain="devops",    metric_key="changeFailureRate",value=devops["change_failure_rate"],unit="%",    status=_status(devops["change_failure_rate"], 5.0, 15.0, False), threshold=5.0),
        dict(domain="devops",    metric_key="leadTime",         value=devops["lead_time_avg_days"],unit="days",  status=_status(devops["lead_time_avg_days"], 1, 3, False), threshold=1.0),
        dict(domain="business",  metric_key="churnRate",        value=biz["churn_rate"],         unit="%",       status=_status(biz["churn_rate"],       5.0, 10.0, False), threshold=5.0),
        dict(domain="business",  metric_key="retentionRate",    value=biz["retention_rate"],     unit="%",       status=_status(biz["retention_rate"],   90.0, 80.0, True), threshold=80.0),
        dict(domain="business",  metric_key="arpu",             value=biz["arpu"],               unit="€",       status="ok",                                               threshold=None),
        dict(domain="business",  metric_key="conversionRate",   value=biz["conv_rate"],          unit="%",       status=_status(biz["conv_rate"],        5.0, 3.0, True),  threshold=5.0),
    ]

# ---------------------------------------------------------------------------
# SQL writers
# ---------------------------------------------------------------------------

def sql_val(v: object) -> str:
    if v is None:
        return "NULL"
    if isinstance(v, bool):
        return "TRUE" if v else "FALSE"
    if isinstance(v, str):
        return "'" + v.replace("'", "''") + "'"
    return str(v)

def insert(table: str, rows: list[dict], recorded_at: datetime | None = None) -> str:
    if not rows:
        return ""
    cols = list(rows[0].keys())
    if recorded_at is not None and "recorded_at" not in cols:
        cols.append("recorded_at")
    lines = []
    for row in rows:
        vals = [sql_val(row[c]) for c in cols if c != "recorded_at"]
        if recorded_at is not None and "recorded_at" not in row:
            vals.append(sql_val(ts(recorded_at)))
        lines.append("    (" + ", ".join(vals) + ")")
    col_str = ", ".join(c for c in cols)
    return f"INSERT INTO {table} ({col_str}) VALUES\n" + ",\n".join(lines) + ";\n"

# ---------------------------------------------------------------------------
# Main generation
# ---------------------------------------------------------------------------

def generate() -> str:
    out: list[str] = []
    out.append("-- =============================================================")
    out.append("-- V3 — StreamFlow Dashboard — 6-month realistic seed data")
    out.append("-- Covers: November 2025 → April 2026")
    out.append("-- Generated by: db/generate_seed.py")
    out.append("-- =============================================================\n")

    tech_snapshots   = []
    devops_snapshots = []

    sprint_idx = 0  # index into SPRINT_DATA

    for month_idx, snapshot_dt in enumerate(MONTHS):
        period = PERIOD_LABELS[month_idx]
        out.append("-- ═══════════════════════════════════════════════════════════")
        out.append(f"-- {period}")
        out.append("-- ═══════════════════════════════════════════════════════════\n")

        tech   = technical_trajectory(month_idx)
        devops = devops_trajectory(month_idx)
        proj   = project_trajectory(month_idx)
        biz    = business_trajectory(month_idx)

        tech_snapshots.append(tech)
        devops_snapshots.append(devops)

        # ── Technical overview
        out.append(f"-- Technical overview — {period}")
        out.append(insert("technical_overview", [tech], snapshot_dt))

        # ── Technical incidents
        incidents = generate_incidents(month_idx)
        out.append(f"-- Technical incidents — {period} ({len(incidents)} incidents)")
        out.append(insert("technical_incidents", incidents, snapshot_dt))

        total_downtime = sum(i["duration_hours"] for i in incidents)
        mttr           = round(total_downtime / max(len(incidents), 1), 3)
        inc_summary    = dict(
            total=len(incidents),
            total_downtime_hours=round(total_downtime, 2),
            mttr_hours=mttr,
            period_days=30,
        )
        out.append(insert("technical_incidents_summary", [inc_summary], snapshot_dt))

        # ── Response time samples
        samples = generate_rt_samples(month_idx)
        sample_rows = [dict(sample_index=i + 1, ms=ms) for i, ms in enumerate(samples)]
        out.append(f"-- Response time samples — {period}")
        out.append(insert("technical_response_time_samples", sample_rows, snapshot_dt))

        stats_row = dict(
            min_ms=samples[0], max_ms=samples[-1],
            average_ms=int(sum(samples) / len(samples)),
            p50_ms=samples[len(samples) // 2],
            p90_ms=samples[int(len(samples) * 0.9)],
            p95_ms=samples[-1],
        )
        out.append(insert("technical_response_time_stats", [stats_row], snapshot_dt))

        # ── Project overview
        out.append(f"-- Project overview — {period}")
        out.append(insert("project_overview", [proj], snapshot_dt))

        # ── Sprints (2 per month)
        sprint_rows = []
        for _ in range(2):
            if sprint_idx < len(SPRINT_DATA):
                s = SPRINT_DATA[sprint_idx]
                sprint_rows.append(dict(
                    sprint_id=s["sprint_id"], name=s["name"], short_name=s["short_name"],
                    story_points_planned=s["planned"], story_points_done=s["done"],
                    velocity_percent=s["velocity"], status=s["status"],
                ))
                sprint_idx += 1

        # On last month add active + planned
        if month_idx == 5:
            for extra_idx in range(sprint_idx, min(sprint_idx + 2, len(SPRINT_DATA))):
                s = SPRINT_DATA[extra_idx]
                sprint_rows.append(dict(
                    sprint_id=s["sprint_id"], name=s["name"], short_name=s["short_name"],
                    story_points_planned=s["planned"], story_points_done=s["done"],
                    velocity_percent=s["velocity"], status=s["status"],
                ))

        out.append(f"-- Project sprints — {period}")
        out.append(insert("project_sprints", sprint_rows, snapshot_dt))

        completed_sprints = [s for s in SPRINT_DATA[:sprint_idx] if s["status"] == "completed"]
        total_planned_all = sum(s["planned"] for s in completed_sprints)
        total_done_all    = sum(s["done"]    for s in completed_sprints)
        avg_vel           = round(sum(s["velocity"] for s in completed_sprints) / max(len(completed_sprints), 1), 1)
        prev_vel          = round(sum(s["velocity"] for s in completed_sprints[:-2]) / max(len(completed_sprints) - 2, 1), 1) if len(completed_sprints) > 2 else avg_vel
        trend             = "improving" if avg_vel > prev_vel else "stable" if avg_vel == prev_vel else "declining"
        out.append(insert("project_sprints_summary", [dict(
            total_planned=total_planned_all, total_done=total_done_all,
            average_velocity_percent=avg_vel, trend=trend,
        )], snapshot_dt))

        # ── DevOps overview
        out.append(f"-- DevOps overview — {period}")
        out.append(insert("devops_overview", [devops], snapshot_dt))

        # ── Business overview
        out.append(f"-- Business overview — {period}")
        biz_overview = dict(
            revenue_total=biz["revenue"], revenue_currency="EUR", revenue_period="monthly",
            arpu_value=biz["arpu"], arpu_currency="EUR", subscription_price=biz["sub_price"],
            conv_visitors=biz["conv_visitors"], conv_new_subs=biz["conv_new_subs"], conv_rate=biz["conv_rate"],
            churn_users=biz["churn_users"], churn_rate=biz["churn_rate"], retention_rate=biz["retention_rate"],
        )
        out.append(insert("business_overview", [biz_overview], snapshot_dt))

        # ── Business users
        biz_users = dict(
            total=biz["total"], active_monthly=biz["active_monthly"],
            start_of_month=biz["start_of_month"], end_of_month=biz["end_of_month"],
            new_this_month=biz["new_this_month"], churned_this_month=biz["churned_this_month"],
        )
        out.append(insert("business_users", [biz_users], snapshot_dt))

        # ── Business user evolution (weekly within month)
        weekly_base = biz["start_of_month"]
        weekly_step = (biz["end_of_month"] - biz["start_of_month"]) / 4
        evo_rows = [dict(label=f"Week {w+1}", value=int(weekly_base + weekly_step * w)) for w in range(5)]
        out.append(insert("business_user_evolution", evo_rows, snapshot_dt))

        # ── Dashboard KPIs
        prev_tech   = tech_snapshots[month_idx - 1] if month_idx > 0 else tech
        prev_devops = devops_snapshots[month_idx - 1] if month_idx > 0 else devops
        kpi_rows = dashboard_kpis(tech, prev_tech, devops, prev_devops)
        out.append(f"-- Dashboard KPIs — {period}")
        out.append(insert("dashboard_kpis", kpi_rows, snapshot_dt))

        # ── Request volume
        rv_rows = generate_request_volume(tech["total_requests"])
        out.append(f"-- Dashboard request volume — {period}")
        out.append(insert("dashboard_request_volume", rv_rows, snapshot_dt))

        # ── Weekly deploys
        wd_rows = generate_weekly_deploys(devops)
        out.append(f"-- Dashboard weekly deploys — {period}")
        out.append(insert("dashboard_weekly_deploys", wd_rows, snapshot_dt))

        # ── Recent activity
        act_rows = generate_activity(devops["deploy_total"], sprint_idx)
        out.append(f"-- Dashboard recent activity — {period}")
        out.append(insert("dashboard_recent_activity", act_rows, snapshot_dt))

        # ── Notifications
        notif_rows = generate_notifications(sprint_idx, tech["uptime_percent"], biz["churn_rate"])
        out.append(f"-- Notifications — {period}")
        out.append(insert("notifications", notif_rows, snapshot_dt))

        # ── KPI summary
        out.append(f"-- KPI summary — {period}")
        # Determine global status
        metrics = generate_kpi_metrics(period, tech, proj, devops, biz)
        statuses = [m["status"] for m in metrics]
        global_status = "critical" if "critical" in statuses else "warning" if "warning" in statuses else "ok"

        # Use a DO block to insert summary then metrics without a CTE dependency
        out.append("DO $$")
        out.append("DECLARE v_id INTEGER;")
        out.append("BEGIN")
        out.append("  INSERT INTO kpi_summary (generated_at, period, company, global_status)")
        out.append(f"  VALUES ('{ts(snapshot_dt)}', '{period}', 'StreamFlow', '{global_status}')")
        out.append("  RETURNING id INTO v_id;")
        for m in metrics:
            thresh = sql_val(m["threshold"])
            out.append(
                f"  INSERT INTO kpi_metrics (summary_id, domain, metric_key, value, unit, status, threshold) "
                f"VALUES (v_id, '{m['domain']}', '{m['metric_key']}', {m['value']}, '{m['unit']}', '{m['status']}', {thresh});"
            )
        out.append("END $$;\n")

    return "\n".join(out)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    output_path = Path(__file__).parent / "migrations" / "V3__seed_realistic.sql"
    sql = generate()
    output_path.write_text(sql, encoding="utf-8")
    lines = sql.count("\n")
    print(f"✅  Generated {output_path}  ({lines} lines)")
