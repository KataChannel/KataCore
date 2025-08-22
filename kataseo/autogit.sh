read -p "Enter branch name: " branch_name
git checkout -b "$branch_name"
git push --set-upstream origin "$branch_name"
git add .
read -p "Enter commit message (press Enter for timestamp): " commit_message

# Use current timestamp if no commit message provided
if [ -z "$commit_message" ]; then
    commit_message=$(date '+%Y-%m-%d %H:%M:%S')
fi

git commit -m "$commit_message"
git push