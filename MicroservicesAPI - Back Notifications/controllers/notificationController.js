const { NotificationModel } = require('../models/notificationModel');
const { NotificationService } = require('../services/notificationService');
const config = require('../config/config');

let notificationModel;
let notificationService;
let io;

exports.init = (socketIo, notificationsCollection) => {
    io = socketIo;
    notificationModel = new NotificationModel(notificationsCollection);
    notificationService = new NotificationService(io, notificationModel);
};

exports.sendNotification = async (req, res) => {
    try {
        const { userId, type, data } = req.body;

        if (!userId || !type || !data) {
            return res.status(400).json({ message: 'userId, type et data sont requis' });
        }

        if (!Object.values(config.notificationTypes).includes(type)) {
            return res.status(400).json({ message: 'Type de notification invalide' });
        }

        const message = notificationService.formatNotificationMessage(type, data);

        const notification = {
            userId,
            type,
            message,
            data,
            timestamp: new Date()
        };

        const result = await notificationService.createAndSend(notification);

        res.status(201).json(result);
    } catch (error) {
        console.error('Erreur lors de l\'envoi d\'une notification:', error);
        res.status(500).json({ message: 'Erreur lors de l\'envoi de la notification' });
    }
};

exports.getUserNotifications = async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log('Récupération des notifications pour userId:', userId);
        const notifications = await notificationModel.getByUserId(userId);
        console.log('Notifications trouvées:', notifications.length);
        res.json(notifications);
    } catch (error) {
        console.error('Erreur lors de la récupération des notifications:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des notifications' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const id = req.params.id;
        const success = await notificationModel.markAsRead(id);

        if (success) {
            res.json({ message: 'Notification marquée comme lue' });
        } else {
            res.status(404).json({ message: 'Notification non trouvée' });
        }
    } catch (error) {
        console.error('Erreur lors du marquage de la notification:', error);
        res.status(500).json({ message: 'Erreur lors du marquage de la notification' });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const id = req.params.id;
        const success = await notificationModel.delete(id);

        if (success) {
            res.json({ message: 'Notification supprimée' });
        } else {
            res.status(404).json({ message: 'Notification non trouvée' });
        }
    } catch (error) {
        console.error('Erreur lors de la suppression de la notification:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression de la notification' });
    }
};