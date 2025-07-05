# 🔄 AutoPush - Git Automation Tool

Advanced Git automation script with dynamic branch detection and smart commit messages.

## 🌟 Features

- **🎯 Dynamic Main Branch Detection**: Automatically detects main, master, develop, or dev branches
- **🧠 Smart Commit Messages**: Generates meaningful commit messages based on file changes
- **🔀 Branch Merging**: Seamlessly merge feature branches to main
- **🧹 Branch Cleanup**: Optional branch deletion after merge
- **📊 Change Analysis**: Analyzes file types and change patterns
- **🔍 Status Display**: Beautiful status reporting with summaries

## 🚀 Quick Start

### Make Script Executable
```bash
chmod +x autopush.sh
```

### Basic Usage
```bash
# Auto-commit and push to current branch
./autopush.sh

# Commit with custom message
./autopush.sh "feat: add user authentication"

# Merge current branch to main
./autopush.sh --merge

# Merge with custom message
./autopush.sh --merge "release: version 2.1.0"
```

## 📋 Command Reference

### Syntax
```bash
./autopush.sh [OPTIONS] [COMMIT_MESSAGE]
```

### Options
| Option | Description | Example |
|--------|-------------|---------|
| `--merge` | Merge current branch to main/master | `./autopush.sh --merge` |
| `--main-branch BRANCH` | Specify target main branch | `./autopush.sh --main-branch develop --merge` |
| `--help`, `-h` | Show help message | `./autopush.sh --help` |

## 📝 Usage Examples

### 1. Regular Development Workflow

#### Auto-Generated Commit Messages
```bash
# Let the script generate smart commit messages
./autopush.sh

# Examples of auto-generated messages:
# "feat: Add 5 new files (tsx ts scss)"
# "update: Improve 3 files (js css)"
# "refactor: Major updates to 8 files (ts tsx)"
# "refactor: Remove 2 files and update 4 files"
# "chore: Project maintenance and cleanup"
```

#### Custom Commit Messages
```bash
# Specific feature
./autopush.sh "feat: implement user authentication system"

# Bug fixes
./autopush.sh "fix: resolve login redirect issue"

# Documentation updates
./autopush.sh "docs: update API documentation"

# Refactoring
./autopush.sh "refactor: optimize database queries"
```

### 2. Branch Management

#### Merge to Main Branch
```bash
# Merge current branch to automatically detected main branch
./autopush.sh --merge

# Merge with custom commit message
./autopush.sh --merge "release: version 2.1.0"

# Merge feature branch with description
./autopush.sh --merge "feat: complete user dashboard implementation"
```

#### Custom Main Branch
```bash
# Merge to develop branch
./autopush.sh --main-branch develop --merge

# Merge to staging branch
./autopush.sh --main-branch staging --merge "staging: deploy v2.1.0"

# Merge to custom branch
./autopush.sh --main-branch release/v2.1 --merge
```

### 3. Advanced Workflows

#### Feature Branch Workflow
```bash
# 1. Create and work on feature branch
git checkout -b feature/user-auth

# 2. Regular commits during development
./autopush.sh "feat: add login component"
./autopush.sh "feat: implement JWT authentication"
./autopush.sh "test: add authentication tests"

# 3. Final merge to main
./autopush.sh --merge "feat: complete user authentication system"
```

#### Hotfix Workflow
```bash
# 1. Create hotfix branch
git checkout -b hotfix/critical-bug

# 2. Fix and commit
./autopush.sh "fix: resolve critical security vulnerability"

# 3. Merge to main immediately
./autopush.sh --merge "hotfix: security vulnerability patch"
```

#### Release Workflow
```bash
# 1. Prepare release branch
git checkout -b release/v2.1.0

# 2. Final preparations
./autopush.sh "chore: update version to 2.1.0"
./autopush.sh "docs: update changelog for v2.1.0"

# 3. Merge to main
./autopush.sh --merge "release: version 2.1.0"
```

## 🎯 Smart Commit Message Generation

The script analyzes your changes and generates appropriate commit messages:

### Message Patterns

#### Based on File Changes
```bash
# New files added
"feat: Add 3 new files (tsx ts scss)"

# Files modified
"update: Improve 5 files (js ts css)"

# Files deleted
"refactor: Remove 2 files and update 3 files"

# Major changes
"refactor: Major updates to 10 files (ts tsx js)"

# No specific changes
"chore: Project maintenance and cleanup"
```

#### Based on File Types
The script detects file extensions and includes them in messages:
- **Frontend**: `tsx`, `jsx`, `ts`, `js`, `css`, `scss`, `html`
- **Backend**: `ts`, `js`, `py`, `php`, `go`, `rs`
- **Config**: `json`, `yml`, `yaml`, `toml`, `env`
- **Documentation**: `md`, `txt`, `rst`

### Customization

You can still override auto-generated messages:
```bash
# Override with specific message
./autopush.sh "feat: implement advanced search functionality"

# Interactive mode - script will prompt for message if empty
./autopush.sh
# → "Enter commit message (or press Enter for auto-generated):"
```

## 🔀 Branch Management Features

### Dynamic Main Branch Detection

The script automatically detects your main branch in this order:
1. **Local branches**: `main` → `master` → `develop` → `dev`
2. **Remote branches**: `origin/main` → `origin/master` → `origin/develop` → `origin/dev`
3. **Default branch**: Queries Git for repository default
4. **Fallback**: Uses `main` as default

```bash
# Status display shows detected main branch
📋 Summary:
  Modified: 3 files
  Staged: 0 files
  Untracked: 2 files
  Main branch: main  # ← Automatically detected
```

### Merge Process

The merge process is safe and thorough:

1. **Commit Changes**: Commits current changes to feature branch
2. **Push Feature Branch**: Pushes feature branch to remote
3. **Switch to Main**: Checks out the main branch
4. **Pull Latest**: Updates main branch with latest changes
5. **Merge**: Performs a no-fast-forward merge
6. **Push Main**: Pushes updated main branch
7. **Cleanup**: Optionally deletes the feature branch

### Branch Cleanup

After successful merge, the script offers to clean up:
```bash
🗑️  Delete branch 'feature/user-auth'? [y/N]: y
✅ Deleted branch feature/user-auth
```

## 📊 Status Display

The script provides comprehensive status information:

### Repository Status
```bash
📊 Repository Status:

## feature/user-auth...origin/feature/user-auth [ahead 2]
 M src/components/Auth.tsx
 M src/pages/login.tsx
?? src/types/auth.types.ts
?? tests/auth.test.ts

📋 Summary:
  Modified: 2 files
  Staged: 0 files
  Untracked: 2 files
  Main branch: main
```

### Commit Preview
```bash
📝 Files to be committed:
add 'src/components/Auth.tsx'
add 'src/pages/login.tsx'
add 'src/types/auth.types.ts'
add 'tests/auth.test.ts'

🤔 Commit with message: 'feat: Add 2 new files and update 2 files (tsx ts)'? [Y/n]:
```

### Success Summary
```bash
🎉 Auto-push completed successfully!
ℹ️  Commit: feat: Add 2 new files and update 2 files (tsx ts)
ℹ️  Branch: main (merged)

📝 Last commit:
a1b2c3d feat: Add 2 new files and update 2 files (tsx ts)
```

## 🛠️ Configuration

### Environment Variables
```bash
# Optional: Set default main branch
export AUTOPUSH_MAIN_BRANCH="develop"

# Optional: Set default commit message prefix
export AUTOPUSH_PREFIX="feat:"
```

### Git Configuration
Ensure your Git is properly configured:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### SSH Keys
For automatic pushing, ensure SSH keys are set up:
```bash
# Generate SSH key if needed
ssh-keygen -t ed25519 -C "your.email@example.com"

# Add to SSH agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Add public key to GitHub/GitLab
cat ~/.ssh/id_ed25519.pub
```

## 🚨 Error Handling

### Common Issues and Solutions

#### Merge Conflicts
```bash
# If merge fails due to conflicts
❌ Merge failed. Please resolve conflicts manually.

# Resolution:
git status
git merge --abort  # Cancel the merge
git pull origin main  # Update main branch
git checkout your-branch
git merge main  # Resolve conflicts manually
```

#### Permission Denied
```bash
# If SSH push fails
# Check SSH connection
ssh -T git@github.com

# Verify remote URL
git remote -v

# Switch to SSH if using HTTPS
git remote set-url origin git@github.com:user/repo.git
```

#### Branch Not Found
```bash
# If main branch detection fails
⚠️  No main branch detected. Using 'main' as default.

# Manually specify main branch
./autopush.sh --main-branch master --merge
```

## 📈 Best Practices

### 1. Commit Message Conventions
Follow conventional commit format when using custom messages:
```bash
# Features
./autopush.sh "feat: add user authentication"

# Bug fixes
./autopush.sh "fix: resolve login redirect issue"

# Documentation
./autopush.sh "docs: update API documentation"

# Refactoring
./autopush.sh "refactor: optimize database queries"

# Tests
./autopush.sh "test: add unit tests for auth module"

# Chores
./autopush.sh "chore: update dependencies"
```

### 2. Branch Naming
Use descriptive branch names:
```bash
feature/user-authentication
bugfix/login-redirect
hotfix/security-patch
release/v2.1.0
docs/api-updates
```

### 3. Regular Usage
Use autopush regularly to maintain clean history:
```bash
# Small, frequent commits
./autopush.sh "feat: add login form validation"
./autopush.sh "feat: implement password strength meter"
./autopush.sh "test: add form validation tests"

# Merge when feature is complete
./autopush.sh --merge "feat: complete login form with validation"
```

### 4. Review Before Merge
Always review changes before merging:
```bash
# Check status before merge
git status
git diff

# Use autopush for feature development
./autopush.sh "feat: implement user dashboard"

# Review and test before merge
# Run tests, check functionality

# Final merge to main
./autopush.sh --merge "feat: add comprehensive user dashboard"
```

## 🔧 Troubleshooting

### Debug Mode
Enable verbose output by editing the script:
```bash
# Add this line at the top of autopush.sh after the shebang
set -x  # Enable debug mode
```

### Manual Operations
If automation fails, you can perform operations manually:
```bash
# Manual commit and push
git add .
git commit -m "your message"
git push origin current-branch

# Manual merge
git checkout main
git pull origin main
git merge your-branch
git push origin main
```

### Reset if Needed
If something goes wrong:
```bash
# Reset to last commit
git reset --hard HEAD

# Reset to specific commit
git reset --hard commit-hash

# Force push if needed (be careful!)
git push --force-with-lease origin branch-name
```

## 📚 Integration Examples

### With CI/CD Pipelines
```bash
# In your CI/CD script
./autopush.sh --merge "ci: automated deployment"
```

### With Pre-commit Hooks
```bash
# .git/hooks/pre-commit
#!/bin/bash
# Run tests before commit
npm test && ./autopush.sh
```

### With Development Workflow
```bash
# Daily development routine
./autopush.sh "wip: daily progress on user module"

# Weekly feature completion
./autopush.sh --merge "feat: complete user management module"
```

---

## 📄 License

This script is part of the KataCore project and is licensed under the MIT License.

---

<div align="center">

**Happy Git Automation! 🚀**

[🏠 Back to Main Documentation](README.md)

</div>
