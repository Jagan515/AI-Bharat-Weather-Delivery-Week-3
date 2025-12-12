# Deployment Guide

## Local Development Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Git

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd weather-delivery-dashboard

# Run setup script
chmod +x setup.sh
./setup.sh

# Start the dashboard
./start.sh
```

### Manual Setup
```bash
# Install dependencies
npm run install-all

# Start development servers
npm run dev
```

## Production Deployment

### AWS Deployment Architecture

#### Recommended Services
- **Frontend**: S3 + CloudFront
- **Backend**: EC2 or ECS
- **Database**: RDS (PostgreSQL)
- **Cache**: ElastiCache (Redis)
- **Monitoring**: CloudWatch

#### Environment Variables
```bash
# Backend (.env)
PORT=5000
WEATHER_API_KEY=your_openweathermap_api_key
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://cache-host:6379
NODE_ENV=production
```

#### Frontend Build
```bash
cd frontend
npm run build
# Deploy build/ folder to S3
```

#### Backend Deployment
```bash
cd backend
npm install --production
npm start
```

### Docker Deployment

#### Backend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - WEATHER_API_KEY=${WEATHER_API_KEY}
    
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

### Performance Considerations

#### Backend Optimizations
- Enable gzip compression
- Implement API rate limiting
- Use connection pooling for database
- Cache correlation calculations

#### Frontend Optimizations
- Enable code splitting
- Implement lazy loading for charts
- Use service workers for caching
- Optimize bundle size

### Monitoring and Logging

#### Health Checks
```javascript
// Backend health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

#### Logging Setup
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Security Considerations

#### API Security
- Implement CORS properly
- Add rate limiting
- Validate all inputs
- Use HTTPS in production
- Implement API authentication if needed

#### Environment Security
- Never commit .env files
- Use AWS Secrets Manager for sensitive data
- Implement proper IAM roles
- Enable CloudTrail logging

### Scaling Strategies

#### Horizontal Scaling
- Use Application Load Balancer
- Implement auto-scaling groups
- Use container orchestration (ECS/EKS)

#### Database Scaling
- Implement read replicas
- Use connection pooling
- Consider database sharding for large datasets

#### Caching Strategy
- Cache API responses
- Implement browser caching
- Use CDN for static assets

### Backup and Recovery

#### Data Backup
- Automated RDS backups
- S3 versioning for static assets
- Regular database snapshots

#### Disaster Recovery
- Multi-AZ deployment
- Cross-region replication
- Automated failover procedures

## Cost Optimization

### AWS Cost Management
- Use Reserved Instances for predictable workloads
- Implement auto-scaling to reduce idle resources
- Use S3 lifecycle policies for log retention
- Monitor costs with AWS Cost Explorer

### Resource Optimization
- Right-size EC2 instances
- Use spot instances for development
- Implement efficient caching strategies
- Optimize database queries

## Maintenance

### Regular Updates
- Keep dependencies updated
- Monitor security vulnerabilities
- Update Node.js versions regularly
- Review and optimize performance metrics

### Monitoring Checklist
- [ ] API response times
- [ ] Error rates
- [ ] Database performance
- [ ] Cache hit rates
- [ ] User engagement metrics
- [ ] Cost metrics