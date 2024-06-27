const express = require('express');
const mysql = require('mysql');
const router = express.Router();

// 데이터베이스 연결 설정은 이 파일에서 직접 하거나, 외부에서 가져올 수 있습니다.
const db_config = require('../db-config.json');
const connection = mysql.createPool({
    connectionLimit: 50,
    host: db_config.host,
    user: db_config.user,
    password: db_config.password,
    database: db_config.database,
});



router.post('/load-message', (req, res) => {
    const { user_id, room_id } = req.body;

    const query = 'SELECT * FROM messages WHERE room_id = ? ORDER BY timestamp';

    const updateUnread = 'UPDATE join_table SET unread = 0 WHERE room_id = ? AND user_id = ?';
    // SQL 쿼리 실행
    connection.query(query, [room_id], (error, results) => {
        if (error) {
            console.error('DB 쿼리 실행 실패:', error);
            res.status(500).send('Database error');
            return;
        }
        connection.query(updateUnread, [room_id, user_id], (updateError) => {
            if(updateError) {
                console.error('unread 업데이트 실패:', error);
            }
            res.json(results);
        });
        
    });
});


module.exports = router;