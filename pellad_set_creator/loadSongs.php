<?php
$query = "SELECT * FROM songs";
$mysqli = new mysqli("localhost", "texflip", "", "my_texflip");
$res = $mysqli->query($query);
$rows = $res->fetch_all(MYSQLI_ASSOC);
echo json_encode($rows);
?>
