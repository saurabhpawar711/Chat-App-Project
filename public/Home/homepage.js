const backendApi = "http://16.170.78.233:3000";
const displayedMessages = new Set();
const socket = io('http://16.170.78.233:4000');
const form = document.querySelector('#form');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const groupId = localStorage.getItem('activeGroup');
    const message = document.getElementById('message').value;
    const messageDetails = {
        message: message,
        groupId: groupId
    };
    document.getElementById('message').value = "";
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${backendApi}/message/sendmessage`, messageDetails,
            {
                headers: { "Authorization": token }
            }
        );
        if (response.data.success) {
            const message = response.data.message;
            const groupId = localStorage.getItem('activeGroup');
            loadMessages(groupId);
        }
    }
    catch (err) {
        console.log(err);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const listContainer = document.querySelector(".list-container");
    const chatContainer = document.querySelector(".chat");

    listContainer.addEventListener("click", async (event) => {

        const clickedItem = event.target.closest(".contact-names");
        if (clickedItem) {
            const groupId = clickedItem.dataset.groupId;
            updateCurrentGroup(groupId);
            localStorage.setItem('activeGroup', groupId);
            chatContainer.innerHTML = "";
            displayedMessages.clear();
            loadMessages(groupId);
        }
    })
})

async function updateCurrentGroup(groupId) {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${backendApi}/user/groups?groupId=${groupId}`, { headers: { "Authorization": token } });
    const groupName = response.data.groupName;
    const currentGroupNameDiv = document.querySelector('.current-group');
    currentGroupNameDiv.textContent = groupName.name;
}
window.addEventListener('DOMContentLoaded', () => {
    const groupId = localStorage.getItem('activeGroup');
    loadMessages(groupId);
    updateCurrentGroup(groupId);
})

async function loadMessages(groupId) {

    socket.emit('getMessages', groupId);
    socket.on('gotMessages', (messages) => {
        console.log(messages);
        for (let i = 0; i < messages.length; i++) {
            if (!displayedMessages.has(messages[i].id)) {
                showMessage(messages[i]);
                displayedMessages.add(messages[i].id);
            }
        }
    })
}

async function showMessage(message) {

    const chat = document.querySelector('.chat');
    const username = localStorage.getItem('username');
    const newDiv = document.createElement('div');
    const messageDiv = document.createElement('div');
    const nameDiv = document.createElement('div');
    if (isUrl(message.message)) {
        messageDiv.innerHTML = `<a class="urlMsg" href="${message.message}">${message.message}</a>`;
    }
    else {
        messageDiv.innerHTML = message.message;
    }
    nameDiv.innerHTML = message.name;

    if (username === message.name) {
        newDiv.classList.add('receiver');
        messageDiv.classList.add('message-receiver');
    }
    else {
        newDiv.classList.add('sender');
        nameDiv.classList.add('sender-name');
        messageDiv.classList.add('message-sender');
        newDiv.appendChild(nameDiv);
    }
    newDiv.appendChild(messageDiv);
    chat.appendChild(newDiv);
}

function isUrl(message) {
    try {
        new URL(message);
        return true;
    } catch (error) {
        return false;
    }
}

const mediaSharingBtn = document.querySelector('.document-sharing');
mediaSharingBtn.addEventListener('click', uploadMedia);

function uploadMedia() {

    const fileShare = document.createElement('input');
    fileShare.type = "file";
    fileShare.click();
    fileShare.addEventListener('change', (event) => {
        const file = event.target.files[0];
        const fileType = file.type;
        const fileExtension = file.name.split('.')[1];
        const groupId = localStorage.getItem('activeGroup');
        const token = localStorage.getItem('token');
        socket.emit('upload', file, fileExtension, groupId, fileType, token);

        socket.on('fileUrl', (data) => {
            const url = data.message;
            const imageMessage = {
                id: data.id,
                name: data.name,
                message: `<a href="${url}">${url}</a>`
            };
            showMessage(imageMessage);
        })
    })
}