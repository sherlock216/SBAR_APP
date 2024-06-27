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

router.post('/show_users', (req, res) => {
    const { name, job_receiver, grouped } = req.body;

    const check = 'SELECT * FROM sbar_user WHERE job = ? AND name != ? AND grouped = ? ORDER BY name';

    connection.query(check, [job_receiver, name, grouped], (error, results) => {
        if (error) {
            console.error('DB 오류:', error);
            return res.status(500).send('Database error');
        }
        res.json(results);

    })
})

router.post('/show_badge', (req, res) => {
    const { user_id } = req.body;

    const get_badge = 'SELECT unread FROM join_table WHERE user_id = ?';

    connection.query(get_badge, [user_id], (get_error, get_results) => {
        if (get_error) {
            console.error('DB 오류:', get_error);
            return res.status(500).send('Database error');
        }
        res.json(get_results);
    })
})


module.exports = router;