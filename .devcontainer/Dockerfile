FROM node:18-bullseye

# Install basic tools
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    zip \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install mobile development tools
RUN npm install -g \
    npm@latest \
    vite@latest \
    create-react-app@latest \
    nodemon@latest \
    qrcode-terminal@latest

# Set up workspace
WORKDIR /workspace
EXPOSE 3000 3001 5500 8080

# Create non-root user
RUN useradd -m -s /bin/bash developer && \
    chown -R developer:developer /workspace
USER developer

CMD ["sleep", "infinity"]
