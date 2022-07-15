<?php
    header('content-type: application/json');
    header("Access-Control-Allow-Origin: *");
    
    $aResult = array();
    $_POST = json_decode(file_get_contents("php://input"), true);
    $mysqli = new mysqli("localhost", "texflip", "", "my_texflip");
    if(!isset($_POST['type'])) { $aResult['error'] = 'No operation type!'; }
    if(!isset($_POST['name'])) { $aResult['error'] = 'No song name!'; }
    if(!isset($aResult['error'])) {
		switch ($_POST['type']){
        	case 'add':
            	if(!isset($_POST['duration'])) { $aResult['error'] = 'No duration argument!'; }
                else {
                    $stmt = $mysqli->prepare("INSERT INTO `songs`(`name`, `duration`, `isCover`) VALUES (?,?,?)");
                    $stmt->bind_param("sii", $_POST['name'], $_POST['duration'], $_POST['isCover']);
                    $stmt->execute();
                    $stmt->close();
                }
            break;
            case 'del':
				$stmt = $mysqli->prepare("DELETE FROM `songs` WHERE name=?");
                $stmt->bind_param("s", $_POST['name']);
                $stmt->execute();
                $stmt->close();
            break;
        }
    }

    echo json_encode($_POST);

?>