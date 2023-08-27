const Chat = require('../model/chatModel');
const Admin = require('../model/adminModel');
const sequelize = require('../util/database');
const S3Services = require('../services/S3Service');
const jwt = require('jsonwebtoken');
const io = require('socket.io')(4000, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
    }
})

exports.sendMessage = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.user.id;
        const name = req.user.name;
        const message = req.body.message;
        const groupId = req.body.groupId;

        const messageAdded = await Chat.create({
            name: name,
            message: message,
            userId: userId,
            groupId: groupId
        }, { transaction: t });

        const chatData = {
            id: messageAdded.id,
            name: name,
            message: message
        }
        await t.commit();
        res.status(201).json({ message: chatData, success: true });
    }
    catch (err) {
        console.log(err);
        await t.rollback();
        res.status(500).json({ error: "Something went wrong while sending message" });
    }
}

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('getMessages', async (groupId) => {
        try {
            const messages = await Chat.findAll({
                attributes: ['id', 'name', 'message'],
                where: {
                    groupId: groupId
                }
            });
            io.emit('gotMessages', messages);
        }
        catch (err) {
            socket.on('connect_error', err => {
                console.log(err);
            })
        }
    })

    socket.on('upload', async (file, fileExtension, groupId, fileType, token) => {
        const t = await sequelize.transaction();
        try {
            const userDetails = jwt.verify(token, process.env.JWT_SECRETKEY);
            const user = await Admin.findOne({
                where: {
                    id: userDetails.userId
                }
            });
            const userId = user.id;
            const userName = user.name;
            const fileName = `chatAppFile${groupId}/${new Date()}.${fileExtension}`;
            const fileUrl = await S3Services.uploadToS3(file, fileName, fileType);
            const newMessage = await Chat.create({
                name: userName,
                message: fileUrl,
                userId: userId,
                groupId: groupId
            }, { transaction: t });

            const chatData = {
                id: newMessage.id,
                name: userName,
                message: fileUrl
            }

            await t.commit();
            io.emit('fileUrl', chatData);
        }
        catch (err) {
            await t.rollback();
            console.log(err);
            socket.on('connect_error', err => {
                console.log(err);
            })
        }
    })
})

