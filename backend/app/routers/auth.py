from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
import logging
from .. import models, schemas
from ..dependencies import get_db, get_current_user
from ..security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = logging.getLogger(__name__)


def _create_user_token(user: models.User) -> str:
    return create_access_token({"sub": user.id, "role": user.role.value})


@router.post("/register", response_model=schemas.Token, status_code=201)
def register(payload: schemas.UserRegister, db: Session = Depends(get_db)):
    """Register a new student account."""
    email = payload.email.lower().strip()
    name = payload.name.strip()

    logger.info("Registration request received for email=%s", email)

    existing = db.query(models.User).filter(models.User.email == email).first()
    if existing:
        logger.warning("Duplicate registration attempt for email=%s", email)
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    try:
        user = models.User(
            name=name,
            email=email,
            password_hash=hash_password(payload.password),
            role=models.Role.STUDENT,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        token = _create_user_token(user)
        logger.info("User registered successfully id=%s email=%s", user.id, user.email)
        return {"access_token": token, "token_type": "bearer", "user": user}
    except IntegrityError:
        db.rollback()
        logger.warning("Integrity error while registering email=%s", email)
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    except Exception as exc:
        db.rollback()
        logger.exception("Registration failed for email=%s", email)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Registration failed") from exc


@router.post("/login", response_model=schemas.Token)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    """Login and receive JWT token."""
    email = payload.email.lower().strip()
    logger.info("Login request received for email=%s", email)
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        logger.warning("Invalid login attempt for email=%s", email)
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = _create_user_token(user)
    logger.info("Login successful for user_id=%s email=%s", user.id, user.email)
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    """Get currently authenticated user."""
    return current_user
