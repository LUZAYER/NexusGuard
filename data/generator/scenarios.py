"""Labelled risk-pattern injection (account takeover, mule wallets, velocity attacks,
behavioural anomalies and suspicious device sharing) plus the controlled demo scenarios.

Every injected transaction carries ground-truth metadata (``scenario_id``, ``scenario_type``,
``is_anomalous``, ``expected_signals``). Ground truth is used only for evaluation; models never
see it as a feature.
"""
from __future__ import annotations

from collections import Counter
from dataclasses import dataclass, field

import numpy as np

from data.generator import geo
from data.generator.baseline import (
    DAY_S,
    DEMO_ATO_CLEAN,
    DEMO_HERO,
    DEMO_VELOCITY,
    MULE_WALLET_NUM,
    RESERVED_DEVICES,
    Customer,
    World,
)

ATTACKER_DEVICE = "DEV-8821"
MULE_RING_DEVICE_CODES = ["DEV-5E10", "DEV-5E11", "DEV-5E12"]
CLUSTER_DEVICE = "DEV-C7D2"


@dataclass
class ScenarioState:
    counters: Counter = field(default_factory=Counter)
    mule_wallets: list[int] = field(default_factory=list)
    attacker_pool: list[str] = field(default_factory=list)
    demo: dict[str, dict] = field(default_factory=dict)       # scenario label -> descriptor
    ring_center: int = -1
    ring_members: list[int] = field(default_factory=list)

    def next_id(self, prefix: str) -> str:
        self.counters[prefix] += 1
        return f"{prefix}-{self.counters[prefix]:03d}"


def _emit(world: World, *, t, cust, recipient, device, loc, ttype, amount, gt,
          lead_s=None, failed=0, merchant=-1):
    amount = float(np.round(amount / 10) * 10) if amount >= 100 else float(round(amount))
    row = {
        "t": float(t), "customer": cust, "wallet": cust, "recipient": int(recipient),
        "merchant": int(merchant), "device": device, "location": loc, "type": ttype,
        "amount": max(amount, 10.0), "gt": gt, "lead_s": lead_s, "failed": int(failed),
    }
    world.txns.append(row)
    return row


def _gt(sid, stype, expected, **extra):
    return {"scenario_id": sid, "scenario_type": stype, "is_anomalous": True,
            "expected_signals": sorted(set(expected)), **extra}


def _active_retail(world: World, min_txn: int, counts: Counter) -> list[int]:
    return [i for i in world.retail if counts[i] >= min_txn and not world.customers[i].clean]


def _typical_hours(world: World, c: Customer) -> tuple[float, float]:
    from data.generator.personas import ALL_PERSONAS
    p = ALL_PERSONAS[c.persona]
    return p.hours[0][0] + c.hour_shift[0], p.hours[0][1]


def _hour_is_unusual(world: World, c: Customer, hour: float) -> bool:
    centre, sd = _typical_hours(world, c)
    d = abs((hour - centre + 12) % 24 - 12)
    return d > max(2.5 * sd, 5.0) or hour < 5.5


# --------------------------------------------------------------------------------------
# Mule wallets
# --------------------------------------------------------------------------------------
def prepare_mules(world: World, state: ScenarioState, counts: Counter, n_mules: int) -> None:
    rng = world.rng
    candidates = [i for i in world.retail
                  if world.customers[i].persona in ("dormant", "low_frequency") and not world.customers[i].clean]
    chosen = [int(i) for i in rng.choice(candidates, n_mules, replace=False)]
    state.mule_wallets = chosen
    # Demo ring: the first 6 mules, centred on wallet WAL-5512.
    state.ring_members = chosen[:6]
    center = state.ring_members[0]
    holder = next(c for c in world.customers if c.wallet_num == MULE_WALLET_NUM)
    me = world.customers[center]
    if holder.idx != center:
        holder.wallet_num, me.wallet_num = me.wallet_num, holder.wallet_num
    state.ring_center = center
    for code in MULE_RING_DEVICE_CODES:
        world.add_device(code, first_seen_s=(world.days - 6) * DAY_S, platform="android")


def inject_mules(world: World, state: ScenarioState) -> None:
    rng = world.rng
    retail = world.retail
    ring = set(state.ring_members)
    # Rings of 5-8 random mules share 2 devices; the demo ring shares 3.
    others = [m for m in state.mule_wallets if m not in ring]
    rings: list[list[int]] = [state.ring_members]
    rng.shuffle(others)
    i = 0
    while i < len(others):
        size = int(rng.integers(5, 9))
        rings.append(others[i:i + size])
        i += size

    for r_idx, members in enumerate(rings):
        demo_ring = r_idx == 0
        if demo_ring:
            devices = list(MULE_RING_DEVICE_CODES)
        else:
            devices = []
            for _ in range(2):
                code = world.new_device_code(RESERVED_DEVICES)
                world.add_device(code, first_seen_s=float(rng.integers(20, world.days - 4)) * DAY_S)
                devices.append(code)
        for m in members:
            c = world.customers[m]
            sid = state.next_id("MULE")
            if demo_ring:
                start = (world.days - 3) * DAY_S + float(rng.uniform(0, 6 * 3600))
                n_in = 17 if m == state.ring_center else int(rng.integers(8, 15))
                span = 2.0 * DAY_S
            else:
                start = float(rng.integers(15, world.days - 3)) * DAY_S + float(rng.uniform(0, DAY_S * 0.5))
                n_in = int(rng.integers(14, 36))
                span = float(rng.uniform(0.6, 2.4)) * DAY_S
            device = str(rng.choice(devices))
            c.devices.append(device)
            senders = [int(s) for s in rng.choice(retail, size=n_in, replace=False) if int(s) != m]
            total_in = 0.0
            times: list[float] = []
            for s in senders:
                sc = world.customers[s]
                reps = int(rng.integers(3, 5)) if (demo_ring and m == state.ring_center) else 1
                for _ in range(reps):
                    t = start + float(rng.uniform(0, span))
                    base = (float(rng.uniform(10_000, 24_000)) if (demo_ring and m == state.ring_center)
                            else min(sc.median * float(rng.uniform(1.5, 6.0)), 25_000))
                    amt = max(base, 500.0)
                    total_in += amt
                    times.append(t)
                    _emit(world, t=t, cust=s, recipient=m, device=sc.devices[0], loc=sc.locs[0],
                          ttype="wallet_transfer", amount=amt,
                          gt=_gt(sid, "mule_wallet",
                                 ["new_recipient", "recipient_fan_in", "amount_deviation"],
                                 role="inbound_collection", mule_wallet=world.customers[m].code))
            # Rapid forwarding of 85-95% of the funds to 2-4 collectors within minutes.
            forward_total = total_in * float(rng.uniform(0.85, 0.95))
            n_out = int(rng.integers(3, 9))
            collectors = [int(x) for x in rng.choice(world.agents + [x for x in ring if x != m], size=min(4, 3))]
            t_out = max(times) + float(rng.uniform(300, 1800))
            cuts = np.sort(rng.dirichlet(np.ones(n_out))) * forward_total
            for amt in cuts:
                t_out += float(rng.uniform(20, 240))
                tgt = int(rng.choice(collectors))
                kind = "cash_out" if world.customers[tgt].persona == "agent" else "wallet_transfer"
                _emit(world, t=t_out, cust=m, recipient=tgt, device=device, loc=c.locs[0],
                      ttype=kind, amount=max(float(amt), 300.0),
                      gt=_gt(sid, "mule_wallet",
                             ["high_velocity", "amount_deviation", "new_recipient", "new_device",
                              "rapid_forwarding"],
                             role="rapid_forwarding", mule_wallet=c.code),
                      lead_s=float(rng.uniform(20, 120)), failed=int(rng.random() < 0.2))


# --------------------------------------------------------------------------------------
# Account takeover
# --------------------------------------------------------------------------------------
def inject_ato(world: World, state: ScenarioState, victim: int, *, t0: float,
               device: str | None = None, far: bool | None = None, subtle: bool = False,
               amounts: list[float] | None = None, gaps: list[float] | None = None,
               recipients: list[int] | None = None, loc: str | None = None,
               lead_s: float | None = None, failed: int | None = None,
               device_registered_s: float | None = None, scenario_label: str | None = None) -> list[dict]:
    rng = world.rng
    c = world.customers[victim]
    sid = state.next_id("ATO")
    hour = (t0 % DAY_S) / 3600
    new_device = device is None
    if device is None:
        if rng.random() < 0.3 and state.attacker_pool:
            device, new_device = str(rng.choice(state.attacker_pool)), False
        else:
            device = world.new_device_code(RESERVED_DEVICES)
    if device not in world.devices:
        world.add_device(device, first_seen_s=device_registered_s or (t0 - float(rng.uniform(300, 2400))))
    if loc is None:
        if far is None:
            far = rng.random() < 0.6
        loc = str(rng.choice(geo.far_codes(c.home_loc, 150.0))) if far else (
            c.home_loc if rng.random() < 0.6 else str(rng.choice(geo.nearby_codes(c.home_loc, 120.0))))
    k = int(rng.choice([1, 2]) if subtle else rng.choice([2, 3, 4, 5, 6], p=[0.12, 0.25, 0.28, 0.2, 0.15]))
    if amounts:
        k = len(amounts)
    first = c.median * float(rng.uniform(1.6, 3.0) if subtle else rng.uniform(4, 20))
    amts = amounts or [first * (1.0 if j == 0 else float(rng.uniform(0.35, 1.0))) for j in range(k)]
    gap = gaps or [0.0] + [float(rng.uniform(20, 180)) for _ in range(k - 1)]
    mules = [m for m in state.mule_wallets if m != victim]
    recips = recipients or [int(rng.choice(mules)) if rng.random() < 0.75 else int(rng.choice(world.retail))
                            for _ in range(int(rng.integers(1, 3)))] * k
    lead = lead_s if lead_s is not None else float(rng.uniform(60, 600))
    fail = failed if failed is not None else int(rng.choice([0, 1, 2, 3, 4, 5], p=[.35, .2, .15, .12, .1, .08]))
    t = t0
    rows = []
    # Occasionally the real customer is active minutes before the attacker (impossible travel).
    if loc != c.home_loc and rng.random() < 0.15 and not subtle and scenario_label is None:
        _emit(world, t=t0 - float(rng.uniform(600, 2400)), cust=victim,
              recipient=c.pools["wallet_transfer"][0], device=c.devices[0], loc=c.home_loc,
              ttype="wallet_transfer", amount=c.median, gt=None)
    for j in range(k):
        t += gap[j]
        amount = float(amts[j])
        ratio = amount / max(c.median, 1.0)
        expected = ["new_recipient"]
        if new_device or device not in c.devices:
            expected.append("new_device")
        if loc not in c.locs:
            expected.append("new_location")
        if _hour_is_unusual(world, c, (t % DAY_S) / 3600):
            expected.append("unusual_time")
        if ratio >= 3:
            expected.append("amount_deviation")
        if k >= 3:
            expected.append("high_velocity")
        ttype = ("cash_out" if (not subtle and scenario_label is None and rng.random() < 0.2 and world.agents)
                 else "wallet_transfer")
        rec = int(rng.choice(world.agents)) if ttype == "cash_out" else int(recips[j % len(recips)])
        extra = {"scenario_label": scenario_label} if scenario_label else {}
        rows.append(_emit(world, t=t, cust=victim, recipient=rec, device=device, loc=loc,
                          ttype=ttype, amount=amount,
                          gt=_gt(sid, "account_takeover", expected, step=j + 1, subtle=subtle, **extra),
                          lead_s=lead if j == 0 else None, failed=fail if j == 0 else 0))
    if device not in state.attacker_pool and not scenario_label and len(state.attacker_pool) < 25 and rng.random() < 0.3:
        state.attacker_pool.append(device)
    return rows


# --------------------------------------------------------------------------------------
# Velocity, behavioural anomaly, device sharing
# --------------------------------------------------------------------------------------
def inject_velocity(world: World, state: ScenarioState, victim: int, t0: float, *, k: int | None = None,
                    minutes: float | None = None, scenario_label: str | None = None) -> list[dict]:
    rng = world.rng
    c = world.customers[victim]
    sid = state.next_id("VEL")
    k = k or int(rng.integers(6, 15))
    span = (minutes or float(rng.uniform(2, 10))) * 60
    n_rec = int(rng.integers(4, 11))
    pool = c.pools["wallet_transfer"]
    recs = [int(rng.choice(pool)) if rng.random() < 0.4 else int(rng.choice(world.retail)) for _ in range(n_rec)]
    times = np.sort(rng.uniform(0, span, k)) + t0
    rows = []
    device = c.devices[0]
    for j, t in enumerate(times):
        rec = recs[j % n_rec]
        expected = ["high_velocity", "distinct_recipients"] + (["new_recipient"] if rec not in pool else [])
        extra = {"scenario_label": scenario_label} if scenario_label else {}
        rows.append(_emit(world, t=t, cust=victim, recipient=rec, device=device, loc=c.locs[0],
                          ttype="wallet_transfer", amount=c.median * float(rng.uniform(0.3, 1.5)),
                          gt=_gt(sid, "velocity_attack", expected, step=j + 1, **extra),
                          lead_s=float(rng.uniform(40, 200)) if j == 0 else None))
    return rows


def inject_behavior_anomaly(world: World, state: ScenarioState, victim: int, t0: float) -> dict:
    rng = world.rng
    c = world.customers[victim]
    sid = state.next_id("BEH")
    variant = str(rng.choice(["big_amount", "odd_time_big", "new_recipient_big", "odd_time_new_recipient"],
                             p=[0.40, 0.25, 0.25, 0.10]))
    day_base = np.floor(t0 / DAY_S) * DAY_S
    hour = (t0 % DAY_S) / 3600
    new_recipient = variant in ("new_recipient_big", "odd_time_new_recipient")
    if variant.startswith("odd_time"):
        hour = float(rng.uniform(0.5, 5.0))
    t = day_base + hour * 3600
    mult = {"big_amount": rng.uniform(5, 15), "odd_time_big": rng.uniform(3, 8),
            "new_recipient_big": rng.uniform(4, 10), "odd_time_new_recipient": rng.uniform(0.8, 1.6)}[variant]
    recipient = int(rng.choice(world.retail)) if new_recipient else int(rng.choice(c.pools["wallet_transfer"]))
    expected = ["amount_deviation"] if mult >= 3 else []
    if variant.startswith("odd_time"):
        expected.append("unusual_time")
    if new_recipient:
        expected.append("new_recipient")
    return _emit(world, t=t, cust=victim, recipient=recipient, device=c.devices[0], loc=c.locs[0],
                 ttype="wallet_transfer", amount=c.median * float(mult),
                 gt=_gt(sid, "behavioral_anomaly", expected, variant=variant),
                 lead_s=float(rng.uniform(40, 240)))


def inject_device_sharing(world: World, state: ScenarioState, counts: Counter, t0: float, *,
                          n_wallets: int | None = None, device: str | None = None,
                          scenario_label: str | None = None) -> list[dict]:
    rng = world.rng
    sid = state.next_id("DEVSHARE")
    if device is None:
        device = world.new_device_code(RESERVED_DEVICES)
    if device not in world.devices:
        world.add_device(device, first_seen_s=t0 - 3600)
    n_wallets = n_wallets or int(rng.integers(5, 13))
    wallets = [int(w) for w in rng.choice(_active_retail(world, 8, counts), n_wallets, replace=False)]
    collectors = [int(x) for x in rng.choice(world.retail, 3, replace=False)]
    locs = [str(x) for x in rng.choice([c for c, *_ in geo.LOCATIONS], 2, replace=False)]
    rows = []
    for w in wallets:
        c = world.customers[w]
        base = t0 + float(rng.uniform(0, 2 * DAY_S))
        for j in range(int(rng.integers(3, 8))):
            t = base + j * float(rng.uniform(40, 600))
            expected = ["device_shared_wallets", "new_device", "new_recipient"]
            if str(locs[0]) not in c.locs:
                expected.append("new_location")
            extra = {"scenario_label": scenario_label} if scenario_label else {}
            rows.append(_emit(world, t=t, cust=w, recipient=int(rng.choice(collectors)), device=device,
                              loc=str(rng.choice(locs)), ttype="wallet_transfer",
                              amount=c.median * float(rng.uniform(0.6, 3.0)),
                              gt=_gt(sid, "device_sharing", expected, step=j + 1, **extra),
                              lead_s=float(rng.uniform(30, 300)) if j == 0 else None))
    return rows


# --------------------------------------------------------------------------------------
# Orchestration
# --------------------------------------------------------------------------------------
def inject_all(world: World, *, n_ato=300, n_mule=80, n_velocity=150, n_behavior=400,
               n_device=40) -> ScenarioState:
    rng = world.rng
    state = ScenarioState()
    counts = Counter(t["customer"] for t in world.txns)
    prepare_mules(world, state, counts, n_mule)

    def rand_time(lo_day=20, hi_day=None):
        hi_day = hi_day or world.days - 3
        return float(rng.integers(lo_day, hi_day)) * DAY_S + float(rng.uniform(0, DAY_S))

    victims = _active_retail(world, 15, counts)
    inject_mules(world, state)
    for _ in range(n_ato):
        v = int(rng.choice(victims))
        subtle = rng.random() < 0.15
        night = rng.random() < 0.55 and not subtle
        day = float(rng.integers(20, world.days - 3)) * DAY_S
        hour = float(rng.uniform(0, 5.5)) if night else float(rng.uniform(6, 23.5))
        inject_ato(world, state, v, t0=day + hour * 3600, subtle=subtle)
    for _ in range(n_velocity):
        inject_velocity(world, state, int(rng.choice(victims)), rand_time())
    for _ in range(n_behavior):
        inject_behavior_anomaly(world, state, int(rng.choice(victims)), rand_time())
    for _ in range(n_device - 1):
        inject_device_sharing(world, state, counts, rand_time(15, world.days - 5))
    inject_demo(world, state, counts)
    return state


def inject_demo(world: World, state: ScenarioState, counts: Counter) -> None:
    """Controlled demo scenarios A-F (see data/scenarios/demo_scenarios.yaml)."""
    rng = world.rng
    code = world.code_to_idx
    hero, clean_b, vel = code[DEMO_HERO], code[DEMO_ATO_CLEAN], code[DEMO_VELOCITY]
    last = world.days - 1                                    # day of the demo attack (2026-10-07)
    hc = world.customers[hero]

    # A - normal transaction: ordinary evening transfer on the previous day.
    row_a = _emit(world, t=(last - 1) * DAY_S + 20 * 3600 + 41 * 60 + 12, cust=hero,
                  recipient=hc.pools["wallet_transfer"][0], device="DEV-88A1", loc="LOC-DHK",
                  ttype="wallet_transfer", amount=1300,
                  gt={"scenario_id": "DEMO-A", "scenario_type": "demo_normal", "is_anomalous": False,
                      "expected_signals": [], "scenario_label": "A"}, lead_s=95)
    state.demo["A"] = {"row": row_a}

    # DEV-8821: attacker device also used against three other victims (Dhaka, Chattogram).
    victims = [v for v in _active_retail(world, 15, counts) if world.customers[v].home_loc in ("LOC-DHK", "LOC-CTG")]
    side = [int(v) for v in rng.choice(victims, 3, replace=False)]
    for n, v in enumerate(side):
        t0 = (last - 4 + n) * DAY_S + float(rng.uniform(1, 4)) * 3600
        loc = "LOC-DHK" if n != 1 else "LOC-CTG"
        inject_ato(world, state, v, t0=t0, device=ATTACKER_DEVICE, loc=loc,
                   recipients=[state.ring_members[1]], scenario_label="F-prelude",
                   device_registered_s=None)

    # F - combined attack on the demo customer (TXN-982173 and four follow-ups in two minutes).
    t_attack = last * DAY_S + 2 * 3600 + 13 * 60 + 42
    ring_a, ring_b = state.ring_center, state.ring_members[1]
    rows = inject_ato(
        world, state, hero, t0=t_attack, device=ATTACKER_DEVICE, loc="LOC-DHK",
        amounts=[18700, 14200, 9800, 6500, 4900],
        gaps=[0, 27, 24, 28, 23],
        recipients=[ring_a, ring_a, ring_a, ring_b, ring_b],
        lead_s=162, failed=3, device_registered_s=last * DAY_S + 1 * 3600 + 58 * 60,
        scenario_label="F",
    )
    for r in rows:
        r["type"] = "wallet_transfer"
    state.demo["F"] = {"rows": rows}
    # Mule forwards the stolen funds onwards (scenario C continues the same ring).
    mule = world.customers[ring_a]
    t_fwd = t_attack + 25 * 60
    fwd_rows = []
    for j, amt in enumerate([21000, 17500, 13800]):
        tgt = int(rng.choice(world.agents))
        fwd_rows.append(_emit(world, t=t_fwd + j * 95, cust=ring_a, recipient=tgt, device=MULE_RING_DEVICE_CODES[0],
                              loc=mule.locs[0], ttype="cash_out", amount=amt,
                              gt=_gt("MULE-DEMO", "mule_wallet",
                                     ["high_velocity", "amount_deviation", "new_recipient", "rapid_forwarding"],
                                     role="rapid_forwarding", scenario_label="C"),
                              lead_s=70 if j == 0 else None))
    state.demo["C"] = {"rows": fwd_rows}

    # B - clean account takeover on CUST-3310 (new device, far location, night, no mule involved).
    t_b = last * DAY_S + 3 * 3600 + 40 * 60
    rows_b = inject_ato(world, state, clean_b, t0=t_b, far=True, scenario_label="B",
                        recipients=[int(rng.choice(world.retail))], failed=2, lead_s=240)
    state.demo["B"] = {"rows": rows_b}

    # D - velocity anomaly on CUST-2048 (10 transfers within four minutes).
    rows_d = inject_velocity(world, state, vel, (last - 1) * DAY_S + 14 * 3600 + 20 * 60, k=10, minutes=4,
                             scenario_label="D")
    state.demo["D"] = {"rows": rows_d}

    # E - suspicious device-sharing network (one device, eight unrelated wallets).
    rows_e = inject_device_sharing(world, state, counts, (last - 1) * DAY_S + 9 * 3600, n_wallets=8,
                                   device=CLUSTER_DEVICE, scenario_label="E")
    state.demo["E"] = {"rows": rows_e}
