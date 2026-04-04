# ============================================================
# ZYNTH SCAN WORKER — Docker Image
# ============================================================
# This runs on a cloud server (DigitalOcean, Railway, etc.)
# It has nmap + nuclei installed.
# Your i3 PC NEVER runs this. Only the cloud server does.
# ============================================================

FROM ubuntu:22.04

# Prevent interactive prompts during install
ENV DEBIAN_FRONTEND=noninteractive
ENV NUCLEI_VERSION=3.2.4

# 1. Install system dependencies + standard tools
RUN apt-get update && apt-get install -y \
    nmap \
    sqlmap \
    whatweb \
    curl \
    wget \
    golang-go \
    ca-certificates \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# 2. Install Nuclei
RUN wget -qO nuclei.zip \
    https://github.com/projectdiscovery/nuclei/releases/download/v${NUCLEI_VERSION}/nuclei_${NUCLEI_VERSION}_linux_amd64.zip && \
    unzip nuclei.zip -d /usr/local/bin && \
    chmod +x /usr/local/bin/nuclei && \
    rm nuclei.zip

# 3. Install ffuf (the industry standard fuzzer)
RUN wget -qO ffuf.tar.gz \
    https://github.com/ffuf/ffuf/releases/download/v2.1.0/ffuf_2.1.0_linux_amd64.tar.gz && \
    tar -xzf ffuf.tar.gz -C /usr/local/bin && \
    chmod +x /usr/local/bin/ffuf && \
    rm ffuf.tar.gz

# 4. Install Node.js for our worker API
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# 4. Set up app
WORKDIR /app
COPY package.json ./
RUN npm install

COPY server.js ./

# 5. Start server (Nuclei templates will update automatically on first run)
EXPOSE 4000

CMD ["node", "server.js"]
