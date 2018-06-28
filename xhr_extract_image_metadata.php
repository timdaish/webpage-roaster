<?php
header('Content-Type: application/json');
require_once "basic.php";
require_once "image_metadata.php";
// read parameters
$jn = $_REQUEST['jn'];
$fp = $_REQUEST['fp'];
$fn = $_REQUEST['fn'];
$no = $_REQUEST['no'];
//echo "getting metadata from " . $fn . PHP_EOL;

// create folder for job number
$filepath_savedir = joinFilePaths($filepath_basesavedir, $jn); 
if (!file_exists($filepath_savedir)) {
 @mkdir($filepath_savedir, 0777, true);
//echo "creating dir: " . $filepath_savedir . PHP_EOL;
}
$savepath = joinFilePaths($filepath_savedir,$no . "_" . $fn);
$savepath_tn = joinFilePaths($filepath_savedir,$no . "_tn_" . $fn);
$savepath_tnps = joinFilePaths($filepath_savedir,$no . "_tnps_" . $fn);
$savepathanalysis = joinFilePaths($filepath_savedir,$no . "_" . "etanalysis_vb.txt");
$savepathbasicanalysis = joinFilePaths($filepath_savedir,$no . "_" . "etanalysis_b.txt");
//echo "saving image to " . $savepath . PHP_EOL;
if (!file_exists($savepath))
    download_image($fp, $savepath);

if (file_exists($savepath))
    $metadata = getMetadata($savepath,$no,$savepathanalysis,$savepathbasicanalysis,$savepath_tn,$savepath_tnps);

// output the metadata array as JSON
echo (json_encode($metadata));

?>