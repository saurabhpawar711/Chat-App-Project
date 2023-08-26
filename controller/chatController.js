const Chat = require('../model/chatModel');
const sequelize = require('../util/database');
const io = require('socket.io')(4000, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
    }
})

// const io = new Server(server, {
//     cors: {
//         origin: 'http://localhost:3000',
//         methods: ['GET', 'POST'],
//         allowedHeaders: ["my-custom-header"],
//         credentials: true,
//     },
// });

// server.listen(4000, () => {
//     console.log('Socket.IO server listening on port 4000');
// });

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

// exports.getMessages = async (req, res) => {
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
            // const totalMsgs = await Chat.count();
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ error: "Something went wrong" });
        }
    })
})
    // try {
    //     const groupId = req.params.id;
    //     const messages = await Chat.findAll({
    //         attributes: ['id', 'name', 'message'],
    //         where: {
    //             groupId: groupId
    //         }
    //     });
    //     // const totalMsgs = await Chat.count();
    //     res.status(200).json({ success: true, messages: messages });
    // }
    // catch (err) {
    //     console.log(err);
    //     res.status(500).json({ error: "Something went wrong" });
    // }
