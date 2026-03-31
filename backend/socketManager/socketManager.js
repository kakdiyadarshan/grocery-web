const jwt = require('jsonwebtoken');
const User = require('../models/user.model')
const Notification = require('../models/notification.model')

const userSocketMap = new Map();
const socketUserMap = new Map();

let ioInstance = null;

function initializeSocket(io) {
  // Store io instance for later use
  ioInstance = io;
  // Socket authentication middleware
  io.use(async (socket, next) => {
    const { userId, token } = socket.handshake.auth;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.SECRET_KEY);

      // Check if user exists
      const user = await User.findById(decoded._id);
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Attach user to socket
      socket.userId = decoded._id?.toString() || userId;
      next();
    } catch (error) {
      console.error('Socket Authentication Error:', error);
      return next(new Error('Authentication error'));
    }
  });

  io.on("connection", (socket) => {

    // Handle user room joining (explicit from client)
    socket.on("joinRoom", ({ userId }) => {
      if (userId) {
        const uid = String(userId);
        const set = userSocketMap.get(uid) || new Set();
        set.add(socket.id);
        userSocketMap.set(uid, set);
        socketUserMap.set(socket.id, uid);
        // Also join a per-user room so notifications work across clustered workers with Redis
        try {
          socket.join(`user:${uid}`);
        } catch (err) {
          console.error(`Failed to join user room user:${uid}:`, err?.message || err);
        }
      }
    });

    // Automatically map & join room for authenticated sockets
    if (socket.userId) {
      const uid = String(socket.userId);
      const set = userSocketMap.get(uid) || new Set();
      set.add(socket.id);
      userSocketMap.set(uid, set);
      socketUserMap.set(socket.id, uid);
      try {
        socket.join(`user:${uid}`);
      } catch (err) {
        console.error(`Failed to join user room on connect user:${uid}:`, err?.message || err);
      }
    }

    socket.on("error", (err) => {
      console.error("Socket error:", err?.message || err);
    });

    // Handle disconnect with cleanup
    socket.on("disconnect", (reason) => {

      // Remove mappings on disconnect
      const userId = socketUserMap.get(socket.id);
      if (userId) {
        const set = userSocketMap.get(userId);
        if (set) {
          set.delete(socket.id);
          if (set.size === 0) userSocketMap.delete(userId);
          else userSocketMap.set(userId, set);
        }
        socketUserMap.delete(socket.id);
      }
    });

    // Handle reconnection
    socket.on("reconnect", () => {
    });
  });

  // Cleanup disconnected sockets periodically
  setInterval(() => {
    for (const [socketId, userId] of socketUserMap.entries()) {
      const socket = io.sockets.sockets.get(socketId);
      if (!socket || !socket.connected) {
        socketUserMap.delete(socketId);
        const set = userSocketMap.get(userId);
        if (set) {
          set.delete(socketId);
          if (set.size === 0) userSocketMap.delete(userId);
          else userSocketMap.set(userId, set);
        }
      }
    }
  }, 30000); // Check every 30 seconds
}

function buildDesignationRegex(designations = []) {
  const map = {
    admin: /^(admin|administrator)$/i,
  };
  return designations.map(d => {
    const key = String(d || '').toLowerCase();
    const regex = map[key] || new RegExp(`^${key}$`, 'i');
    return { designation: { $regex: regex } };
  });
}

async function emitRoleNotification({ designations = [], excludeUserId = null, event = 'notify', data = {} } = {}) {
  try {
    if (!ioInstance || !designations.length) return;
    // For role-based notifications, we'll find users by role
    const targets = await User.find({ role: { $in: designations } }).select('_id');
    const excludeId = excludeUserId ? String(excludeUserId) : null;
    const docs = [];

    // Prepare documents
    targets.forEach(t => {
      const uid = String(t._id);
      if (excludeId && uid === excludeId) return;

      docs.push({
        user: uid,
        type: data?.type || event,
        message: data?.message || '',
        payload: data.payload || data,
        seen: false
      });
    });

    if (docs.length) {
      // 1. Insert into DB to generate _ids
      const createdDocs = await Notification.insertMany(docs, { ordered: false });

      // 2. Emit to each user with the generated _id
      createdDocs.forEach(doc => {
        const uid = String(doc.user);
        const payloadWithId = { ...data, _id: doc._id };
        ioInstance.to(`user:${uid}`).emit(event, payloadWithId);
      });
    }
  } catch (error) {
    console.error("emitRoleNotification error:", error);
  }
}

async function emitUserNotification({ userId, event = 'notify', data = {}, departmentId = null } = {}) {
  try {
    if (!ioInstance || !userId) return;
    const uid = String(userId);
    if (!departmentId) {
      try {
        const u = await User.findById(uid);
        departmentId = null;
      } catch { }
    }

    // 1. Create in DB first to get _id
    let savedNotification = null;
    try {
      const NotificationModel = Notification || require('../models/notificationModel');
      savedNotification = await NotificationModel.create({
        user: uid,
        department: departmentId || null,
        type: data?.type || event,
        message: data?.message || '',
        payload: data.payload || data,
        seen: false
      });
    } catch (dbError) {
      console.error("Database persistence failed for notification:", dbError);
    }

    // 2. Emit with _id (if saved) or fall back to payload without _id (if DB failed, though less ideal)
    const payload = savedNotification
      ? (departmentId ? { ...data, departmentId, _id: savedNotification._id } : { ...data, _id: savedNotification._id })
      : (departmentId ? { ...data, departmentId } : { ...data });

    ioInstance.to(`user:${uid}`).emit(event, payload);

  } catch (e) {
    console.error("emitUserNotification error:", e);
  }
}
module.exports = {
  initializeSocket,
  getUserSocketMap: () => userSocketMap,
  getSocketUserMap: () => socketUserMap,
  emitRoleNotification,
  emitUserNotification,
};
