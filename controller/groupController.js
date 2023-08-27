const Group = require('../model/groupModel');
const UserGroup = require('../model/userGroupModel');
const User = require('../model/adminModel');
const Chat = require('../model/chatModel');
const sequelize = require('../util/database');

exports.createGroup = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.user.id;
        const name = req.body.name;
        const userToBeAdd = req.body.userToBeAdd;

        const details = await Group.create({
            name: name,
            admin: userId
        }, { transaction: t });

        const userIdArray = [];
        userIdArray.push(userId);
        for (let i = 0; i < userToBeAdd.length; i++) {
            const idOfUserToBeAdd = await User.findOne({
                attributes: ['id'],
                where: {
                    email: userToBeAdd[i]
                }
            })
            if (!idOfUserToBeAdd) {
                throw new Error("Please Enter valid email")
            }
            else {
                userIdArray.push(idOfUserToBeAdd.id);
            }
        }

        for (let i = 0; i < userIdArray.length; i++) {
            const isAdmin = userIdArray[i] === userId;
            await UserGroup.create({
                groupId: details.id,
                userId: userIdArray[i],
                isAdmin: isAdmin
            }, { transaction: t });
        }

        await t.commit();
        res.status(200).json({ success: true, message: "successful" });
    }
    catch (err) {
        console.log(err);
        await t.rollback();
        if (err.message === "Please Enter valid email") {
            res.status(500).json({ success: false, error: err.message });
        }
        else {
            res.status(500).json({ success: false, error: "Something went wrong while creating group" });
        }
    }
}

exports.getGroups = async (req, res) => {
    try {
        const userId = req.user.id;
        const groupId = req.query.groupId;
        const groupIds = await UserGroup.findAll({
            attributes: ['groupId'],
            where: {
                userId: userId
            }
        });

        if(groupId) {
            const currentGroupName = await Group.findOne({
                attributes: ['name'],
                where: {
                    id: groupId
                }
            }); 
            return res.status(200).json({groupName: currentGroupName});
        }

        const groupNames = [];
        for (let element of groupIds) {
            const groupDetails = await Group.findOne({
                attributes: ['name'],
                where: {
                    id: element.groupId
                }
            });
            groupNames.push(groupDetails.name);
        };

        res.status(200).json({ success: true, groupDetails: groupNames, groupIds: groupIds });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
}

exports.addUserinGroup = async (req, res) => {
    const t = await sequelize.transaction();
    try {

        const userId = req.user.id;
        const groupName = req.body.name;
        const userToBeAdd = req.body.userToBeAdd;

        const group = await Group.findOne({
            where: {
                name: groupName
            }
        })

        if (!group) {
            throw new Error("Please Enter valid group name")
        }

        const user = await UserGroup.findOne({
            where: {
                userId: userId,
                groupId: group.id
            }
        })

        if (user.isAdmin != true) {
            throw new Error("Only Admin have Access")
        }

        else {
            const userId = await User.findOne({
                attributes: ['id'],
                where: {
                    email: userToBeAdd
                }
            })
            if (!userId) {
                throw new Error("Please Enter valid email")
            }
            await UserGroup.create({
                userId: userId.id,
                groupId: group.id
            }, { transaction: t });

            await t.commit();
            res.status(200).json({ success: true, message: "User added successfully" });
        }
    }
    catch (err) {
        console.log(err);
        if (err.message === 'Only Admin have Access') {
            await t.rollback();
            return res.status(500).json({ error: err.message });
        }
        else if (err.message === 'Please Enter valid group name') {
            await t.rollback();
            return res.status(500).json({ success: false, error: err.message });
        }
        else if (err.message === 'Please Enter valid email') {
            await t.rollback();
            return res.status(500).json({ success: false, error: err.message });
        }
        await t.rollback();
        res.status(500).json({ success: false });
    }
}

exports.getUsersOfGroup = async (req, res) => {
    try {
        const groupId = req.params.id;
        const userIds = await UserGroup.findAll({
            attributes: ['userId', 'isAdmin'],
            where: {
                groupId: groupId
            }
        })

        const isAdmin = [];
        for (let user of userIds) {
            isAdmin.push(user.isAdmin)
        }

        const memberNames = [];
        const memberIds = [];
        for (let element of userIds) {
            const memberDetails = await User.findOne({
                attributes: ['id', 'name'],
                where: {
                    id: element.userId
                }
            });
            memberNames.push(memberDetails.name);
            memberIds.push(memberDetails.id);
        };

        res.status(200).json({ success: true, memberNames: memberNames, memberIds: memberIds, isAdmin: isAdmin });
    }
    catch (err) {
        res.status(500).json({ success: false });
    }
}

exports.makeAdmin = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.user.id;
        const groupId = req.body.groupId;
        const userIds = req.body.userIds;
        const user = await UserGroup.findOne({
            where: {
                userId: userId,
                groupId: groupId
            }
        })

        if (user.isAdmin != true) {
            throw new Error("Only Admin have Access")
        }
        else {
            for (let userId of userIds) {
                await UserGroup.update({
                    isAdmin: true
                }, {
                    where: {
                        groupId: groupId,
                        userId: userId
                    }
                }, { transaction: t })
            }
        }
        await t.commit();
        res.status(200).json({ success: true, message: "Successfully made admin" });
    }
    catch (err) {
        console.log(err);
        if (err.message === 'Only Admin have Access') {
            await t.rollback();
            return res.status(500).json({ success: false, error: err.message });
        }
        await t.rollback();
        res.status(500).json({ success: false });
    }
}

exports.removeUserFromUser = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.user.id;
        const groupId = req.body.groupId;
        const userIds = req.body.userIds;
        const user = await UserGroup.findOne({
            where: {
                userId: userId,
                groupId: groupId
            }
        })

        if (user.isAdmin != true) {
            throw new Error("Only Admin have Access")
        }
        else {
            for (let userId of userIds) {
                await UserGroup.destroy({
                    where: {
                        groupId: groupId,
                        userId: userId
                    }, transaction: t
                })
            }
        }
        await t.commit();
        res.status(200).json({ success: true, message: "Removed user successfully" });
    }
    catch (err) {
        console.log(err);
        if (err.message === 'Only Admin have Access') {
            await t.rollback();
            return res.status(500).json({ success: false, error: err.message });
        }
        await t.rollback();
        res.status(500).json({ success: false });
    }
}

exports.removeAsAdmin = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.user.id;
        const groupId = req.body.groupId;
        const userIds = req.body.userIds;
        const user = await UserGroup.findOne({
            where: {
                userId: userId,
                groupId: groupId
            }
        })

        if (user.isAdmin != true) {
            throw new Error("Only Admin have Access")
        }
        else {
            for (let userId of userIds) {
                await UserGroup.update({
                    isAdmin: false
                }, {
                    where: {
                        groupId: groupId,
                        userId: userId
                    }
                }, { transaction: t })
            }
        }
        await t.commit();
        res.status(200).json({ success: true, message: "Removed as admin" });
    }
    catch (err) {
        console.log(err);
        if (err.message === 'Only Admin have Access') {
            await t.rollback();
            return res.status(500).json({ success: false, error: err.message });
        }
        await t.rollback();
        res.status(500).json({ success: false });
    }
}

exports.deleteGroup = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const groupName = req.params.groupName;
        const userId = req.user.id;
        const group = await Group.findOne({
            where: {
                name: groupName
            }
        })
        if (!group) {
            throw new Error("Please Enter valid group name")
        }
        const user = await UserGroup.findOne({
            where: {
                userId: userId,
                groupId: group.id
            }
        })

        if (user.isAdmin != true) {
            throw new Error("Only Admin have Access")
        }
        else {
            await group.destroy({ transaction: t });
            await t.commit();
            res.status(200).json({ success: true, message: "Successfully deleted group" });
        }
    }

    catch (err) {
        console.log(err);
        if (err.message === 'Only Admin have Access') {
            await t.rollback();
            return res.status(500).json({ success: false, error: err.message });
        }
        else if (err.message === 'Please Enter valid group name') {
            await t.rollback();
            return res.status(500).json({ success: false, error: err.message });
        }
        await t.rollback();
        res.status(500).json({ success: false, error: "Group not found" });
    }
}