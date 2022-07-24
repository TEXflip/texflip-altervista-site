<?php
    header('Content-Type: application/json');
    header('Access-Control-Allow-Headers: Content-Type');
    header("Access-Control-Allow-Origin: *");
    
    $aResult = array();
    $_POST = json_decode(file_get_contents("php://input"), true);
    $mysqli = new mysqli("localhost", "texflip", "", "my_texflip");
    if(!isset($_POST['type'])) { $aResult['error'] = 'No operation type!'; }
    if(!isset($aResult['error'])) {
		switch ($_POST['type']){
        	case 'save':
            	if(!isset($_POST['songs'])) { $aResult['error'] = 'No duration argument!'; }
                else {
                    $stmt = $mysqli->prepare("INSERT INTO `setlists`(`name`, `songs`) VALUES (?,?)");
                    $stmt->bind_param("ss", $_POST['name'], $_POST['songs']);
                    $stmt->execute();
                    $stmt->close();
                }
            break;
            case 'del':
                if(!isset($_POST['name'])) { $aResult['error'] = 'No name argument!'; }
                else{
                    $stmt = $mysqli->prepare("DELETE FROM `setlists` WHERE `name`=?");
                    $stmt->bind_param("s", $_POST['name']);
                    $stmt->execute();
                    $stmt->close();
                }
            break;
        }
    }

    echo json_encode($_POST);

?>