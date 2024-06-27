const express = require('express');
const mysql = require('mysql');
const session = require('express-session');
const path = require('path');



const app = express();
const port = 8001;
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.json({
    limit: "50mb"
}));
app.use(express.urlencoded({
    limit: "50mb",
    extended: false
}));

app.use(session({
    secret: 'sbar',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// MySQL 연결 설정
const db_config = require('./db-config.json');
const connection = mysql.createPool({
    connectionLimit: 50,
    host: db_config.host,
    user: db_config.user,
    password: db_config.password,
    database: db_config.database,
});

connection.on('connection', function (c) {
    console.log('DB Connection success');

    c.on('error', function (err) {
        console.error(new Date(), 'MySQL error', err.code);
    });
    c.on('close', function (err) {
        console.error(new Date(), 'MySQL close', err);
    });
});




server.listen(port, () => {
    console.log(`서버가 sbar.nehub.info:${port} 에서 실행 중입니다.`);
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/login.html');
});

app.use(require('./routes/login'));
app.use(require('./routes/elderly'));
app.use(require('./routes/show_users'));
app.use(require('./routes/message_save'));
app.use(require('./routes/message_load'));
app.use(require('./routes/chat'));
app.use(require('./routes/admin_login'));




//socket.io 사용
io.on('connection', function (socket) {
    // 메시지 수신
    socket.on('msg', function (data) {

        const { room_id, user_id, message } = data;
    });

    socket.on('updatestamp', async (data) => {
        console.log(data);

        const { user_id, room_id, lastseen, } = data;
        try {
            const query = `UPDATE join_table SET lastseen = ? WHERE user_id = ? AND room_id = ?`;
            const values = [lastseen, user_id, room_id];
            const result = await connection.query(query, values);
        } catch (err) {
            console.error('데이터베이스 오류:', err);
        }

    });

    socket.on('updatestamp_back', async (data) => {
        console.log(data);

        const { user_id, room_id, lastseen } = data;
        try {
            const query = `UPDATE join_table SET lastseen = ?, unread = 0 WHERE user_id = ? AND room_id = ?`;
            const values = [lastseen, user_id, room_id];
            const result = await connection.query(query, values);
        } catch (err) {
            console.error('데이터베이스 오류:', err);
        }

    });

    socket.on('request_unread', async (data) => {
        const { user_id, room_id } = data;
        const query = `SELECT unread FROM join_table WHERE user_id = ? AND room_id = ?`;

        connection.query(query, [user_id, room_id], (error, results, fields) => {
            if (error) {
                console.error('Error:', error);
                return;
            }
            if (results.length > 0) {
                const unread = results[0].unread;
                socket.emit('update_unread', { room_id, unread });
            } else {
                socket.emit('update_unread', { room_id, unread: 0 });
            }
        });
    });

    socket.on('request_unread_all', async (data) => {
        const { user_id } = data;
        const query = `SELECT SUM(unread) As totalunread FROM join_table WHERE user_id = ?`;

        connection.query(query, [user_id], (error, results, fields) => {
            if (error) {
                console.error('Error:', error);
                return;
            }
            const totalunread = results[0] ? results[0].totalunread : 0;
            socket.emit('update_unread_all', { totalunread });

            if (totalunread > 0) {
                // 사용자의 토큰을 조회
                const tokenQuery = `SELECT token FROM sbar_user WHERE user_id = ?`;
                connection.query(tokenQuery, [user_id], (err, tokenResults) => {
                    if (err) {
                        console.error('Error token:', err);
                        return;
                    }
                    if (tokenResults.length > 0) {
                        const token = tokenResults[0].token;
                        sendPushNotification(token, '새 메시지 알림', `읽지 않은 메시지가 ${totalunread}개 있습니다.`);
                    }
                });
            }
            
        });
    });
    socket.on('registerToken', (data) => {
        const { user_id, token } = data;
        const query = `UPDATE sbar_user SET token = ? WHERE user_id = ?`;
        connection.query(query, [token, user_id], (error) => {
            if(error){
                console.error('Error updating token:', err);
            }
            else {
                console.log('Token updated for user:', user_id);
            }
        });
        console.log('Received token for user:', data.user_id, 'Token:', data.token);
    })

    socket.on('disconnect', function () {

    });
});




//io쓰기 위해서 메인으로 가져왔음(출처: message_save.js)
app.post('/save-message', (req, res) => {
    const { user_id, message, room_id, image, last_message_time, grouped } = req.body; // 요청 본문에서 데이터 추출

    // 메시지 데이터를 데이터베이스에 저장하는 SQL 쿼리
    const query = 'INSERT INTO messages (user_id, message, room_id, image, grouped ) VALUES (?, ?, ?, ?, ?)';

    // SQL 쿼리 실행
    connection.query(query, [user_id, message, room_id, image, grouped], (error, results) => {
        if (error) {
            console.error('DB 쿼리 실행 실패:', error);
            res.status(500).send('Database error');
            return;
        }
        //last message 업데이트
        const updateQuery = 'UPDATE join_table SET last_message = ?, last_message_time = ? WHERE room_id = ?';
        connection.query(updateQuery, [message, last_message_time, room_id], (updateError, updateResults) => {
            if (updateError) {
                console.error('DB 업데이트 실패:', updateError);
                return res.status(500).json({ error: 'DB 업데이트 실패' });
            }



            const update_unread_for_senders = 'UPDATE join_table SET lastseen = ? WHERE room_id = ? AND user_id = ?';
            connection.query(update_unread_for_senders, [last_message_time, room_id, user_id], (aError, aResults) => {
                if (aError) {
                    console.error('DB 업데이트 실패:', updateError);
                    return res.status(500).json({ error: 'DB 업데이트 실패' });
                }

                console.log(`Updating with room_id: ${room_id}, user_id: ${user_id}, last_message_time: ${last_message_time}`);
                const updateUnread = 'UPDATE join_table SET unread = unread + 1 WHERE room_id = ? AND user_id != ? AND lastseen < ?';
                connection.query(updateUnread, [room_id, user_id, last_message_time], (upreadError, upreadResults) => {
                    if (upreadError) {
                        console.error('DB 업데이트 실패:', upreadError);
                        return res.status(500).json({ error: 'DB 업데이트 실패' });

                    }
                });
                io.emit('new_message', { user_id, message, room_id, image });
                io.emit('last_message', { room_id, message, last_message_time });
                res.send(results);

            })


        });
    });
});



//test
app.get('/download-messages', (req, res) => {
    const query = 'SELECT * FROM messages';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('DB 쿼리 실행 실패:', error);
            return res.status(500).send('Database error');
        }

        // CSV 형식으로 데이터 변환
        let csvContent = 'message_id,room_id,user_id,message,timestamp,image,grouped\r\n';

        // 데이터 각 행 처리
        function removeHtmlTags(str) {
            return str.replace(/<[^>]*>/g, '');
        }

        results.forEach(row => {
            const room_id = `"${row.room_id}"`;
            const cleanMessage = `"${removeHtmlTags(row.message).replace(/"/g, '""')}"`; // HTML 태그를 제거하고, 큰따옴표를 이스케이프 처리합니다.
            const image = row.image ? `"${row.image.replace(/"/g, '""')}"` : '';
            const grouped = row.grouped ? `"${row.grouped}"` : '';

            csvContent += `${row.message_id},${room_id},${row.user_id},${cleanMessage},${row.timestamp},${image},${grouped}\r\n`;
        });

        // CSV 파일로 보내기
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=messages.csv');
        return res.send(csvContent);
    });
});



const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Firebase Admin 초기화
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://test-sbar-default-rtdb.firebaseio.com"
});



// 푸시 알림을 보내는 함수
function sendPushNotification(deviceToken, title, body) {
    // 토큰 유효성 검사
    if (!deviceToken) {
        console.error('No device token provided');
        return;
    }
    const message = {
        notification: {
            title: title,
            body: body
        },
        token: deviceToken
    };
    console.log('메시지 잘 들어있는지 테스트: ', message);

    admin.messaging().send(message)
        .then((response) => {
            console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.error('Error sending message:', error);
        });
}