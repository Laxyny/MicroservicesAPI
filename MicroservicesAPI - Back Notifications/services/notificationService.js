const config = require('../config/config');

class NotificationService {
    constructor(io, notificationModel) {
        this.io = io;
        this.notificationModel = notificationModel;
    }

    async createAndSend(notification) {
        try {
            const savedNotification = await this.notificationModel.create(notification);
            this.io.to(`user-${notification.userId}`).emit('notification', savedNotification);
            return savedNotification;
        } catch (error) {
            throw error;
        }
    }

    formatNotificationMessage(type, data) {
        switch (type) {
            case config.notificationTypes.ORDER_STATUS:
                return `Commande #${data.orderId.substring(0, 8)} - Statut: ${data.status}`;
            case config.notificationTypes.NEW_ORDER:
                return `Nouvelle commande #${data.orderId.substring(0, 8)} de ${data.total}€`;
            case config.notificationTypes.ORDER_CANCELED:
                return `Commande #${data.orderId.substring(0, 8)} annulée par le client`;
            case config.notificationTypes.NEW_REVIEW:
                return `Nouvel avis sur ${data.productName} (${data.rating}⭐)`;
            case config.notificationTypes.REPORT_READY:
                return `Rapport généré pour ${data.storeName}`;
            case config.notificationTypes.SERVICE_STATUS:
                return `Service ${data.serviceName}: ${data.status}`;
            default:
                return data.message || 'Nouvelle notification';
        }
    }
}

module.exports = { NotificationService };