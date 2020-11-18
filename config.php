<?php
/****** functions ******/
function table_exists($db, $table)
{
	$result = $db->query("SHOW TABLES LIKE '{$table}'");
	if( $result->num_rows == 1 )
	{
	        return TRUE;
	}
	else
	{
	        return FALSE;
	}
	$result->free();
}

$host = "localhost"; /* Host name */
$user = "mguiddir840"; /* User */
$password = "dc3f5f14"; /* Password */
$dbname = "mguiddir840"; /* Database name */
$dbConnection= mysqli_connect($host, $user, $password,$dbname);
// Check connection
if (!$dbConnection) {
 die("Connection failed: " . mysqli_connect_error());
}
//create table if not exist
$queryCreateTable = "CREATE TABLE IF NOT EXISTS `keys_tbl` (
    `email` VARCHAR(100) NOT NULL ,
    `cle` VARCHAR(1024) NOT NULL,
    `nom` VARCHAR(40) NOT NULL,
    `prenom` VARCHAR(40) NOT NULL,
    `date` DATE,
    PRIMARY KEY ( email )
)";
if(!$dbConnection->query($queryCreateTable)){
    echo "Table creation failed: (" . $dbConnection->errno . ") " . $dbConnection->error;
}
