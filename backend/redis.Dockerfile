FROM redis:7-alpine

# Expose Redis port
EXPOSE 6379

# Start Redis server
CMD ["redis-server", "--appendonly", "yes"]
