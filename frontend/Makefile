# .PHONY tells Make that these are commands, not files
.PHONY: up down shell logs clean

# Target: Start the farm
# Usage: make up
up:
	docker-compose up --build

# Target: Stop the farm
# Usage: make down
down:
	docker-compose down

# Target: Enter the container (like SSHing into it)
# Usage: make shell
shell:
	docker-compose exec alpaca-farm sh

# Target: View server logs
# Usage: make logs
logs:
	docker-compose logs -f

# Target: Clean up Docker artifacts (images/containers) to free space
# Usage: make clean
clean:
	docker system prune -f