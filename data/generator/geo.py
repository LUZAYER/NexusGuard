"""Geography for the synthetic Bangladesh-flavoured environment (city-level only)."""
from __future__ import annotations

import math

# code, name, division, latitude, longitude, population weight
LOCATIONS: list[tuple[str, str, str, float, float, float]] = [
    ("LOC-DHK", "Dhaka", "Dhaka", 23.8103, 90.4125, 0.36),
    ("LOC-CTG", "Chattogram", "Chattogram", 22.3569, 91.7832, 0.14),
    ("LOC-GZP", "Gazipur", "Dhaka", 23.9999, 90.4203, 0.07),
    ("LOC-NRG", "Narayanganj", "Dhaka", 23.6238, 90.5000, 0.06),
    ("LOC-SYL", "Sylhet", "Sylhet", 24.8949, 91.8687, 0.05),
    ("LOC-RAJ", "Rajshahi", "Rajshahi", 24.3745, 88.6042, 0.05),
    ("LOC-KHL", "Khulna", "Khulna", 22.8456, 89.5403, 0.05),
    ("LOC-BAR", "Barishal", "Barishal", 22.7010, 90.3535, 0.03),
    ("LOC-RNG", "Rangpur", "Rangpur", 25.7439, 89.2752, 0.03),
    ("LOC-MYM", "Mymensingh", "Mymensingh", 24.7471, 90.4203, 0.04),
    ("LOC-CML", "Cumilla", "Chattogram", 23.4607, 91.1809, 0.04),
    ("LOC-CXB", "Cox's Bazar", "Chattogram", 21.4272, 92.0058, 0.02),
    ("LOC-BOG", "Bogura", "Rajshahi", 24.8465, 89.3776, 0.02),
    ("LOC-JSR", "Jashore", "Khulna", 23.1664, 89.2081, 0.02),
    ("LOC-DNJ", "Dinajpur", "Rangpur", 25.6217, 88.6354, 0.01),
    ("LOC-TNG", "Tangail", "Dhaka", 24.2513, 89.9167, 0.01),
]

_EARTH_RADIUS_KM = 6371.0088


def haversine_km(lat1, lon1, lat2, lon2):
    """Great-circle distance in km. Works on scalars and numpy arrays."""
    import numpy as np

    p1, p2 = np.radians(lat1), np.radians(lat2)
    dphi = p2 - p1
    dlmb = np.radians(lon2) - np.radians(lon1)
    a = np.sin(dphi / 2) ** 2 + np.cos(p1) * np.cos(p2) * np.sin(dlmb / 2) ** 2
    return 2 * _EARTH_RADIUS_KM * np.arcsin(np.sqrt(a))


def coords() -> dict[str, tuple[float, float]]:
    return {code: (lat, lon) for code, _, _, lat, lon, _ in LOCATIONS}


def nearby_codes(code: str, max_km: float = 120.0) -> list[str]:
    """Locations within ``max_km`` of ``code`` (excluding itself), nearest first."""
    c = coords()
    lat, lon = c[code]
    scored = [
        (float(haversine_km(lat, lon, la, lo)), other)
        for other, (la, lo) in c.items()
        if other != code
    ]
    return [o for d, o in sorted(scored) if d <= max_km] or [min(scored)[1]]


def far_codes(code: str, min_km: float = 150.0) -> list[str]:
    c = coords()
    lat, lon = c[code]
    far = [
        other
        for other, (la, lo) in c.items()
        if other != code and float(haversine_km(lat, lon, la, lo)) >= min_km
    ]
    return far or [o for o in c if o != code]


assert math.isclose(sum(w for *_, w in LOCATIONS), 1.0, abs_tol=1e-6)
