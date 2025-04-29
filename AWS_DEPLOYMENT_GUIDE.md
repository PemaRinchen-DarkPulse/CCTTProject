# AiMediCare AWS Deployment Guide

This document provides step-by-step instructions for deploying the AiMediCare application to AWS. The application consists of two main parts:
1. Backend API (Node.js/Express)
2. Frontend (React/Vite)

## Deployment Details

- **AWS Instance IP:** 13.232.90.30
- **Backend Port:** 5000
- **Frontend Port:** 5173 (development) / 80 (production)

## Prerequisites

- SSH access to your AWS instance
- Node.js and npm installed on your AWS instance
- Git installed on your AWS instance
- MongoDB installed or access to a MongoDB service
- PM2 or similar process manager for running Node.js applications

## Step 1: Backend Deployment

1. Connect to your AWS instance via SSH:
   ```
   ssh -i your-key.pem ec2-user@13.232.90.30
   ```

2. Clone your repository on the AWS instance:
   ```
   git clone [YOUR_REPOSITORY_URL]
   cd AiMediCare/server
   ```

3. Install dependencies:
   ```
   npm install --production
   ```

4. Create a `.env` file on the server:
   ```
   # Server configuration
   NODE_ENV=production
   PORT=5000
   HOST=0.0.0.0

   # MongoDB connection - update with your actual MongoDB URI
   MONGODB_URI=mongodb://localhost:27017/aimedicare

   # JWT secret for authentication - replace with a strong secret
   JWT_SECRET=your_super_secure_jwt_secret_replace_this
   JWT_EXPIRES_IN=30d

   # Client URL - update with your frontend address
   CLIENT_URL=http://13.232.90.30:5173

   # Email configuration
   EMAIL_FROM=noreply@aimedicare.com
   EMAIL_FROM_NAME=AiMediCare
   ```

5. Install PM2 globally if not already installed:
   ```
   npm install -g pm2
   ```

6. Start the backend server using PM2:
   ```
   pm2 start index.js --name aimedicare-backend
   ```

7. Save PM2 process list to restart on server reboot:
   ```
   pm2 save
   pm2 startup
   ```

## Step 2: Frontend Deployment

1. On your local machine, build the frontend:
   ```
   cd client
   npm run build
   ```

2. Deploy the built frontend to AWS:
   a. Using SCP:
      ```
      scp -i your-key.pem -r dist/* ec2-user@13.232.90.30:/var/www/html
      ```
   
   b. Or directly on the server:
      ```
      cd AiMediCare/client
      npm install
      npm run build
      cp -r dist/* /var/www/html
      ```

3. Configure Nginx or Apache to serve the frontend:
   - For Nginx:
   ```
   sudo apt update
   sudo apt install nginx
   ```

   - Create a configuration file:
   ```
   sudo nano /etc/nginx/sites-available/aimedicare
   ```

   - Add the following configuration:
   ```
   server {
       listen 80;
       server_name 13.232.90.30;

       root /var/www/html;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   - Enable the site:
   ```
   sudo ln -s /etc/nginx/sites-available/aimedicare /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## Step 3: Database Configuration

1. If using MongoDB on the same AWS instance:
   ```
   sudo apt update
   sudo apt install mongodb
   sudo systemctl enable mongodb
   sudo systemctl start mongodb
   ```

2. Configure security for MongoDB:
   ```
   sudo nano /etc/mongodb.conf
   ```
   
   Set:
   ```
   bind_ip = 127.0.0.1
   ```

   Restart MongoDB:
   ```
   sudo systemctl restart mongodb
   ```

## Step 4: Firewall Configuration

Allow traffic to necessary ports:

```
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS (if using SSL)
sudo ufw allow 5000  # Backend API (may want to restrict this to localhost only)
sudo ufw enable
```

## Step 5: Setting Up SSL (Optional but Recommended)

1. Install Certbot:
   ```
   sudo apt update
   sudo apt install certbot python3-certbot-nginx
   ```

2. Obtain SSL certificate:
   ```
   sudo certbot --nginx -d yourdomain.com
   ```

## Maintenance and Monitoring

- View backend logs:
   ```
   pm2 logs aimedicare-backend
   ```

- Restart backend after changes:
   ```
   pm2 reload aimedicare-backend
   ```

- Check frontend updates after deploying new build:
   ```
   sudo systemctl restart nginx
   ```

## Troubleshooting

### CORS Issues
- Ensure the server's .env file has the correct CLIENT_URL value
- Check that the frontend environment variables are correctly set

### Connection Issues
- Check if the backend is running: `pm2 status`
- Verify Nginx/Apache is running: `sudo systemctl status nginx`
- Check firewall settings: `sudo ufw status`

### Database Connection Issues
- Check MongoDB status: `sudo systemctl status mongodb`
- Verify connection string in .env file

## Updating the Application

### Backend Updates
```
cd ~/AiMediCare/server
git pull
npm install
pm2 reload aimedicare-backend
```

### Frontend Updates
```
cd ~/AiMediCare/client
git pull
npm install
npm run build
cp -r dist/* /var/www/html
```