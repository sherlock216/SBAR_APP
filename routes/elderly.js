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

// '/show_all' 경로에 대한 처리
router.post('/show_all', (req, res) => {
    const { user } = req.body;
    const query = 'SELECT * FROM elderly WHERE user_id = ? ORDER BY elderly';
    connection.query(query, [user], (error, results) => {
        if (error) {
            console.error('DB 오류:', error);
            res.status(500).send('Database error');
            return;
        }
        res.json(results);
    });
});


router.post('/show_sth', (req, res) => {
    const { user, input } = req.body;
    // DB에서 사용자 정보 확인
    let query = 'SELECT * FROM elderly WHERE user_id = ? AND elderly = ?';

    query += 'ORDER BY elderly';

    connection.query(query, [user, input], (error, results) => {
        if (error) {
            console.error('DB 오류:', error);
            res.status(500).send('Database error');
            return;
        }
        res.json(results);
    });
});



router.post('/save', (req, res) => {
    const { user, name, stair } = req.body;

    const check = 'SELECT user_id FROM elderly WHERE user_id = ? AND elderly = ? AND stair = ?';

    connection.query(check, [user, name, stair], (error, results) => {
        if (error) {
            console.error('DB 오류:', error);
            return res.status(500).send('Database error');
        }

        if (results.length == 1) {
            return res.send('이미 있음');
        } else {
            const insert = 'INSERT INTO elderly (user_id, elderly, stair) VALUES (?, ?, ?)';

            connection.query(insert, [user, name, stair], (insertError, insertResults) => {
                if (insertError) {
                    console.error('추가 실패', insertError);
                    return res.status(500).send(insertError);
                }

                res.send('성공');
            });
        }
    })
});



module.exports = router;