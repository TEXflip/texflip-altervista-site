<?php
	//include "loadSongs.php";
    header('Content-type: application/json');
    
    $aResult = array();
    $_POST = json_decode(file_get_contents("php://input"), true);
    $mysqli = new mysqli("localhost", "texflip", "", "my_texflip");
    if(!isset($_POST['type'])) { $aResult['error'] = 'No operation type!'; }
    if(!isset($_POST['songname'])) { $aResult['error'] = 'No song name!'; }
    if(!isset($aResult['error'])) {
		switch ($_POST['type']){
        	case 'add':
            	if(!isset($_POST['duration'])) { $aResult['error'] = 'No duration argument!'; }
                else {
                    $stmt = $mysqli->prepare("INSERT INTO `songs`(`songname`, `duration`) VALUES (?,?)");
                    $stmt->bind_param("si", $_POST['songname'], $_POST['duration']);
                    $stmt->execute();
                    $stmt->close();
                }
            break;
            case 'del':
				$stmt = $mysqli->prepare("DELETE FROM `songs` WHERE songname=?");
                $stmt->bind_param("s", $_POST['songname']);
                $stmt->execute();
                $stmt->close();
            break;
        }
    }

    echo json_encode($_POST);

?>