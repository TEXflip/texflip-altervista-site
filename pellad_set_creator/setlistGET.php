<?php
header("Access-Control-Allow-Origin: *");
$mysqli = new mysqli("localhost", "texflip", "", "my_texflip");
if(isset($_GET['name'])) {
    $stmt = $mysqli->prepare("SELECT * FROM `setlists` WHERE `name`=?");
    $stmt->bind_param("s", $_GET['name']);
    $stmt->execute();
}
else{
    $stmt = $mysqli->prepare("SELECT `name` FROM `setlists`");
    $stmt->execute();
}
$res = $stmt->get_result();
$rows = $res->fetch_all(MYSQLI_ASSOC);
$stmt->close();
echo json_encode($rows);
?>
