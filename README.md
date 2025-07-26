Starting the docker:
```bash
docker run -it --rm \
        -p 5678:5678 \
        -e N8N_BASIC_AUTH_USER=admin \
        -e N8N_BASIC_AUTH_PASSWORD=admin \
        n8nio/n8n
```

Access n8n at http://localhost:5678

You MUST create an API key on n8n, and add it in the env.