<?php
include "config.php";
// get request data
$post=file_get_contents("php://input");
$json = json_decode($post);
$val=$json->value;

//check data
//insert in Database

$sql = "SELECT nom,prenom FROM  keys_tbl WHERE (nom LIKE '%$val%') OR (prenom LIKE '%$val%')";

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
