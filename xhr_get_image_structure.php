<?php
header('Content-Type: application/json');
require_once "basic.php";
require_once "image_metadata.php";
require_once "dbconnect.php";
require_once "dblogging.php";
// read parameters
$jn = $_REQUEST['jn'];
$fp = $_REQUEST['fp'];
$fn = $_REQUEST['fn'];
$no = $_REQUEST['no'];
$server = $_REQUEST['svr'];

// log request
logAction($server,$jn,4,$no . ": ".$fn,1); // image detail viewed
//echo "reading structure from file " . $fn . PHP_EOL;

// get name of folder for job number
$filepath_savedir = joinFilePaths($filepath_basesavedir, $jn); 
// get filenames
$savepath = joinFilePaths($filepath_savedir,$no . "_" . $fn);
$savepath_tn = joinFilePaths($filepath_savedir,$no . "_tn_" . $fn);
$savepath_tnps = joinFilePaths($filepath_savedir,$no . "_tnps_" . $fn);
$savepathanalysis = joinFilePaths($filepath_savedir,$no . "_" . "etanalysis.txt");
$savepathbasicanalysis = joinFilePaths($filepath_savedir,$no . "_" . "etanalysis_b.txt");
if ($OS == "Windows")
{
    $roastpath = joinFilePaths("//roast", $jn,$no . "_" . $fn);
    $roastpath_tn = joinFilePaths("//roast", $jn,$no . "_tn_" . $fn);
    $roastpath_tnps = joinFilePaths("//roast", $jn,$no . "_tnps_" . $fn);
}
else
{
    $roastpath = "http://roast.webpageroaster.com/" . $jn. "/". $no . "_" . $fn;
    $roastpath_tn = "http://roast.webpageroaster.com/". $jn. "/". $no . "_tn_" . $fn;
    $roastpath_tnps = "http://roast.webpageroaster.com/". $jn. "/". $no . "_tnps_" . $fn;
}
//echo "saving image to " . $savepath . PHP_EOL;
if(!file_exists($savepath_tn))
    $roastpath_tn = '';
if(!file_exists($savepath_tnps))
    $roastpath_tnps = '';
if (!file_exists($savepath))
    download_image($fp, $savepath);
if (file_exists($savepath))
    $metadata = getMetadata($savepath,$no,$savepathanalysis,$savepathbasicanalysis,$savepath_tn,$savepath_tnps);

//print_r( $metadata);

$structure = file_get_contents($savepathanalysis);
//echo $structure;

// replace any % signs to prevent URL decoding
$roastpath = str_replace("%","%25",$roastpath);
$roastpath_tn = str_replace("%","%25",$roastpath_tn);
$roastpath_tnps = str_replace("%","%25",$roastpath_tnps);

$arr = array('no' => $no,
    'structure' => $structure,
    'roastpath' => $roastpath,
    'roastpath_tnexif' => $roastpath_tn,
    'roastpath_tnps' => $roastpath_tnps);

echo (json_encode($arr));
?>