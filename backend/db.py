from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Replace with your actual DATABASE_URL
DATABASE_URL = "postgresql+asyncpg:postgresql://todouser:tZY4odfkTxYM6Rcty6PRSONwLDR4EyUI@dpg-cvgopdiqgecs73f060l0-a.oregon-postgres.render.com/todo_mnwq"


# Create the async engine
engine = create_async_engine(DATABASE_URL, echo=True)

# Configure the async session
SessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

# Base class for models
Base = declarative_base()

# Dependency for providing DB session
async def get_db():
    async with SessionLocal() as session:
        yield session
