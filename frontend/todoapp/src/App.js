import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTaskText, setEditTaskText] = useState({ text: '', status: '' });
  const [filter, setFilter] = useState('All');

  const apiUrl = process.env.REACT_APP_API_URL;

  const fetchTasks = useCallback(async () => {
    try {
      const response = await axios.get(apiUrl);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async () => {
    if (!newTask) return;
    const newTaskObj = { id: Date.now(), task: newTask, status: 'in-progress' };
    setTasks([...tasks, newTaskObj]);
    setNewTask('');
    try {
      await axios.post(`${apiUrl}/todos/`, { task: newTask, status: 'in-progress' });
      fetchTasks();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const startEditing = (id, taskText, status) => {
    setEditTaskId(id);
    setEditTaskText({ text: taskText, status });
  };

  const saveEditedTask = async (id) => {
    if (!editTaskText.text) return;
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, task: editTaskText.text, status: editTaskText.status } : task
    );
    setTasks(updatedTasks);
    setEditTaskId(null);
    setEditTaskText({ text: '', status: '' });
    try {
      await axios.put(`${apiUrl}/todos/${id}`, { task: editTaskText.text, status: editTaskText.status });
      fetchTasks();
    } catch (error) {
      console.error('Error editing task:', error);
    }
  };

  const deleteTask = async (id) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    try {
      await axios.delete(`${apiUrl}/todos/${id}`);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const deleteAllTasks = async () => {
    setTasks([]);
    try {
      await axios.delete(`${apiUrl}/todos/`);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting all tasks:', error);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const updatedStatus = currentStatus === 'in-progress' ? 'completed' : 'in-progress';

    const taskToUpdate = tasks.find((task) => task.id === id);

    if (!taskToUpdate) {
      console.error('Task not found');
      return;
    }

    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, status: updatedStatus } : task
    );
    setTasks(updatedTasks);

    try {
      await axios.put(`${apiUrl}/todos/${id}`, {
        task: taskToUpdate.task,
        status: updatedStatus,
      });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'All') return true;
    return task.status === filter.toLowerCase().replace(' ', '-');
  });

  return (
    <div className="container">
      <h1 className="title">Todo List</h1>
      <div className="inputContainer">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a new task"
          className="input"
        />
        <button onClick={addTask} className="addButton">Add Task</button>
      </div>
      <div className="filterContainer">
        <button onClick={() => setFilter('All')} className={`filterButton ${filter === 'All' ? 'active' : ''}`}>All</button>
        <button onClick={() => setFilter('Completed')} className={`filterButton ${filter === 'Completed' ? 'active' : ''}`}>Completed</button>
        <button onClick={() => setFilter('In Progress')} className={`filterButton ${filter === 'In Progress' ? 'active' : ''}`}>In Progress</button>
      </div>
      <ul className="taskList">
        {filteredTasks.map((task) => (
          <li key={task.id} className="taskItem">
            {editTaskId === task.id ? (
              <>
                <input
                  type="text"
                  value={editTaskText.text}
                  onChange={(e) => setEditTaskText({ ...editTaskText, text: e.target.value })}
                  className="input"
                />
                <select
                  value={editTaskText.status}
                  onChange={(e) => setEditTaskText({ ...editTaskText, status: e.target.value })}
                  className="select"
                >
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <button onClick={() => saveEditedTask(task.id)} className="saveButton">Save</button>
              </>
            ) : (
              <>
                <span className="taskText">{task.task} - {task.status}</span>
                <button onClick={() => startEditing(task.id, task.task, task.status)} className="editButton">Edit</button>
                <button onClick={() => deleteTask(task.id)} className="deleteButton">Delete</button>
                <button onClick={() => toggleStatus(task.id, task.status)} className="statusButton">
                  {task.status === 'in-progress' ? 'Mark as Completed' : 'Mark as In Progress'}
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
      <button onClick={deleteAllTasks} className="clearAllButton">Clear All Tasks</button>
      <div className="footer">
        <p>&copy; 2023 Todo App. <button className="linkButton" onClick={() => alert('Help link clicked!')}>Help</button></p>
      </div>
    </div>
  );
};

export default App;