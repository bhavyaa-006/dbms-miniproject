from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os
from urllib.parse import urlparse, urlunparse, parse_qsl, urlencode

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
	raise RuntimeError("DATABASE_URL is not set. Configure your Neon connection string in the deployment environment.")


def _with_sslmode_require(database_url: str) -> str:
	parsed = urlparse(database_url)
	if parsed.scheme not in {"postgresql", "postgres"}:
		return database_url

	query = dict(parse_qsl(parsed.query, keep_blank_values=True))
	query.setdefault("sslmode", "require")
	return urlunparse(parsed._replace(query=urlencode(query)))

engine = create_engine(_with_sslmode_require(DATABASE_URL), pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
