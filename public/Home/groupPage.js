
const createTableModal = document.getElementById('createGroupModal');
const groupCreateBtn = document.getElementById('groupCreateBtn');
groupCreateBtn.addEventListener('click', async () => {
    try {
        const groupName = document.getElementById('groupName').value;
        const users = document.getElementById('emailAddresses').value;
        if(groupName === "" || users === "") {
            return alert('Please Enter field');
        }
        const userToBeAdd = users.split(',');
        const groupDetails = {
            name: groupName,
            userToBeAdd: userToBeAdd
        };
        console.log(groupDetails);
        const token = localStorage.getItem('token');
        const response = await axios.post(`${backendApi}/group/create-group`, groupDetails, { headers: { "Authorization": token } });
        window.location.href = 'homepage.html';
    }
    catch(err) {
        const errMessage = err.response.data.error;
        alert(errMessage);
    }
})


window.addEventListener('DOMContentLoaded', getGroupName);

async function getGroupName() {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${backendApi}/user/groups`, { headers: { "Authorization": token } });
    const groupId = [];
    for (let i = 0; i < response.data.groupIds.length; i++) {
        groupId.push(response.data.groupIds[i].groupId);
    }
    for (let i = 0; i < response.data.groupDetails.length; i++) {
        groupCreated(response.data.groupDetails[i], groupId[i]);
    }

}

function groupCreated(groupName, groupId) {
    const groupList = document.querySelector('.list-group');
    const newGroup = document.createElement('li');
    newGroup.innerHTML = `${groupName}<button class="manage-users-button btn btn-primary" style="float:right;">Manage Users</button>`;
    newGroup.classList.add('contact-names');
    newGroup.setAttribute('data-group-id', groupId);
    groupList.appendChild(newGroup);
}

const addUserModal = document.getElementById('addMemberModal');
const addUserBtn = document.getElementById('addUserBtn');
addUserBtn.addEventListener('click', async () => {
    try {
        const groupName = document.getElementById('groupName1').value;
        const users = document.getElementById('emailAddress').value;
        if(groupName === "" || users === "") {
            return alert('Please Enter field');
        }
        const groupDetails = {
            name: groupName,
            userToBeAdd: users
        };
        const token = localStorage.getItem('token');
        const response = await axios.post(`${backendApi}/group/add-user`, groupDetails, { headers: { "Authorization": token } });
        window.location.href = 'homepage.html';
        alert(response.data.message);
    }
    catch (err) {
        const error = err.response.data.error;
        alert(error);
    }
})


document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.querySelector('.list-container');
    const manageUsersModal = document.querySelector('.manage-users-modal');

    listContainer.addEventListener('click', async (event) => {
        const clickedItem = event.target.closest('.contact-names');
        if (clickedItem) {
            const groupId = clickedItem.dataset.groupId;
            const userList = document.querySelector('.user-list');
            const manageUsersButton = clickedItem.querySelector('.manage-users-button');
            manageUsersButton.addEventListener('click', async () => {

                const token = localStorage.getItem('token');
                const usersOfGroups = await axios.get(`${backendApi}/group/get-users/${groupId}`, { headers: { "Authorization": token } })
                const userNames = usersOfGroups.data.memberNames;
                const userIds = usersOfGroups.data.memberIds;
                const isAdmin = usersOfGroups.data.isAdmin;
                userList.innerHTML = "";
                for (let i = 0; i < userNames.length; i++) {

                    manageUsersModal.style.display = 'block';
                    const userItem = document.createElement('li');
                    const checkbox = document.createElement('input');
                    checkbox.type = "checkbox";
                    checkbox.classList.add('userIds');
                    checkbox.value = userIds[i];
                    userItem.appendChild(checkbox);

                    const nameLabel = document.createElement('label');
                    if (isAdmin[i] === true) {
                        nameLabel.innerHTML = `<h6 class="mx-2">${userNames[i]}  🅰️</h6>`;
                    }
                    else {
                        nameLabel.innerHTML = `<h6 class="mx-2">${userNames[i]}</h6>`;
                    }

                    userItem.appendChild(nameLabel);
                    userList.appendChild(userItem);
                }
            });
        }
    });

    function commomLines() {
        const userIds = [];
        const userIdChecked = document.querySelectorAll('.userIds');
        let anyChecked = false;
        for (let i = 0; i < userIdChecked.length; i++) {
            if (userIdChecked[i].checked) {
                anyChecked = true;
                userIds.push(userIdChecked[i].value);
            }
        }
        if (!anyChecked) {
            alert("please select a user");
            return null;
        }
        const groupId = localStorage.getItem('activeGroup');
        return userDetails = {
            groupId: groupId,
            userIds: userIds
        }
    }

    const makeAdminBtn = document.querySelector('.make-admin-button');
    makeAdminBtn.addEventListener('click', async () => {
        try {
            commomLines();
            const token = localStorage.getItem('token');
            const response = await axios.post(`${backendApi}/group/make-admin`, userDetails, { headers: { "Authorization": token } });
            if (response.data.success) {
                alert(response.data.message);
                window.location.href = "homepage.html";
            }
        }
        catch (err) {
            const errMessage = err.response.data.error;
            alert(errMessage);
        }
    })

    const removeUserBtn = document.querySelector('.remove-user-button');
    removeUserBtn.addEventListener('click', async () => {
        try {
            commomLines();
            const token = localStorage.getItem('token');
            const response = await axios.delete(`${backendApi}/group/remove-user`, { data: userDetails, headers: { "Authorization": token } });
            if (response.data.success) {
                alert(response.data.message);
                window.location.href = "homepage.html";
            }
        }
        catch (err) {
            const errMessage = err.response.data.error;
            alert(errMessage);
        }
    })

    const removeAdminBtn = document.querySelector('.remove-admin-button');
    removeAdminBtn.addEventListener('click', async () => {
        try {
            commomLines();
            const token = localStorage.getItem('token');
            const response = await axios.post(`${backendApi}/group/remove-admin`, userDetails, { headers: { "Authorization": token } });
            if (response.data.success) {
                alert(response.data.message);
                window.location.href = "homepage.html";
            }
        }
        catch (err) {
            const errMessage = err.response.data.error;
            alert(errMessage);
        }
    })

    const closeButton = manageUsersModal.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
        manageUsersModal.style.display = 'none';
    });
});

const deleteGrouprModal = document.getElementById('deleteGroupModal');
const deleteGroupBtn = document.getElementById('deleteGroupBtn');
deleteGroupBtn.addEventListener('click', async () => {
    try {
        const groupName = document.getElementById('groupName2').value;
        if(groupName === "") {
            return alert('Please Enter field');
        }
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${backendApi}/group/delete-group/${groupName}`, { headers: { "Authorization": token } });
        window.location.href = 'homepage.html';
        alert(response.data.message);
    }
    catch (err) {
        const error = err.response.data.error;
        alert(error);
    }
})
