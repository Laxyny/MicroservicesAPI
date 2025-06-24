const { OrderModel } = require('../models/orderModel');
const axios = require('axios');

let orderModel;

exports.init = (orderCollection) => {
    orderModel = new OrderModel(orderCollection);
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await orderModel.getAll();
        res.json(orders);
    } catch (err) {
        console.error('Erreur lors de la récupération des commandes:', err);
        res.status(500).json({ message: 'Erreur lors de la récupération des commandes' });
    }
};

exports.getOrder = async (req, res) => {
    try {
        const id = req.params.id;
        const order = await orderModel.getById(id);
        
        if (!order) {
            return res.status(404).json({ message: 'Commande non trouvée' });
        }
        
        if (order.userId !== req.user.userId) {
            return res.status(403).json({ message: 'Accès non autorisé à cette commande' });
        }
        
        res.json(order);
    } catch (err) {
        console.error('Erreur lors de la récupération de la commande:', err);
        res.status(500).json({ message: 'Erreur lors de la récupération de la commande' });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.user.userId;
        const orders = await orderModel.getByUserId(userId);
        
        res.json(orders);
    } catch (err) {
        console.error('Erreur lors de la récupération des commandes de l\'utilisateur:', err);
        res.status(500).json({ message: 'Erreur lors de la récupération des commandes de l\'utilisateur' });
    }
};

exports.createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, paymentMethod, total } = req.body;
        const userId = req.user.userId;
        
        if (!items || !items.length || !shippingAddress || !paymentMethod || !total) {
            return res.status(400).json({ message: 'Informations de commande incomplètes' });
        }
        
        const newOrder = {
            userId,
            items,
            shippingAddress,
            paymentMethod,
            total,
            status: 'Complétée',
            date: new Date()
        };
        
        const createdOrder = await orderModel.create(newOrder);
        
        try {
            await axios.delete('http://localhost:3000/cart/empty', {
                headers: { 
                    Cookie: `authToken=${req.cookies.authToken}` 
                }
            });
        } catch (cartErr) {
            console.error('Erreur lors du vidage du panier:', cartErr);
        }

        try {
            await axios.post('http://ms_notifications:8000/notifications/notify', {
                userId,
                type: 'order_status',
                data: {
                    orderId: createdOrder._id,
                    status: 'Complétée'
                }
            });
            
            const storeIds = [...new Set(items.map(item => item.storeId))];
            for (const storeId of storeIds) {
                if (!storeId) continue;
                
                const store = await storeModel.getById(storeId);
                if (store && store.userId) {
                    await axios.post('http://ms_notifications:8000/notifications/notify', {
                        userId: store.userId,
                        type: 'new_order',
                        data: {
                            orderId: createdOrder._id,
                            total: createdOrder.total,
                        }
                    });
                }
            }
        } catch (notifErr) {
            console.error('Erreur lors de l\'envoi des notifications:', notifErr);
        }
        
        res.status(201).json(createdOrder);
    } catch (err) {
        console.error('Erreur lors de la création de la commande:', err);
        res.status(500).json({ message: 'Erreur lors de la création de la commande' });
    }
};

exports.updateOrder = async (req, res) => {
    try {
        const id = req.params.id;
        const order = await orderModel.getById(id);
        
        if (!order) {
            return res.status(404).json({ message: 'Commande non trouvée' });
        }
        
        const updatedFields = {
            status: req.body.status,
        };
        
        const success = await orderModel.updateById(id, updatedFields);
        
        if (success) {
            try {
                await axios.post('http://ms_notifications:8000/notifications/notify', {
                    userId: order.userId,
                    type: 'order_status',
                    data: {
                        orderId: id,
                        status: updatedFields.status
                    }
                });
            } catch (notifErr) {
                console.error('Erreur lors de l\'envoi de la notification:', notifErr);
            }
            
            res.json({ message: 'Statut de la commande mis à jour' });
        } else {
            res.status(404).json({ message: 'Commande non trouvée' });
        }
    } catch (err) {
        console.error('Erreur lors de la mise à jour de la commande:', err);
        res.status(500).json({ message: 'Erreur lors de la mise à jour de la commande' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        
        const id = req.params.id;
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ message: 'Le statut est requis' });
        }
        
        const validStatuses = ['En attente', 'En cours', 'Complétée', 'Annulée'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Statut non valide' });
        }
        
        const success = await orderModel.updateStatus(id, status);
        
        if (success) {
            res.json({ message: 'Statut de la commande mis à jour' });
        } else {
            res.status(404).json({ message: 'Commande non trouvée' });
        }
    } catch (err) {
        console.error('Erreur lors de la mise à jour du statut de la commande:', err);
        res.status(500).json({ message: 'Erreur lors de la mise à jour du statut de la commande' });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const id = req.params.id;
        const order = await orderModel.getById(id);
        
        if (!order) {
            return res.status(404).json({ message: 'Commande non trouvée' });
        }
        
        const success = await orderModel.deleteById(id);
        
        if (success) {
            res.json({ message: 'Commande supprimée' });
        } else {
            res.status(500).json({ message: 'Erreur lors de la suppression de la commande' });
        }
    } catch (err) {
        console.error('Erreur lors de la suppression de la commande:', err);
        res.status(500).json({ message: 'Erreur lors de la suppression de la commande' });
    }
};

exports.checkProductPurchase = async (req, res) => {
    try {
        const productId = req.params.productId;
        const userId = req.user.userId;
        
        console.log("Vérification d'achat - userId:", userId);
        console.log("Vérification d'achat - productId:", productId);
        
        const orders = await orderModel.collection.find({
            userId: userId,
            status: 'Complétée'
        }).toArray();
        
        console.log("Toutes commandes complétées:", orders.length);
        
        let hasPurchased = false;
        for (const order of orders) {
            console.log("Commande:", order._id, "items:", order.items.length);
            for (const item of order.items) {
                console.log("Item dans commande:", item.productId);
                if (item.productId === productId) {
                    hasPurchased = true;
                    console.log("Produit trouvé dans commande:", order._id);
                    break;
                }
            }
            if (hasPurchased) break;
        }
        
        res.json({ hasPurchased });
    } catch (err) {
        console.error('Erreur détaillée lors de la vérification d\'achat:', err);
        res.status(500).json({ message: 'Erreur lors de la vérification d\'achat' });
    }
};