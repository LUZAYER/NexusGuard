"""CLI: create schema, seed access control, generate and load the synthetic dataset.

    python -m data.generator.seed                # full-scale dataset (cached after first run)
    python -m data.generator.seed --regenerate   # ignore the cache
    python -m data.generator.seed --small        # quick development dataset
"""
from __future__ import annotations

import argparse
import logging
import pickle
import time
from datetime import datetime

from backend.core.config import get_settings
from backend.core.logging import configure_logging
from backend.database.seed import seed_access_control
from backend.database.session import get_engine, session_scope
from backend.models import Base
from data.generator.build import generate_dataset
from data.generator.loader import load_dataset
from ml.config import REPO_ROOT

log = logging.getLogger("seed")
CACHE_DIR = REPO_ROOT / "data" / "samples"


def get_dataset(seed: int, small: bool, regenerate: bool):
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache = CACHE_DIR / f"dataset_{'small' if small else 'full'}_{seed}.pkl"
    if cache.exists() and not regenerate:
        log.info("loading cached dataset %s", cache.name)
        return pickle.loads(cache.read_bytes())
    as_of = get_settings().data_as_of.replace(tzinfo=None)
    kwargs = dict(seed=seed, as_of_local=as_of)
    if small:
        # Population must still contain the narrative customers/wallets, so keep >= 3,000 customers.
        kwargs.update(n_customers=3000, n_merchants=300, n_agents=40, target_baseline_txns=32_000,
                      n_ato=60, n_mule=24, n_velocity=30, n_behavior=80, n_device=10)
    t0 = time.time()
    ds = generate_dataset(**kwargs)
    log.info("generated %s transactions in %.0fs", f"{len(ds.transactions):,}", time.time() - t0)
    cache.write_bytes(pickle.dumps(ds))
    return ds


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--seed", type=int, default=20261007)
    parser.add_argument("--small", action="store_true")
    parser.add_argument("--regenerate", action="store_true")
    args = parser.parse_args()
    configure_logging("INFO")
    logging.getLogger("seed").setLevel(logging.INFO)

    engine = get_engine()
    Base.metadata.create_all(engine)
    with session_scope() as db:
        seed_access_control(db)
    ds = get_dataset(args.seed, args.small, args.regenerate)
    counts = load_dataset(engine, ds)
    print(counts)
    print("Seeded at", datetime.now().isoformat(timespec="seconds"))


if __name__ == "__main__":
    main()
