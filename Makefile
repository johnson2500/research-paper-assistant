.PHONY: setup dev lint test test-integration test-e2e deploy undeploy

setup:
	pnpm install
	cd packages/api && uv sync
	cd packages/db && uv sync
	cd packages/ingestion && uv sync

dev:
	podman-compose up --build

lint:
	pnpm turbo lint
	cd packages/api && uv run ruff check . && uv run ruff format --check .
	cd packages/db && uv run ruff check . && uv run ruff format --check .
	cd packages/ingestion && uv run ruff check . && uv run ruff format --check .

test:
	pnpm turbo test
	cd packages/api && uv run pytest tests/
	cd packages/ingestion && uv run pytest tests/

test-integration:
	podman-compose -f compose.yml up -d
	cd tests/integration && uv run pytest .
	podman-compose down

test-e2e:
	pnpm exec playwright test

deploy:
	helm upgrade --install research-paper-assistant deploy/helm/research-paper-assistant \
		--namespace research-paper-assistant --create-namespace \
		-f deploy/helm/research-paper-assistant/values.yaml

undeploy:
	helm uninstall research-paper-assistant --namespace research-paper-assistant
