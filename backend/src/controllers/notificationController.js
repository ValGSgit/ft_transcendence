import Notification from '../models/Notification.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getUserNotifications = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const notifications = await Notification.getUserNotifications(
      req.user.id,
      parseInt(limit),
      parseInt(offset)
    );

    const unreadCount = await Notification.getUnreadCount(req.user.id);

    return successResponse(res, {
      notifications,
      count: notifications.length,
      unreadCount,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return errorResponse(res, 'Failed to get notifications', 500);
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.markAsRead(
      parseInt(notificationId),
      req.user.id
    );

    if (!notification) {
      return errorResponse(res, 'Notification not found', 404);
    }

    return successResponse(res, { notification }, 'Notification marked as read');
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return errorResponse(res, 'Failed to mark notification as read', 500);
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.markAllAsRead(req.user.id);
    return successResponse(res, null, 'All notifications marked as read');
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    return errorResponse(res, 'Failed to mark all notifications as read', 500);
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.delete(parseInt(notificationId), req.user.id);
    return successResponse(res, null, 'Notification deleted');
  } catch (error) {
    console.error('Delete notification error:', error);
    return errorResponse(res, 'Failed to delete notification', 500);
  }
};

export const deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteAll(req.user.id);
    return successResponse(res, null, 'All notifications deleted');
  } catch (error) {
    console.error('Delete all notifications error:', error);
    return errorResponse(res, 'Failed to delete all notifications', 500);
  }
};

export default {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
};
