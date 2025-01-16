from sqlalchemy import Column, Integer, String
from db import Base

class Todo(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)
    task = Column(String, nullable=False)
    status = Column(String, default="ongoing")
