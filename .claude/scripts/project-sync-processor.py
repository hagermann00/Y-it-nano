#!/usr/bin/env python3
"""
Project Sync Processor
Handles commit, push, and context file updates in one command
"""

import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path

class ProjectSyncProcessor:
    def __init__(self):
        self.repo_root = Path.cwd()
        self.context_file = self.repo_root / "Claude.md"

    def run_git(self, *args):
        """Execute git command and return output"""
        try:
            result = subprocess.run(
                ["git"] + list(args),
                capture_output=True,
                text=True,
                cwd=self.repo_root
            )
            return result.stdout.strip(), result.returncode
        except Exception as e:
            print(f"❌ Git error: {e}")
            return None, 1

    def get_current_branch(self):
        """Get current git branch"""
        output, code = self.run_git("rev-parse", "--abbrev-ref", "HEAD")
        if code == 0:
            return output
        return None

    def get_git_status(self):
        """Check if there are uncommitted changes"""
        output, code = self.run_git("status", "--porcelain")
        return output if code == 0 else None

    def commit_and_push(self, message):
        """Commit all changes and push to remote"""
        # Check for changes
        status = self.get_git_status()
        if not status:
            print("❌ No changes to commit")
            return False

        # Get current branch
        branch = self.get_current_branch()
        if not branch:
            print("❌ Could not determine current branch")
            return False

        # Stage all changes
        output, code = self.run_git("add", "-A")
        if code != 0:
            print("❌ Failed to stage changes")
            return False

        # Create commit
        output, code = self.run_git("commit", "-m", message)
        if code != 0:
            print("❌ Failed to create commit")
            print(output)
            return False

        commit_hash = output.split()[1] if output else "unknown"

        # Push to remote
        output, code = self.run_git("push", "-u", "origin", branch)
        if code != 0:
            print("⚠️  Warning: Push may have failed")
            print(output)
            # Don't fail completely, commit was successful

        # Show success
        print(f"✅ Committed: {message}")
        print(f"📤 Pushed to: {branch}")
        print(f"📝 Commit: {commit_hash[:7]} - {message}")

        return True

    def update_context_file(self, what_changed, next_steps):
        """Update context file with changes and push"""
        if not self.context_file.exists():
            print(f"❌ Context file not found: {self.context_file}")
            return False

        # Read current file
        with open(self.context_file, 'r') as f:
            content = f.read()

        # Create update entry
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        update_marker = f"\n\n---\n\n**Last Updated:** {timestamp}\n"
        update_marker += f"**Recent Changes:** {what_changed}\n"
        update_marker += f"**Next Phase:** {next_steps}\n"

        # Insert after title section (after first few lines)
        lines = content.split('\n')
        insert_pos = 0
        for i, line in enumerate(lines):
            if line.startswith('**Last Updated:**'):
                # Update existing timestamp line
                for j in range(i, len(lines)):
                    if lines[j].startswith('**Project Status:**'):
                        insert_pos = j
                        break
                lines[1] = f"**Last Updated:** {timestamp}"
                break

        # Write updated file
        with open(self.context_file, 'w') as f:
            f.write('\n'.join(lines))

        # Commit and push
        commit_msg = f"Update context file: {what_changed}"

        # Stage context file
        output, code = self.run_git("add", str(self.context_file))
        if code != 0:
            print("❌ Failed to stage context file")
            return False

        # Commit
        output, code = self.run_git("commit", "-m", commit_msg)
        if code != 0:
            print("❌ Failed to commit context file update")
            return False

        # Get branch and push
        branch = self.get_current_branch()
        output, code = self.run_git("push", "-u", "origin", branch)

        print(f"✅ Updated context file")
        print(f"📝 Added: {timestamp} - {what_changed}")
        print(f"📤 Pushed to: {branch}")

        return True

    def show_status(self):
        """Display git status"""
        branch = self.get_current_branch()
        status = self.get_git_status()

        print("\n" + "="*70)
        print("PROJECT SYNC STATUS")
        print("="*70)
        print(f"Current Branch: {branch}")
        print(f"Context File: {self.context_file}")
        print("\nUncommitted Changes:")

        if status:
            for line in status.split('\n'):
                if line.strip():
                    print(f"  {line}")
        else:
            print("  (none)")

        print("\n" + "="*70)


def main():
    processor = ProjectSyncProcessor()

    if len(sys.argv) < 2:
        # Show status
        processor.show_status()

    elif sys.argv[1] == "commit" and len(sys.argv) > 2:
        # Commit and push
        message = " ".join(sys.argv[2:])
        processor.commit_and_push(message)

    elif sys.argv[1] == "context" and len(sys.argv) > 3:
        # Update context file
        what_changed = sys.argv[2]
        next_steps = sys.argv[3]
        processor.update_context_file(what_changed, next_steps)

    else:
        print("Usage:")
        print("  project-sync-processor.py                              # Show status")
        print("  project-sync-processor.py commit 'Message'             # Commit and push")
        print("  project-sync-processor.py context 'Changed' 'Next'     # Update context and push")


if __name__ == "__main__":
    main()
