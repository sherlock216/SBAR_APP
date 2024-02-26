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

$data = json_decode(file_get_contents('php://input'), true);

$nickname = mysqli_real_escape_string($connect, $data['nickname']);
$message = mysqli_real_escape_string($connect, $data['message']);

$sql = "INSERT INTO messages (nickname, message) VALUES ('$nickname', '$message')";

if(mysqli_query($connect, $sql)){
    echo json_encode($message);
}
else{
    echo ("failed.." . mysqli_error($connect));
}

mysqli_close($connect);

?>