<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// DB 연결
require_once 'config.php';

// Create Connection
$connect = mysqli_connect($servername, $username, $password, $dbname);
// Check Connection
if (!$connect) {
    die("Connection failed: " . mysqli_connect_error());
}

$messages = array();

$sql = "SELECT nickname, message FROM messages ORDER BY id ASC";
$result = mysqli_query($connect, $sql);

if(mysqli_num_rows($result) > 0){
    while($row = mysqli_fetch_assoc($result)){
       $messages[] = $row; 
    }
    echo json_encode($messages);


}

mysqli_close($connect);

?>