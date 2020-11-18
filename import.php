<?php
include "config.php";
// get request data
$post=file_get_contents("php://input");
$json = json_decode($post);
$nom=$json->nom;
$prenom=$json->prenom;

//check data
//insert in Database

$sql = "SELECT * FROM  keys_tbl WHERE (nom LIKE '%$nom%') OR (prenom LIKE '%$prenom%')";

$result = $dbConnection->query($sql);

if ($result->num_rows > 0) {
  $rows = array();
  // output data of each row
  while($row = $result->fetch_assoc()) {
     $rows[] = $row;
  }
 echo  json_encode(array("data" => $rows));
} else {
  echo json_encode(array("data" => array()));
}
$dbConnection->close();
 ?>
