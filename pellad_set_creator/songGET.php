<?php
header("Access-Control-Allow-Origin: *");
// if ($http_origin == "http://www.domain1.com" || $http_origin == "http://www.domain2.com" || $http_origin == "http://www.domain3.com")
// {  
//     header("Access-Control-Allow-Origin: $http_origin");
// }
$query = "SELECT * FROM songs";
$mysqli = new mysqli("localhost", "texflip", "", "my_texflip");
$res = $mysqli->query($query);
$rows = $res->fetch_all(MYSQLI_ASSOC);
echo json_encode($rows);
?>
