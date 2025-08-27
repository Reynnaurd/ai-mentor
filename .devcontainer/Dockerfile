FROM mcr.microsoft.com/devcontainers/typescript-node:1-22

# Enable Corepack (manages pnpm) and cache pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Install Docker CLI inside the container
RUN apt-get update && apt-get install -y \
  apt-transport-https \
  ca-certificates \
  curl \
  gnupg \
  lsb-release \
  && curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add - \
  && echo "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list \
  && apt-get update \
  && apt-get install -y docker-ce-cli \
  && rm -rf /var/lib/apt/lists/*

# Add the node user to the docker group to allow Docker access
RUN groupadd docker && usermod -aG docker node

# Optional helpful tools
RUN npm i -g @nestjs/cli
