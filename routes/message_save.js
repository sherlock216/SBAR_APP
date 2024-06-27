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






router.post('/create-room', (req, res) => {
    const { room_id, room_name, user_id, receiver_id, grouped } = req.body;

    const check = 'SELECT room_name FROM chat_room WHERE room_name = ? LIMIT 1';

    connection.query(check, [room_name], (checkerror, checkresults) => {
        if (checkerror) {
            console.error('채팅방 생성 실패:', checkerror);
            res.status(500).send('Database error');
            return;
        }

        if (checkresults.length > 0) {
            console.log('이미 채팅방이 존재합니다', room_name);
            //res.status(201).send('Chat room already exists');
            res.status(201).send({message:'이미 채팅방이 존재합니다'});
            return;
        } else {


            const query = 'INSERT INTO chat_room (room_id, room_name, grouped, creator_id) VALUES (?, ?, ?, ?)';
            connection.query(query, [room_id, room_name, grouped, user_id], (error, results) => {
                if (error) {
                    console.error('채팅방 생성 실패:', error);
                    res.status(500).send('Database error');
                    return;
                }

                //발신자
                const joinQuery = 'INSERT INTO join_table (room_id, user_id, grouped) VALUES (?, ?, ?)';
                connection.query(joinQuery, [room_id, user_id, grouped], (joinError, joinResults) => {
                    if (joinError) {
                        console.error('채팅방에 사용자 추가 실패:', joinError);
                        // 이미 생성된 채팅방을 삭제도 여기에 추가 가능
                        res.status(500).send('Failed to add user to chat room');
                        return;
                    }

                    const join2Query = 'INSERT INTO join_table (room_id, user_id, grouped) VALUES (?, ?, ?)';
                    connection.query(join2Query, [room_id, receiver_id, grouped], (join2Error, join2Results) => {
                        if (join2Error) {
                            res.status(500).send('Failed to add user to chat room');
                            return;
                        }
                    })

                    res.status(201).json({ room_id: room_id, room_name: room_name, user_id: user_id, receiver_id: receiver_id });
                });
            });
        }
    });
});


router.post('/create-room-job', (req, res) => {
    const { room_id, room_name, user_id, receiver_id, grouped } = req.body;

    const check = 'SELECT room_name FROM chat_room WHERE room_name = ? LIMIT 1';

    connection.query(check, [room_name], (checkerror, checkresults) => {
        if (checkerror) {
            console.error('채팅방 생성 실패:', checkerror);
            res.status(500).send('Database error');
            return;
        }

        if (checkresults.length > 0) {
            res.status(201).send({message:'이미 채팅방이 존재합니다'});
            return;
        }


        const query = 'INSERT INTO chat_room (room_id, room_name, grouped, is_group, what_job, creator_id) VALUES (?, ?, ?, ?, ?, ?)';
        connection.query(query, [room_id, room_name, grouped, true, receiver_id, user_id], (error, results) => {
            if (error) {
                console.error('채팅방 생성 실패:', error);
                res.status(500).send('Database error');
                return;
            }

            const myquery = 'INSERT INTO join_table (room_id, user_id, grouped) VALUES (?, ?, ?)';
            connection.query(myquery, [room_id, user_id, grouped], (error, myresults) => {
                if (error) {
                    console.error('채팅방 생성 실패:', error);
                    res.status(500).send('Database error');
                    return;
                }


                //발신자
                // receiver_id와 일치하는 job을 가진 모든 사용자를 sbar_user 테이블에서 찾습니다.
                const selectReceiversQuery = 'SELECT user_id FROM sbar_user WHERE job = ? AND grouped = ?';
                connection.query(selectReceiversQuery, [receiver_id, grouped], (selectError, receiverUsers) => {
                    if (selectError) {
                        console.error('수신자 검색 실패:', selectError);
                        res.status(500).send('Database error');
                        return;
                    }

                    // 모든 수신자에 대해 join_table에 행을 추가합니다.
                    receiverUsers.forEach(user => {
                        const joinReceiverQuery = 'INSERT INTO join_table (room_id, user_id, grouped) VALUES (?, ?, ?)';
                        connection.query(joinReceiverQuery, [room_id, user.user_id, grouped], (joinReceiverError, joinReceiverResults) => {
                            if (joinReceiverError) {
                                console.error('채팅방에 수신자 추가 실패:', joinReceiverError);
                                // 에러 처리 로직을 추가할 수 있습니다. 예를 들어, 실패한 경우 롤백을 고려할 수 있습니다.
                            }


                        });
                    });

                    res.status(201).json({ room_id: room_id, room_name: room_name, user_id: user_id, receiver_id: receiver_id });
                });



            })


        });
    });
});





module.exports = router;