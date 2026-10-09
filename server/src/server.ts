import './config/env'; // Validate env first
import { createApp } from './app';
import { prisma } from './lib/prisma';
import { env } from './config/env';

const app = createApp();

async function start() {
    try {
        // Verify DB connection
        await prisma.$connect();
        console.log('✅ Database connected');

        app.listen(env.SERVER_PORT, () => {
            console.log(`🚀 Server running on http://localhost:${env.SERVER_PORT}`);
            console.log(`   Environment: ${env.NODE_ENV}`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err);
        await prisma.$disconnect();
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received — shutting down gracefully');
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});

start();
