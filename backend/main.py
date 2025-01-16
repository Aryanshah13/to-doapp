from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.sql import text
from typing import List
from db import engine, Base, get_db
from models import Todo
from pydantic import BaseModel

app = FastAPI()

# Set up CORS
origins = [
    "http://localhost:3000",  # React server
    "https://todofrontend-kj40.onrender.com",  # my production domain
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic schemas
class TodoBase(BaseModel):
    task: str
    status: str = "ongoing"

class TodoCreate(TodoBase):
    pass

class TodoUpdate(BaseModel):
    task: str = None
    status: str = None

class TodoResponse(TodoBase):
    id: int

    class Config:
        orm_mode = True

# Create the database tables on startup
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Create a new task
@app.post("/todos/", response_model=TodoResponse)
async def create_task(todo: TodoCreate, db: AsyncSession = Depends(get_db)):
    new_todo = Todo(task=todo.task, status=todo.status)
    db.add(new_todo)
    await db.commit()
    await db.refresh(new_todo)
    return new_todo

# Get all tasks
@app.get("/todos/", response_model=List[TodoResponse])
async def get_tasks(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Todo))
    return result.scalars().all()

# Update a task
@app.put("/todos/{task_id}", response_model=TodoResponse)
async def update_task(task_id: int, todo: TodoUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Todo).where(Todo.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if todo.task is not None:
        task.task = todo.task
    if todo.status is not None:
        task.status = todo.status
    await db.commit()
    await db.refresh(task)
    return task

# Delete a task
@app.delete("/todos/{task_id}")
async def delete_task(task_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Todo).where(Todo.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    await db.delete(task)
    await db.commit()
    return {"message": "Task deleted successfully"}

# Delete all tasks
@app.delete("/todos/")
async def delete_all_tasks(db: AsyncSession = Depends(get_db)):
    await db.execute(text("DELETE FROM todos"))
    await db.commit()
    return {"message": "All tasks deleted successfully"}