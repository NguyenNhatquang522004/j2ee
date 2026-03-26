const http = require('http');

const loginData = JSON.stringify({
    username: 'thanhtoan',
    password: 'Thanhtoan6924@'
});

const loginReq = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
    }
}, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        const data = JSON.parse(body);
        if (data.data && data.data.token) {
            testUpdate(data.data.token);
        } else {
            console.error('Login failed:', body);
        }
    });
});

loginReq.write(loginData);
loginReq.end();

function testUpdate(token) {
    const updateData = JSON.stringify({
        email: 'thanhtoan06092004@gmail.com',
        fullName: 'DANG THANH TOAN TEST NODE',
        phone: '0869426904',
        dateOfBirth: '2004-09-06',
        gender: 'male'
    });

    const updateReq = http.request({
        hostname: 'localhost',
        port: 5050,
        path: '/api/v1/users/me',
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
            'Content-Length': updateData.length
        }
    }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
            console.log('Update Result:', body);
        });
    });

    updateReq.write(updateData);
    updateReq.end();
}
