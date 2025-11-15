#!/usr/bin/env python3
"""
Y-IT Project Todo Processor
Manages persistent project todo list with urgency scale and progress tracking
"""

import json
import sys
from datetime import datetime
from pathlib import Path

# Config
DATA_FILE = Path(__file__).parent.parent / "data" / "project-todo.json"

class ProjectTodoAgent:
    def __init__(self):
        self.todos = self.load_todos()

    def load_todos(self):
        """Load todos from persistent JSON storage"""
        if DATA_FILE.exists():
            with open(DATA_FILE, 'r') as f:
                return json.load(f)
        return {"todos": [], "lastUpdated": datetime.now().isoformat()}

    def save_todos(self):
        """Save todos to persistent JSON storage"""
        self.todos["lastUpdated"] = datetime.now().isoformat()
        with open(DATA_FILE, 'w') as f:
            json.dump(self.todos, f, indent=2)

    def display_list(self):
        """Display formatted todo list with urgency and progress"""
        print("\n" + "="*80)
        print("Y-IT NANO-BOOK ECOSYSTEM - PROJECT TODO LIST")
        print(f"Last Updated: {self.todos.get('lastUpdated', 'N/A')}")
        print("="*80 + "\n")

        # Group by urgency
        urgency_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
        urgency_colors = {
            "CRITICAL": "🔴",
            "HIGH": "🟠",
            "MEDIUM": "🟡",
            "LOW": "🟢"
        }

        todos_by_urgency = {}
        for todo in self.todos.get("todos", []):
            urg = todo.get("urgency", "MEDIUM")
            if urg not in todos_by_urgency:
                todos_by_urgency[urg] = []
            todos_by_urgency[urg].append(todo)

        # Display by urgency
        for urgency in sorted(urgency_order.keys(), key=lambda x: urgency_order[x]):
            if urgency in todos_by_urgency:
                print(f"\n[{urgency} PRIORITY]")
                print(f"{urgency_colors[urgency]} {'─'*76}\n")

                for todo in todos_by_urgency[urgency]:
                    self._display_todo_item(todo)
                    print()

        self._display_summary()

    def _display_todo_item(self, todo):
        """Display single todo item with progress and details"""
        progress = todo.get("progress", 0)
        status_icon = "⏳" if todo["status"] == "in-progress" else "⬜" if todo["status"] == "pending" else "✅"

        # Progress bar
        bar_length = 20
        filled = int(bar_length * progress / 100)
        progress_bar = "█" * filled + "░" * (bar_length - filled)

        print(f"{status_icon} {todo['title']}")
        print(f"   [{progress_bar}] {progress}% progress")
        print(f"   Due: {todo.get('dueDate', 'N/A')} | Status: {todo['status'].upper()}")

        # Subtasks preview
        subtasks = todo.get("subtasks", [])
        if subtasks:
            completed = len([s for s in subtasks if isinstance(s, dict) and s.get('completed')])
            print(f"   Subtasks: ({completed}/{len(subtasks)})")
            for i, task in enumerate(subtasks[:2], 1):
                prefix = "✓" if isinstance(task, dict) and task.get('completed') else "•"
                task_text = task if isinstance(task, str) else task.get('title', '')
                print(f"     {prefix} {task_text}")
            if len(subtasks) > 2:
                print(f"     ... +{len(subtasks)-2} more subtasks")

        print(f"   → Type: `/project-todo inquiry {todo['id']}` for full details")

    def _display_summary(self):
        """Display status summary"""
        statuses = {"pending": 0, "in-progress": 0, "completed": 0}
        total_progress = 0

        for todo in self.todos.get("todos", []):
            status = todo.get("status", "pending")
            statuses[status] = statuses.get(status, 0) + 1
            total_progress += todo.get("progress", 0)

        total_todos = sum(statuses.values())
        avg_progress = total_progress / total_todos if total_todos > 0 else 0

        print("\n" + "─"*80)
        print("SUMMARY")
        print("─"*80)
        print(f"Pending:        {statuses['pending']} items ({avg_progress:.0f}% avg progress)")
        print(f"In Progress:    {statuses['in-progress']} items")
        print(f"Completed:      {statuses['completed']} items")
        print(f"\nTotal Progress: {avg_progress:.1f}%")

    def display_inquiry(self, task_id):
        """Display detailed info about specific task"""
        todo = self._find_todo(task_id)
        if not todo:
            print(f"❌ Task '{task_id}' not found")
            return

        print("\n" + "="*80)
        print(f"TASK DETAILS: {todo['title']}")
        print("="*80 + "\n")

        print(f"ID: {todo['id']}")
        print(f"Urgency: {todo['urgency']}")
        print(f"Status: {todo['status'].upper()}")
        print(f"Progress: {todo['progress']}%")
        print(f"Due Date: {todo.get('dueDate', 'N/A')}\n")

        print("Description:")
        print(f"  {todo.get('details', 'N/A')}\n")

        print("Subtasks:")
        for i, task in enumerate(todo.get('subtasks', []), 1):
            checkbox = "☑" if isinstance(task, dict) and task.get('completed') else "☐"
            task_text = task if isinstance(task, str) else task.get('title', '')
            print(f"  {checkbox} {i}. {task_text}")

        print("\n" + "="*80)

    def update_task(self, task_id, progress, status, notes):
        """Update task progress and status"""
        todo = self._find_todo(task_id)
        if not todo:
            print(f"❌ Task '{task_id}' not found")
            return

        old_progress = todo.get("progress", 0)
        todo["progress"] = int(progress)
        todo["status"] = status.lower()

        if notes:
            if "notes" not in todo:
                todo["notes"] = []
            todo["notes"].append({
                "timestamp": datetime.now().isoformat(),
                "note": notes
            })

        self.save_todos()

        print(f"✅ Updated: {todo['title']}")
        print(f"   Progress: {old_progress}% → {progress}%")
        print(f"   Status: {status}")
        if notes:
            print(f"   Notes: {notes}")

    def complete_task(self, task_id):
        """Mark task as completed"""
        todo = self._find_todo(task_id)
        if not todo:
            print(f"❌ Task '{task_id}' not found")
            return

        todo["status"] = "completed"
        todo["progress"] = 100
        todo["completedDate"] = datetime.now().isoformat()

        self.save_todos()
        print(f"✅ Completed: {todo['title']}")

    def add_task(self, title, urgency, due_date, details):
        """Add new task to list"""
        new_id = f"custom-{len(self.todos.get('todos', []))+1}"

        new_todo = {
            "id": new_id,
            "title": title,
            "urgency": urgency.upper(),
            "progress": 0,
            "status": "pending",
            "subtasks": [],
            "dueDate": due_date,
            "details": details,
            "createdDate": datetime.now().isoformat()
        }

        self.todos.setdefault("todos", []).append(new_todo)
        self.save_todos()

        print(f"✅ Added new task: {title}")
        print(f"   ID: {new_id}")
        print(f"   Urgency: {urgency}")
        print(f"   Due: {due_date}")

    def _find_todo(self, task_id):
        """Find todo by ID"""
        for todo in self.todos.get("todos", []):
            if todo["id"] == task_id:
                return todo
        return None


def main():
    agent = ProjectTodoAgent()

    if len(sys.argv) < 2:
        # Display full list
        agent.display_list()

    elif sys.argv[1] == "inquiry" and len(sys.argv) > 2:
        # Show task details
        agent.display_inquiry(sys.argv[2])

    elif sys.argv[1] == "update" and len(sys.argv) > 4:
        # Update task: task_id progress status [notes]
        task_id = sys.argv[2]
        progress = sys.argv[3]
        status = sys.argv[4]
        notes = " ".join(sys.argv[5:]) if len(sys.argv) > 5 else ""
        agent.update_task(task_id, progress, status, notes)

    elif sys.argv[1] == "complete" and len(sys.argv) > 2:
        # Complete task
        agent.complete_task(sys.argv[2])

    elif sys.argv[1] == "add" and len(sys.argv) > 5:
        # Add task: title urgency due_date details
        title = sys.argv[2]
        urgency = sys.argv[3]
        due_date = sys.argv[4]
        details = " ".join(sys.argv[5:])
        agent.add_task(title, urgency, due_date, details)

    else:
        print("Usage:")
        print("  project-todo-processor.py              # Display full list")
        print("  project-todo-processor.py inquiry TASK_ID")
        print("  project-todo-processor.py update TASK_ID PROGRESS STATUS [NOTES]")
        print("  project-todo-processor.py complete TASK_ID")
        print("  project-todo-processor.py add TITLE URGENCY DUE_DATE DETAILS")


if __name__ == "__main__":
    main()
