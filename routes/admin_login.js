const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const router = express.Router();

const session = require('express-session');

const db_config = require('../db-config.json');
const connection = mysql.createPool({
    connectionLimit: 50,
    host: db_config.host,
    user: db_config.user,
    password: db_config.password,
    database: db_config.database,
});

router.post('/admin_login', (req, res) => {

    const { user_id, userPassword } = req.body;

    const query = 'SELECT * FROM admin_user WHERE id = ?';
    connection.query(query, [user_id], (error, results, fields) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: '데이터베이스 에러' });
            return;
        }

        bcrypt.compare(userPassword, results[0].password, (err, isMatch) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: '내부 서버 에러' });
                return;
            }

            if (!isMatch) {
                res.status(401).json({ error: '비밀번호를 틀렸습니다.' });
            }
            else {
                req.session.user = { id: results[0].id };
                req.session.save(() => {
                    res.status(200).json({ message: '로그인 성공' });
                })
            }

        });


    });

});

function isAuthenticated(req, res, next) {
    if (!req.session.user) {
        res.status(401).json({ error: '인증되지 않았습니다.' });
        return;
    }
    next();
}

router.get('/show_all', isAuthenticated, (req, res) => {

    const query = 'SELECT * FROM sbar_user ORDER BY grouped ASC';
    connection.query(query, [], (error, results, fields) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: '데이터베이스 에러' });
            return;
        }

        const rows = results.map(row => {
            return {
                user_id: row.user_id,
                name: row.name,
                job: row.job,
                grouped: row.grouped
            };
        });
        res.json(rows);
    });

});


router.delete('/delete_user/:user_id', isAuthenticated, (req, res) => {

    const { user_id } = req.params;

    const query = 'DELETE FROM sbar_user WHERE user_id = ?';


    connection.query(query, [user_id], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: '데이터베이스 에러' });
            return;
        }


        const select_room = 'SELECT room_id FROM join_table WHERE user_id = ?';
        connection.query(select_room, [user_id], (error, room_results) => {
            if (room_results.length > 0) {
                const roomIds = room_results.map(row => row.room_id);

                const delete_room = 'DELETE FROM join_table WHERE room_id IN (?)';
                connection.query(delete_room, [roomIds], (error, deleteResults) => {
                    if (error) {
                        console.error(error);
                        res.status(500).json({ error: '데이터베이스 에러' });
                        return;
                    }
                    const delete_message_room = 'DELETE FROM messages WHERE room_id IN (?)';
                    connection.query(delete_message_room, [roomIds], (error, deleteMessageResults) => {
                        if (error) {
                            console.error(error);
                            res.status(500).json({ error: '데이터베이스 에러' });
                            return;
                        }
                        const delete_chat_room = 'DELETE FROM chat_room WHERE room_id IN (?)';
                        connection.query(delete_chat_room, [roomIds], (error, deleteChatRoomResults) => {
                            if (error) {
                                console.error(error);
                                res.status(500).json({ error: '데이터베이스 에러' });
                                return;
                            }
                            const delete_chat_room = 'DELETE FROM elderly WHERE user_id IN (?)';
                            connection.query(delete_chat_room, [user_id], (error, deleteElderlyResults) => {
                                if (error) {
                                    console.error(error);
                                    res.status(500).json({ error: '데이터베이스 에러' });
                                    return;
                                }
                                res.json({ message: '삭제 성공' })
                            });

                        });

                    });
                });
            } else {
                res.status(404).json({ message: '해당 사용자와 관련된 room_id 없음' });
            }

        });

    });
});



router.post('/save_user', isAuthenticated, (req, res) => {

    const { user_id, name, job, grouped } = req.body;

    const query = 'INSERT INTO sbar_user (user_id, name, job, grouped) VALUES (?, ?, ?, ?)';
    connection.query(query, [user_id, name, job, grouped], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: '데이터베이스 에러' });
            return;
        }
        const confirmation = 'SELECT room_id FROM chat_room WHERE grouped = ? AND what_job = ?';
        connection.query(confirmation, [grouped, job], (error, cresults) => {
            if (error) {
                console.error(error);
                res.status(500).json({ error: '데이터베이스 에러' });
                return;
            }

            if (cresults.length > 0) {
                const roomId = cresults[0].room_id;
                const insertJoin = 'INSERT INTO join_table (room_id, user_id, lastseen, last_message, unread, last_message_time, grouped) VALUES (?, ?, NOW(), ?, ?, NOW(), ?)';
                connection.query(insertJoin, [roomId, user_id, '', 0, grouped], (error, iresults) => {
                    if (error) {
                        console.error(error);
                        return res.status(500).json({ error: 'join_table에 사용자 추가 에러' });
                    }
                    return res.json({ message: '추가 성공' });
                });
            } else {
                res.json({ message: '추가 성공~' });
            }

        });
    });
})

router.get('/logout', (req, res) => {
    // 세션 파괴
    req.session.destroy(err => {
        if (err) {
            console.error("세션 파괴 중 오류 발생", err);
            res.status(500).send("로그아웃 중 오류 발생");
            return;
        }
        res.status(200).json({ message: "로그아웃 성공" });
    });
});



module.exports = router;