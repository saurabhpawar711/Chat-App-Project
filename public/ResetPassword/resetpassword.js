const backendApi = "http://16.170.78.233:3000";
const resetBtn = document.getElementById('resetBtn');

resetBtn.addEventListener('click', changePassword);

async function changePassword(event) {

    event.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('uI');
    const uuid = urlParams.get('u');

    const changedPassword = document.getElementById('typePassword').value;
    const newPassword = {
        newPassword: changedPassword
    };

    document.getElementById('typePassword').value = "";
    try {
        const response = await axios.post(`${backendApi}/password/updatepassword/${userId}`, newPassword);
        if (response.data.success) {
            alert(response.data.message);
            window.location.href = '../Login/login.html';
        }
    }
    catch (err) {
        console.log(err);
        const errorMessage = err.response.data.error;
        if (errorMessage) {
            alert(errorMessage);
        }
    }
}