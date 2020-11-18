<?php
include "config.php";
// get request data
$post=file_get_contents("php://input");
$json = json_decode($post);
$email= $json->email;
$nom=$json->nom;
$prenom=$json->prenom;
$date=date('Y-m-d',strtotime($json->date));
$key=$post;
//check data
//insert in Database

$sql = "INSERT INTO keys_tbl(email,cle,nom,prenom,date)
VALUES ('".$email."','". $key."','". $nom."','".$prenom."','".$date."')";

if ($dbConnection->query($sql) === TRUE) {
  echo json_encode(array("status" => "ok") );
//  echo "New record created successfully";
} else {
  echo json_encode(array('error' =>$dbConnection->error  ));
  //echo "Error: " . $sql . "<br>" . $dbConnection->error;
}

$dbConnection->close();


$return_arr=array("status" => "ok");
// Encoding array in JSON format
echo json_encode($return_arr);
 ?>
