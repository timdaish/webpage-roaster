<?php
require_once "dbconnect.php";
require_once "basic.php";
function logAction($svr,$testid,$msgtype,$message,$status)
{
    global $conn,$OS;
    if ($OS == "Windows")
    {
    $sql = "INSERT INTO roasterlog.logs (msgtype, server,testid, message, status)
    VALUES ($msgtype,'$svr','$testid','$message',$status)";
    }
    else
    {
        $sql = "INSERT INTO logs (msgtype, server,testid, message, status)
        VALUES ($msgtype,'$svr','$testid','$message',$status)";
        }    
if ($conn->query($sql) === TRUE) {
//echo "New log record created successfully";
} else {
echo "Error creating log entry: " . $sql . "<br>" . $conn->error;
}
}
?>