require('dotenv').config();

module.exports = {
    port: process.env.PORT || 8000,
    mongoUri: process.env.MONGO_URI || "mongodb+srv://user:Test1234@cluster.eovny.mongodb.net/?retryWrites=true&w=majority&appName=Cluster",
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4200',
    notificationTypes: {
        ORDER_STATUS: 'order_status',
        NEW_ORDER: 'new_order',
        ORDER_CANCELED:'order_canceled',
        NEW_REVIEW: 'new_review',
        REPORT_READY: 'report_ready',
        SERVICE_STATUS: 'service_status',
    }
};