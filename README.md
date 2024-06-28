<h1>SBAR APP</h1>
<img src="image/144x144.png" alt="Example Image" style="width:128px;">
<br>
<br>

<h2>Project Overview</h2>
<p>다이어리와 채팅방 모바일 앱 구현</p>
<p>개발기간: 2024.2.14 ~ 2024.5.17 </p>
<br>
<br>

<h2>배포 주소</h2>
<p>공식 주소: https://sbar.nehub.info</p>
<p>Admin 계정 주소: https://sbar.nehub.info/admin/admin_login.html</p>
<br>
<br>

<h2>시작 가이드</h2>
<h3>설치 방법</h3>


<img width="142" alt="mail naver" src="https://github.com/sherlock216/SBAR_APP/assets/86870994/eee01a7c-10af-42cf-b46f-a7ba36748b0c">

<img width="142" alt="mail naver" src="https://github.com/sherlock216/SBAR_APP/assets/86870994/b13cae19-78e2-4b51-a5b5-bf828cb2082f">

<p>프로그래시브 웹앱(pwa)방식으로 구현되어, 스토어에서 앱 설치하는 방식이 아닌 웹 브라우저에서 홈 화면에 추가하는 방식입니다.</p>
<p>안드로이드 모바일: 홈 화면에 추가</p>
<p>PC: 오른쪽 위 설치 버튼</p>
<p>앱 설치를 권장드리나 웹 사이트에서도 작동합니다.</p>
<br>

<h3>테스트 샘플 데이터</h3>
<p>Private for Security</p>
<br>

<h3>기능 소개</h3>

|                 | 안드로이드                   | iOS                      | 윈도우 데스크탑 PC           |
|-----------------|------------------------------|--------------------------|------------------------------|
| 앱 설치, 채팅사용         | O                            | O                        | O                            |
| 푸시 알림       | O                            | X                        | O                            |
| 자동 로그아웃   | X (로그아웃 버튼 눌러주세요) | X (로그아웃 버튼 눌러주세요) | O                            |

<ol>
  <li>메시지 보내기: 특정 그룹에 보내거나, 특정 사람에게 보낼 수 있음</li>
  <li>받은 메시지: 같은 그룹인 사람들끼리 묶인 방(socket.io)</li>
  <li>문의사항: 상담사(admin)와의 1대1방(socket.io)</li>
  <li>실시간 푸시 알림 구현(google FCM)</li>
</ol>
<br>
<br>

<h2>Stacks</h2>
<h3>Environment</h3>
<img src="https://img.shields.io/badge/visual studio code-007ACC?style=for-the-badge&logo=visual studio code&logoColor=white">
<img src="https://img.shields.io/badge/git-F05032?style=for-the-badge&logo=git&logoColor=white">
<img src="https://img.shields.io/badge/github-181717?style=for-the-badge&logo=github&logoColor=white">
<br>


<h3>Development</h3>
<img src="https://img.shields.io/badge/html5-E34F26?style=for-the-badge&logo=html5&logoColor=white">
<img src="https://img.shields.io/badge/css-1572B6?style=for-the-badge&logo=css3&logoColor=white">
<img src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
<img src="https://img.shields.io/badge/mariaDB-003545?style=for-the-badge&logo=mariaDB&logoColor=white">
<img src="https://img.shields.io/badge/mysql-4479A1?style=for-the-badge&logo=mysql&logoColor=white">
<p>MariaDB and MYSQL is used with Cafe24 DB</p>
<img src="https://img.shields.io/badge/firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=white">
<img src="https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white">
<img src="https://img.shields.io/badge/express.js-000000?style=for-the-badge&logo=express&logoColor=white"/>
<img src="https://img.shields.io/badge/socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white">
<br>

<h3>Program Tools</h3>
<p>Putty, Filezilla</p>
<br>

<h3>Others</h3>
<p>SessionStorage(for saving data temporarily and using in page)</p>
<p>PWA(manifest.json, service-worker.js etc) for making webapp</p>
<img src="https://img.shields.io/badge/nginx-009639?style=for-the-badge&logo=nginx&logoColor=white">
<p>Nginx is used for replacing HTTP to HTTPS</p>
<br>
<br>

<h2>유의사항</h2>
<p>웹 호스팅은 AWS로 되어있고, DB만 Cafe24를 사용하고 있습니다.</p>
<p>처음에 Cafe24 웹호스팅을 썼다가 크기가 큰 node_modules 업로드로 인해 용량이 초과되어 사용이 불가해졌기 때문입니다.</p>
<p>로그아웃 버튼 누르지 않으면 token이 계속 살아있어서 알림이 계속 옵니다. 로그아웃 버튼을 누르면 token이 사라져서 알림이 안 옵니다.</p>
<br>
<br>

<h2>ERD 다이어그램</h2>
<img src="erd.jpg" alt="Example Image" style="width:700px;">

