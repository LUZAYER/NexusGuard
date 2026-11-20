"""Seed roles, permissions, demo users and baseline configuration."""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.core.config import get_settings
from backend.core.permissions import PERMISSIONS, ROLE_DEFINITIONS, SEED_USERS
from backend.core.security import hash_password
from backend.models import Permission, RoleModel, User


def seed_access_control(db: Session) -> None:
    perms: dict[str, Permission] = {p.code: p for p in db.scalars(select(Permission))}
    for code, description in PERMISSIONS.items():
        if code not in perms:
            perms[code] = Permission(code=code, description=description)
            db.add(perms[code])
    db.flush()

    roles: dict[str, RoleModel] = {r.name: r for r in db.scalars(select(RoleModel))}
    for name, spec in ROLE_DEFINITIONS.items():
        role = roles.get(str(name))
        if role is None:
            role = RoleModel(name=str(name), display_name=spec["display_name"], description=spec["description"])
            db.add(role)
            roles[str(name)] = role
        role.permissions = [perms[c] for c in sorted(spec["permissions"])]
    db.flush()

    password_hash = hash_password(get_settings().seed_user_password)
    for email, full_name, role_name in SEED_USERS:
        existing_user = db.scalar(select(User).where((User.email == email) | (User.full_name == full_name)))
        if not existing_user:
            db.add(User(email=email, full_name=full_name, password_hash=password_hash,
                        role_id=roles[str(role_name)].id))
        else:
            existing_user.email = email
            existing_user.full_name = full_name
            existing_user.role_id = roles[str(role_name)].id
    db.commit()
