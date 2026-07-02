# QuickMeet Backend Deployment Guide

This guide walks through deploying the NestJS backend to a production environment using Neon (Serverless Postgres), Upstash (Serverless Redis), and Render.

## 1. Provision Databases

### Postgres (Neon)
1. Go to [Neon.tech](https://neon.tech) and create an account/project.
2. Under your new project, copy the **Connection String** (it should look like `postgresql://user:password@endpoint.neon.tech/dbname?sslmode=require`).

### Redis (Upstash)
1. Go to [Upstash.com](https://upstash.com) and create a Redis database.
2. Scroll down to the "Connect to your database" section.
3. Select "Node" and copy the **Redis URL** (it should look like `rediss://default:password@endpoint.upstash.io:port`).

## 2. Deploy to Render

We have already configured a `render.yaml` file for Infrastructure-as-Code deployment.

1. **Push your code to GitHub:**
   Ensure all your latest backend code is pushed to your GitHub repository.
2. **Connect to Render:**
   - Log into [Render.com](https://render.com).
   - Click **New +** and select **Blueprint**.
   - Connect your GitHub repository containing the `quickmeet-api` code.
3. **Configure Environment Variables:**
   Render will automatically detect the `render.yaml` file, but it will ask you to supply the values for the `sync: false` environment variables.
   - Set `DATABASE_URL` to your Neon Postgres Connection String.
   - Set `REDIS_URL` to your Upstash Redis URL.
4. **Deploy:**
   Click **Apply**. Render will automatically install dependencies, build the NestJS app, run the Prisma migrations (`npx prisma migrate deploy`), and start the server.
5. **Get your API URL:**
   Once deployed, Render will give you a public URL (e.g., `https://quickmeet-api-xyz.onrender.com`). Save this URL, you will need it for the Mobile App!

## 3. Verification
Navigate to `https://<YOUR_RENDER_URL>/health` in your browser. You should see a `{"status":"ok"}` message confirming the deployment is healthy.
