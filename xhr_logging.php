<?php
include "basic.php";
require_once "dbconnect.php";
require_once "dblogging.php";
// read parameters
$server = $_REQUEST['svr'];
$testid = $_REQUEST['testid'];
$msgid = $_REQUEST['msgid'];
$message = $_REQUEST['msg'];
$status = $_REQUEST['st'];
//echo "getting metadata from " . $fn . PHP_EOL;

// get IP address of user if message id = 1 - sent on initial results read
if($msgid == 1)
{
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
  $message = $ip_address;
}
//echo ((new \DateTime())->format('Y-m-d H:i:s') . ": " . $ip_address);
// log actionb with IP address
logAction($server,$testid,$msgid,$message,intval($status));
?>