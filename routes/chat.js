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
router.post('/show_all_room', (req, res) => {
  const { user_id } = req.body;
  const query =
    `
    SELECT DISTINCT
    cr.room_id, 
    cr.is_group, 
    cr.what_job, 
    CASE
      WHEN cr.is_group = 0 THEN u.name
      ELSE creator.name
    END AS name,
    CASE
      WHEN cr.is_group = 0 THEN u.job
      ELSE creator.job
    END AS job,
    j.user_id, 
    j.last_message, 
    j.last_message_time,
    (SELECT lastseen FROM join_table WHERE user_id = ? AND room_id = cr.room_id) AS lastseen,
    (SELECT SUM(unread) FROM join_table WHERE user_id = ? AND room_id = cr.room_id) AS unread
FROM 
    join_table AS j

JOIN chat_room AS cr ON j.room_id = cr.room_id
JOIN sbar_user AS creator ON cr.creator_id = creator.user_id
LEFT JOIN sbar_user AS u on j.user_id = u.user_id
WHERE 
  j.user_id != ? AND j.room_id IN (SELECT room_id FROM join_table WHERE user_id = ?) 
ORDER BY 
    unread DESC, j.last_message_time DESC;
    `;
  //나와 대화하는 상대 목록 빼오는 SQL문
  connection.query(query, [user_id, user_id, user_id, user_id, user_id], (error, results) => {
    if (error) {
      console.error('DB 오류:', error);
      res.status(500).send('Database error');
      return;
    }
    res.json(results);
  });
});

module.exports = router;