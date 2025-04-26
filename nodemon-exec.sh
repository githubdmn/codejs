#!/bin/bash

CHANGED_FILE="$1"

if [[ "$CHANGED_FILE" == *.ts ]]; then
	echo "TypeScript file changed: $CHANGED_FILE"
	npx prettier --write "$CHANGED_FILE"
	ts-node -r tsconfig-paths/register ./src/ts
elif [[ "$CHANGED_FILE" == *.js ]]; then
	echo "JavaScript file changed: $CHANGED_FILE"
	npx prettier --write "$CHANGED_FILE"
	node ./src/js
fi

echo "Nodemon restarting..."
