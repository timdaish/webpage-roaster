<?php
$today = date("Ymd");
$serverName = 'http://'.$_SERVER['SERVER_NAME'];
if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
  $windows = defined('PHP_WINDOWS_VERSION_MAJOR');
    //echo 'This is a server using Windows! '. $windows."<br/>";
    $OS = "Windows";
}
else {
    //echo 'This is a server not using Windows!'."<br/>";
    $OS = PHP_OS;
}
//$cookie_jar tempnam('/tmp','cookie');
if ($OS == "Windows")
{
    $cookie_jar = tempnam("e:\\temp\\", "cky");
    $drv = substr(__DIR__, 0, 1);
    $filepath_basesavedir = $drv . ":\\roast\\";
    $perlbasedir = "e:\\xampp\\perl\bin\\";
}
else
{
    $cookie_jar = tempnam("/usr/local/", "cky");
    $drv = '/usr/local';
    $filepath_basesavedir = $drv . "/roast/";
}
function joinFilePaths()
{
    return preg_replace('~[/\\\]+~', DIRECTORY_SEPARATOR, implode(DIRECTORY_SEPARATOR, array_filter(func_get_args(),


    function ($p)
    {
        return $p !== '';
    }
    ) ) );
}
function getBetween($string, $start = "", $end = ""){
    if (strpos($string, $start)) { // required if $start not exist in $string
        $startCharCount = strpos($string, $start) + strlen($start);
        $firstSubStr = substr($string, $startCharCount, strlen($string));
        $endCharCount = strpos($firstSubStr, $end);
        if ($endCharCount == 0) {
            $endCharCount = strlen($firstSubStr);
        }
        return substr($firstSubStr, 0, $endCharCount);
    } else {
        return '';
    }
}
?>