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

// 로그인 처리
router.post('/login', (req, res) => {
    const { username } = req.body;
    console.log(req);

    // DB에서 사용자 정보 확인
    const query = 'SELECT * FROM sbar_user WHERE user_id = ?';
    connection.query(query, [username], (error, results) => {
        if (error) {
            console.error('DB 오류:', error);
            res.status(500).send('Database error');
            return;
        }

        if (results.length > 0) {
            // 로그인 성공
            const user = {
                user_id: results[0].user_id,
                name: results[0].name,
                job: results[0].job,
                grouped: results[0].grouped
            }
            //req.session.user = { username };
            res.status(200).json(user);
        } else {
            // 로그인 실패
            const fail = {
                user_id : 'fail'
            }
            res.status(401).json(fail);
        }
    });
});


router.post('/user_logout', (req, res) => {
    const { username } = req.body;
    const query = 'UPDATE sbar_user SET token = NULL WHERE user_id = ?';
    connection.query(query, [username], (error) => {
        if(error){
            console.error('DB 오류:', error);
            res.status(500).send('Database error');
        } else {
            console.log('Token 제거완료: ', username);
            res.status(200).send('Logout');
        }
    });
});
module.exports = router;
