FROM node:12

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Install node modules
COPY package*.json /app/
RUN cd /app && \
  if [ "$NODE_ENV" = "production" ]; then npm install --registry=https://registry.npmjs.org/ --only=production; \
  else npm install --registry=https://registry.npmjs.org/; \
  fi

# Install application
COPY . /app
RUN chmod +x ./serve.js
RUN chmod +x ./start.sh

# Mount persistent storage
VOLUME /app/data
VOLUME /app/public

# EXPOSE 1337
CMD ["./start.sh"]
