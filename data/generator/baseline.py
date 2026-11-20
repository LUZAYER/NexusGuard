"""Synthetic world construction and baseline (legitimate) transaction generation.

Everything produced here is synthetic. Behaviour is driven by personas with realistic
distributions; benign-but-unusual behaviour ("confounders" such as a new phone, a trip, or
a rent payment) is injected deliberately so detection models face genuine ambiguity.
"""
from __future__ import annotations

import string
from dataclasses import dataclass, field
from typing import Any

import numpy as np

from data.generator import geo
from data.generator.personas import (
    AGENT_PERSONA,
    ALL_PERSONAS,
    BILLER_CATEGORIES,
    MERCHANT_CATEGORIES,
    MERCHANT_PERSONA,
    PERSONAS,
    TYPE_AMOUNT_FACTOR,
    Persona,
)

DAY_S = 86_400.0

# Entities that the product demo narrative refers to by code (see data/scenarios).
DEMO_HERO = "CUST-1024"
DEMO_ATO_CLEAN = "CUST-3310"
DEMO_VELOCITY = "CUST-2048"
HERO_WALLET_NUM = 8831
MULE_WALLET_NUM = 5512

_GIVEN = ["Arif", "Nusrat", "Tanvir", "Farhana", "Imran", "Sadia", "Rakib", "Mahfuza", "Shahin",
          "Rumana", "Jahid", "Tasnim", "Mizan", "Lamia", "Sohel", "Nabila", "Kamrul", "Ritu",
          "Fahim", "Sumaiya", "Habib", "Anika", "Rubel", "Moushumi", "Zakir", "Priya", "Tareq", "Salma"]
_FAMILY = ["Ahmed", "Hossain", "Rahman", "Chowdhury", "Islam", "Khan", "Sarker", "Mondal", "Akter",
           "Uddin", "Mia", "Talukder", "Biswas", "Das", "Roy", "Karim", "Sheikh", "Majumder"]
_SHOP_A = ["Nakshi", "Padma", "Meghna", "Shapla", "Tarun", "Bondhu", "Sonar", "Noyon", "Alo", "Surjo"]
_SHOP_B = ["Traders", "Store", "Mart", "Corner", "Enterprise", "Point", "House", "Bazar"]


@dataclass
class Customer:
    idx: int
    code: str
    name: str
    persona: str
    wallet_type: str
    home_loc: str
    median: float
    sigma: float
    rate: float
    kyc_level: str = "standard"
    locs: list[str] = field(default_factory=list)
    devices: list[str] = field(default_factory=list)
    hour_shift: list[float] = field(default_factory=list)
    pools: dict[str, list[int]] = field(default_factory=dict)
    opened_at_s: float = 0.0          # seconds relative to dataset start (negative = before)
    wallet_num: int = 0
    merchant_category: str | None = None
    clean: bool = False               # demo hero: no confounders injected


@dataclass
class World:
    rng: np.random.Generator
    days: int
    customers: list[Customer]
    devices: dict[str, dict[str, Any]]
    merchants: dict[int, dict[str, Any]]     # keyed by customer idx
    agents: list[int]
    regular_merchants: list[int]
    utility_billers: list[int]
    telecom_billers: list[int]
    retail: list[int]
    code_to_idx: dict[str, int]
    txns: list[dict[str, Any]] = field(default_factory=list)

    @property
    def horizon_s(self) -> float:
        return self.days * DAY_S

    def add_device(self, code: str, first_seen_s: float, platform: str | None = None) -> None:
        rng = self.rng
        self.devices[code] = {
            "code": code,
            "platform": platform or ("android" if rng.random() < 0.88 else "ios"),
            "model_label": str(rng.choice(["Samsung A-series", "Xiaomi Redmi", "Realme C", "Oppo A",
                                           "Vivo Y", "iPhone", "Infinix Hot", "Tecno Spark"])),
            "first_seen_s": first_seen_s,
        }

    def new_device_code(self, reserved: set[str] | None = None) -> str:
        reserved = reserved or set()
        while True:
            code = "DEV-" + "".join(self.rng.choice(list("0123456789ABCDEF"), 4))
            if code not in self.devices and code not in reserved:
                return code


RESERVED_DEVICES = {"DEV-88A1", "DEV-8821"}


def _person_name(rng: np.random.Generator) -> str:
    return f"{rng.choice(_GIVEN)} {rng.choice(_FAMILY)}"


def _shop_name(rng: np.random.Generator, category: str) -> str:
    return f"{rng.choice(_SHOP_A)} {rng.choice(_SHOP_B)} ({category})"


def build_world(
    rng: np.random.Generator, *, n_customers: int, n_merchants: int, n_agents: int, days: int
) -> World:
    n_retail = n_customers - n_merchants - n_agents
    shares = np.array([p.population_share for p in PERSONAS.values()])
    shares = shares / shares.sum()
    retail_personas = rng.choice(list(PERSONAS), size=n_retail, p=shares)
    persona_list = ["merchant"] * n_merchants + ["agent"] * n_agents + list(retail_personas)
    rng.shuffle(persona_list)

    # Force the demo-narrative customers onto suitable personas.
    order = {DEMO_HERO: 24, DEMO_ATO_CLEAN: 2310, DEMO_VELOCITY: 1048}
    persona_list[order[DEMO_HERO]] = "employee"
    persona_list[order[DEMO_ATO_CLEAN]] = "employee"
    persona_list[order[DEMO_VELOCITY]] = "freelancer"

    loc_codes = [c for c, *_ in geo.LOCATIONS]
    loc_w = np.array([w for *_, w in geo.LOCATIONS])

    wallet_nums = rng.permutation(np.arange(1000, 1000 + n_customers))
    # Reserve the narrative wallet numbers.
    for num, cust_code in ((HERO_WALLET_NUM, DEMO_HERO),):
        i = order[cust_code]
        j = int(np.where(wallet_nums == num)[0][0])
        wallet_nums[i], wallet_nums[j] = wallet_nums[j], wallet_nums[i]

    customers: list[Customer] = []
    for i in range(n_customers):
        pname = persona_list[i]
        persona: Persona = ALL_PERSONAS[pname]
        mult = float(np.exp(rng.normal(0, 0.45)))
        cust = Customer(
            idx=i,
            code=f"CUST-{1000 + i}",
            name=_person_name(rng),
            persona=pname,
            wallet_type={"merchant": "merchant", "agent": "agent"}.get(pname, "customer"),
            home_loc=str(rng.choice(loc_codes, p=loc_w)),
            median=persona.median_amount * float(np.exp(rng.normal(0, 0.4))),
            sigma=persona.amount_sigma * float(rng.uniform(0.85, 1.15)),
            rate=persona.rate_per_day * mult,
            kyc_level=str(rng.choice(["basic", "standard", "full"], p=[0.25, 0.55, 0.2])),
            opened_at_s=-float(rng.uniform(30, 900)) * DAY_S,
            wallet_num=int(wallet_nums[i]),
        )
        customers.append(cust)

    world = World(
        rng=rng, days=days, customers=customers, devices={}, merchants={}, agents=[],
        regular_merchants=[], utility_billers=[], telecom_billers=[], retail=[],
        code_to_idx={c.code: c.idx for c in customers},
    )

    # Merchant / agent / retail registries
    cat_names = [c for c, _ in MERCHANT_CATEGORIES]
    cat_p = np.array([p for _, p in MERCHANT_CATEGORIES])
    cat_p = cat_p / cat_p.sum()
    for c in customers:
        if c.persona == "merchant":
            cat = str(rng.choice(cat_names, p=cat_p))
            c.merchant_category = cat
            c.name = _shop_name(rng, cat)
            world.merchants[c.idx] = {
                "code": f"MER-{1000 + len(world.merchants)}", "name": c.name, "category": cat,
            }
            if cat == "Utility":
                world.utility_billers.append(c.idx)
            elif cat == "Telecom":
                world.telecom_billers.append(c.idx)
            else:
                world.regular_merchants.append(c.idx)
        elif c.persona == "agent":
            world.agents.append(c.idx)
            c.name = f"Agent Point {c.wallet_num}"
        else:
            world.retail.append(c.idx)

    assert world.utility_billers and world.telecom_billers, "Population too small for billers"

    _assign_devices_and_locations(world)
    _assign_recipient_pools(world)
    _apply_hero_overrides(world, order)
    return world


def _assign_devices_and_locations(world: World) -> None:
    rng = world.rng
    for c in world.customers:
        persona = ALL_PERSONAS[c.persona]
        n_dev = 1 + int(rng.random() < persona.extra_devices_prob) + int(rng.random() < 0.04)
        for _ in range(n_dev):
            code = world.new_device_code(RESERVED_DEVICES)
            world.add_device(code, first_seen_s=-float(rng.uniform(20, 800)) * DAY_S)
            c.devices.append(code)
        c.locs = [c.home_loc]
        if rng.random() < 0.35:
            c.locs.append(str(rng.choice(geo.nearby_codes(c.home_loc, 150.0))))
        if rng.random() < 0.08:
            c.locs.append(str(rng.choice(geo.nearby_codes(c.home_loc, 250.0))))
        c.hour_shift = [float(rng.normal(0, 1.2)) for _ in persona.hours]
    # A few devices are legitimately shared between household members.
    retail = world.retail
    for i in rng.choice(retail, size=int(0.03 * len(retail)), replace=False):
        other = int(rng.choice(retail))
        if other != i:
            world.customers[int(i)].devices.append(world.customers[other].devices[0])


def _zipf_pool(rng: np.random.Generator, candidates: list[int], size: int, exclude: int) -> list[int]:
    size = min(size, len(candidates) - 1)
    picks: list[int] = []
    while len(picks) < size:
        cand = int(rng.choice(candidates))
        if cand != exclude and cand not in picks:
            picks.append(cand)
    return picks


def _assign_recipient_pools(world: World) -> None:
    rng = world.rng
    retail = world.retail
    for c in world.customers:
        persona = ALL_PERSONAS[c.persona]
        lo, hi = persona.recipient_pool
        n_p2p = int(rng.integers(lo, hi + 1))
        c.pools["wallet_transfer"] = _zipf_pool(rng, retail, n_p2p, c.idx)
        c.pools["merchant_payment"] = _zipf_pool(
            rng, world.regular_merchants, int(rng.integers(2, 7)), c.idx
        )
        c.pools["cash_out"] = _zipf_pool(rng, world.agents, int(rng.integers(1, 3)), c.idx)
        c.pools["mobile_recharge"] = _zipf_pool(rng, world.telecom_billers, 1, c.idx)
        c.pools["bill_payment"] = _zipf_pool(rng, world.utility_billers, int(rng.integers(1, 4)), c.idx)


def _apply_hero_overrides(world: World, order: dict[str, int]) -> None:
    """Pin the demo customer's baseline to the documented narrative profile."""
    rng = world.rng
    hero = world.customers[order[DEMO_HERO]]
    hero.clean = True
    hero.median, hero.sigma, hero.rate = 1350.0, 0.50, 4.0
    hero.home_loc, hero.locs = "LOC-DHK", ["LOC-DHK"]
    hero.hour_shift = [0.0]
    hero.kyc_level = "full"
    hero.name = "Rafiq Ahmed"
    hero.opened_at_s = -float(400 * DAY_S)
    old = hero.devices
    code = "DEV-88A1"
    world.add_device(code, first_seen_s=-300 * DAY_S, platform="android")
    hero.devices = [code]
    del old
    hero.pools = {"wallet_transfer": _zipf_pool(rng, world.retail, 3, hero.idx)}
    # Dedicated persona behaviour handled in _gen_customer via `clean` flag.
    for key in (DEMO_ATO_CLEAN, DEMO_VELOCITY):
        c = world.customers[order[key]]
        c.clean = True
        c.home_loc = "LOC-DHK" if key == DEMO_ATO_CLEAN else "LOC-CTG"
        c.locs = [c.home_loc]
        c.rate = max(c.rate, 0.8)


# --------------------------------------------------------------------------------------
# Baseline transactions
# --------------------------------------------------------------------------------------
_RECHARGE_STEPS = np.array([50, 100, 150, 200, 300, 500])


def _hours(rng: np.random.Generator, c: Customer, n: int) -> np.ndarray:
    persona = ALL_PERSONAS[c.persona]
    if c.clean and c.code == DEMO_HERO:
        return np.clip(rng.normal(20.6, 1.3, n), 18.05, 23.6)
    weights = np.array([w for _, _, w in persona.hours])
    comp = rng.choice(len(persona.hours), size=n, p=weights / weights.sum())
    centres = np.array([h[0] for h in persona.hours]) + np.array(c.hour_shift)
    sds = np.array([h[1] for h in persona.hours])
    h = rng.normal(centres[comp], sds[comp])
    noise = rng.random(n) < (0.0 if c.clean else 0.04)
    h[noise] = rng.uniform(0, 24, noise.sum())
    return np.mod(h, 24.0)


def _amounts(rng: np.random.Generator, c: Customer, types: np.ndarray) -> np.ndarray:
    base = np.array([c.median * TYPE_AMOUNT_FACTOR[t] for t in types])
    amt = base * np.exp(rng.normal(0, c.sigma, len(types)))
    recharge = types == "mobile_recharge"
    if recharge.any():
        amt[recharge] = rng.choice(_RECHARGE_STEPS, recharge.sum())
    amt = np.clip(amt, 10, 250_000)
    return np.where(amt >= 100, np.round(amt / 10) * 10, np.round(amt))


def generate_baseline(world: World, *, target_total: int | None = None) -> None:
    """Populate ``world.txns`` with legitimate activity, plus labelled benign variations."""
    rng = world.rng
    scale = 1.0
    if target_total:
        expected = sum(c.rate * world.days for c in world.customers)
        scale = target_total / expected
    for c in world.customers:
        _gen_customer(world, c, scale)


def _gen_customer(world: World, c: Customer, scale: float) -> None:
    rng = world.rng
    persona = ALL_PERSONAS[c.persona]
    n = int(rng.poisson(c.rate * world.days * scale))
    if n == 0:
        return

    day = rng.integers(0, world.days, n)
    hour = _hours(rng, c, n)
    t = np.sort(day * DAY_S + hour * 3600 + rng.uniform(0, 3600 / 2, n))
    t = np.minimum(t, world.horizon_s - 1)

    if c.persona == "agent":
        types = np.array(["cash_in"] * n)
    elif c.clean and c.code == DEMO_HERO:
        types = np.array(["wallet_transfer"] * n)
    else:
        keys = list(persona.type_probs)
        p = np.array([persona.type_probs[k] for k in keys])
        types = rng.choice(keys, size=n, p=p / p.sum())
    amounts = _amounts(rng, c, types)

    # --- benign variations ------------------------------------------------------
    tags: list[str | None] = [None] * n
    device_for = np.array([c.devices[0]] * n, dtype=object)
    if len(c.devices) > 1:
        sec = rng.random(n) < 0.15
        device_for[sec] = rng.choice(c.devices[1:], sec.sum())
    loc_for = np.array([c.locs[0]] * n, dtype=object)
    if len(c.locs) > 1:
        other = rng.random(n) < 0.2
        loc_for[other] = rng.choice(c.locs[1:], other.sum())

    if not c.clean and n >= 12:
        if rng.random() < 0.025:                              # adopts a new phone
            switch = float(rng.integers(10, world.days - 5)) * DAY_S
            new_dev = world.new_device_code(RESERVED_DEVICES)
            world.add_device(new_dev, first_seen_s=switch - 600)
            after = t >= switch
            device_for[after] = new_dev
            for k in np.where((t >= switch) & (t < switch + 72 * 3600))[0]:
                tags[k] = "new_device"
        if rng.random() < 0.04:                               # legitimate trip
            start = float(rng.integers(5, world.days - 6)) * DAY_S
            trip = str(rng.choice(geo.far_codes(c.home_loc, 120.0)))
            mask = (t >= start) & (t < start + rng.integers(2, 5) * DAY_S)
            loc_for[mask] = trip
            for k in np.where(mask)[0]:
                tags[k] = "travel"
        big = rng.random(n) < 0.015                           # rent / large purchase
        amounts[big] = np.round(amounts[big] * rng.uniform(4, 9, big.sum()) / 10) * 10
        for k in np.where(big)[0]:
            tags[k] = tags[k] or "large_payment"

    recipient = np.zeros(n, dtype=int)
    merchant = np.full(n, -1)
    pools = {k: list(v) for k, v in c.pools.items()}
    new_p = 0.0 if c.clean else persona.new_recipient_prob
    for k in range(n):
        ty = str(types[k])
        if ty == "cash_in":
            recipient[k] = int(rng.choice(world.retail))
            continue
        pool = pools.get(ty) or pools["wallet_transfer"]
        if ty in ("wallet_transfer", "merchant_payment") and rng.random() < new_p:
            universe = world.retail if ty == "wallet_transfer" else world.regular_merchants
            cand = int(rng.choice(universe))
            if cand != c.idx:
                pool.append(cand)
                pools[ty] = pool
                recipient[k] = cand
                if ty == "wallet_transfer":
                    tags[k] = tags[k] or "new_recipient"
            else:
                recipient[k] = pool[0]
        else:
            w = 1.0 / np.arange(1, len(pool) + 1)
            recipient[k] = pool[int(rng.choice(len(pool), p=w / w.sum()))]
        if world.customers[recipient[k]].persona == "merchant":
            merchant[k] = recipient[k]

    wallet_idx = c.idx
    is_agent_sender = c.persona == "agent"
    for k in range(n):
        night = int(((t[k] % DAY_S) // 3600)) < 6
        variant = tags[k] or ("night_activity" if night else None)
        gt = (
            {"scenario_type": "benign_variation", "variant": variant, "is_anomalous": False}
            if variant else None
        )
        world.txns.append({
            "t": float(t[k]),
            "customer": c.idx,
            "wallet": wallet_idx,
            "recipient": int(recipient[k]),
            "merchant": int(merchant[k]),
            "device": str(device_for[k]),
            "location": str(loc_for[k]),
            "type": str(types[k]),
            "amount": float(amounts[k]),
            "gt": gt,
            "lead_s": None,
            "failed": 0,
        })
    del is_agent_sender
