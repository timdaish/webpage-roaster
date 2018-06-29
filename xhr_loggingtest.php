<?php
include "basic.php";
// read parameters
$server = $_REQUEST['sv'];
$testid = $_REQUEST['id'];
//echo "getting metadata from " . $fn . PHP_EOL;


//whether ip is from share internet
if (!empty($_SERVER['HTTP_CLIENT_IP']))   
  {
    $ip_address = $_SERVER['HTTP_CLIENT_IP'];
  }
//whether ip is from proxy
elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR']))  
  {
    $ip_address = $_SERVER['HTTP_X_FORWARDED_FOR'];
  }
//whether ip is from remote address
else
  {
    $ip_address = $_SERVER['REMOTE_ADDR'];
  }
echo ((new \DateTime())->format('Y-m-d H:i:s') . ": " . $ip_address);
?>