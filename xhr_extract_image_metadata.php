<?php
header('Content-Type: application/json');
include "basic.php";
// read parameters
$jn = $_REQUEST['jn'];
$fp = $_REQUEST['fp'];
$fn = $_REQUEST['fn'];
$no = $_REQUEST['no'];
//echo "getting metadata from " . $fn . PHP_EOL;

// create folder for job number
$filepath_savedir = joinFilePaths($filepath_basesavedir, $jn); 
if (!file_exists($filepath_savedir)) {
  mkdir($filepath_savedir, 0777, true);
//  echo "creating dir: " . $filepath_savedir . PHP_EOL;
}
$savepath = joinFilePaths($filepath_savedir,$no . "_" . $fn);
//echo "saving image to " . $savepath . PHP_EOL;
if (!file_exists($savepath))
    download_image($fp, $savepath);

if (file_exists($savepath))
    $metadata = getMetadata($savepath,$no);

// output the metadata array as JSON
echo (json_encode($metadata));
/////////////////////////////////////////////
function download_image($image_url, $image_file){
  $fp = fopen ($image_file, 'w+');              // open file handle
  $ch = curl_init($image_url);
  // curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // enable if you want
  curl_setopt($ch, CURLOPT_FILE, $fp);          // output to file
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
  curl_setopt($ch, CURLOPT_HTTP_VERSION, 4);
  curl_setopt($ch, CURLOPT_TIMEOUT, 1000);      // some large value to allow curl to run for a long time
  curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0');
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // false for https
  curl_setopt($ch, CURLOPT_VERBOSE, true);   // Enable this line to see debug prints
  curl_exec($ch);

  curl_close($ch);                              // closing curl handle
  fclose($fp);                                  // closing file handle
}

function getMetadata($image_file,$no)
{
    global $OS,$perlbasedir;
    // call exiftool perl
    $res = array();
    if($OS == "Windows")
        exec($perlbasedir . 'perl tools\ExifToolPerl\exiftool.pl -v ' . $image_file,$res);
    else
        exec('exiftool -v ' . $image_file,$res);
// debug print
//print_r ($res);

    // initialise vars
    $version = '';
    $fileType = '';
    $mdXMPFound = false;
    $debug = '';
    $xmpBytes = 0;
    $jpegcommentBytes = 0;
    $commentBytes = 0;
    $jpegPhotoShopBytes = 0;
    $iccColourProfileBytes = 0;
    $metadatabytes = 0;
    $jpegApp0Bytes = 0;
    $jpegApp1Bytes = 0;
    $jpegApp1XMPBytes = 0;
    $jpegApp1ExifBytes = 0;
    $jpegApp1 = false;
    $pngtextBytes = 0;
    $gifFrameCount = 0;
    //parse metadata verbose output
    foreach($res as $item) {
        // to know what's in $item
        $lineq = $item;
        $line = trim(str_replace("'", "", $lineq));
//echo $line . PHP_EOL;
        // parse a line
        if(strpos($line," = ") != false)
            $lineparts = explode(" = ",$line);
        else
            $lineparts = array($line);

//print_r($lineparts);
        // get basic image information
        if(sizeof($lineparts) > 1)
        {
            switch($lineparts[0])
            {
                case "FileType":
                    $fileType = $lineparts[1];
                    break;
                case "MIMEType":
                    $mimeType = $lineparts[1];
                    break;
                case "GIFVersion":
                    $version = $lineparts[1];
                    break;
                case "FrameCount":
                    $gifFrameCount = $lineparts[1];
                    break;
            } // end switch
        }
        // look for metadata sizes
        if(strpos($lineparts[0],"XMP directory") !== false)
        {
            // xmp metadata
            $xmpBytes = getBetween($lineparts[0],", "," bytes");
            $metadatabytes += intval($xmpBytes);
            $debug .= ";XMP " . $xmpBytes;
//echo "XMP metadata found " . $xmpBytes .PHP_EOL;
        }
        if(strpos($lineparts[0],"JPEG COM") !== false)
        {
            // jpeg xmp metadata
            $jpegcommentBytes = getBetween($lineparts[0],"("," bytes");
            $metadatabytes += intval($jpegcommentBytes);
            $debug .= ";JPEG Comment " . $jpegcommentBytes;
//echo "JPEG Comment metadata found " . $jpegcommentBytes .PHP_EOL;
        }
        if(strpos($lineparts[0],"JPEG APP0 ") !== false)
        {
            // jpeg xmp metadata
            $jpegApp0 = true;
            $jpegApp0Bytes = getBetween($lineparts[0],"("," bytes");
            $metadatabytes += $jpegApp0Bytes;
            $debug .= ";JPEG APP0 JFIF " . $jpegApp0Bytes;
//echo "JPEG APP0 JFIF metadata found " . $jpegApp0Bytes .PHP_EOL;
        }
        if(strpos($lineparts[0],"JFIFVersion") !== false and $jpegApp0 == true)
        {
            $version = "JFIF " . str_replace(" ",".",$lineparts[1]);
        }
        if(strpos($lineparts[0],"JPEG APP1 ") !== false)
        {
            // jpeg xmp or exif metadata
            $jpegApp1 = true;
            $jpegApp1Bytes = getBetween($lineparts[0],"("," bytes");
        }
        if(strpos($lineparts[0],"XMP Directory") !== false and $jpegApp1 == true)
        {
            // jpeg xmp metadata
            $jpegApp1 = false;
            $jpegApp1XMPBytes = $jpegApp1Bytes;
            $metadatabytes += intval($jpegApp1Bytes);
            $debug .= ";JPEG APP1 XMP " . $jpegApp1Bytes;
// echo "JPEG APP1 XMP metadata found " . $jpegApp1Bytes .PHP_EOL;
        }
        if(strpos($lineparts[0],"ExifByteOrder") !== false and $jpegApp1 == true)
        {
            // jpeg exif metadata
            $jpegApp1 = false;
            $jpegApp1ExifBytes = $jpegApp1Bytes;
            $metadatabytes += intval($jpegApp1Bytes);
            $debug .= ";JPEG APP1 EXIF " . $jpegApp1Bytes;
//echo "JPEG APP1 Exif metadata found ". $jpegApp1Bytes .PHP_EOL;
        }
        if(strpos($lineparts[0],"JPEG APP2") !== false)
        {
            // jpeg icc colour profile metadata
            $iccColourProfileBytes = getBetween($lineparts[0],"("," bytes");
            $metadatabytes += intval($iccColourProfileBytes);
            $debug .= ";JPEG APP2 ICC Colour Profile " . $iccColourProfileBytes;
//echo "JPEG APP2 metadata found ". $iccColourProfileBytes .PHP_EOL;
        }
//echo "checking for JPEG APP13 IPTC metadata found - " . strpos($lineparts[0],"JPEG APP13") . ";".PHP_EOL;
        if(strpos($lineparts[0],"ICC_Profile directory") !== false)
        {
            // jpeg iptc metadata
            $iccColourProfileBytes = getBetween($lineparts[0],", "," bytes");
            $metadatabytes += intval($iccColourProfileBytes);
            $debug .= ";GIF ICC colour profile " . $iccColourProfileBytes;
//echo "GIF ICC colour profile metadata found ". $iccColourProfileBytes .PHP_EOL;
        }
        if(strpos($lineparts[0],"JPEG APP2") !== false)
        {
            // jpeg icc colour profile metadata
            $iccColourProfileBytes = getBetween($lineparts[0],"("," bytes");
            $metadatabytes += intval($iccColourProfileBytes);
            $debug .= ";JPEG APP2 ICC Colour Profile " . $iccColourProfileBytes;
//echo "JPEG APP2 metadata found ". $iccColourProfileBytes .PHP_EOL;
        }
        if(strpos($lineparts[0],"PNG tEXt") !== false)
        {
            // png text metadata
            $pngtextBytes = getBetween($lineparts[0],"("," bytes");
            $metadatabytes += intval($pngtextBytes);
            $debug .= ";PNG Text " . $pngtextBytes;
//echo "PNG Text metadata found ". $pngtextBytes .PHP_EOL;
        }
    }

    // consolidate common attributes
    switch($fileType)
    {
        case "JPEG":
            $commentBytes = $jpegcommentBytes;
            $xmpBytes = $jpegApp1XMPBytes + $xmpBytes;
            break;
        case "PNG":
            $commentBytes = $pngtextBytes;
            break;
        case "GIF":
            break;
        case "WEBP":
            break;
    }

    $arr = array('no' => $no, 'type' => $fileType, 'version' => $version,
     'metadatabytes' => $metadatabytes,
     "app0jfifbytes" => $jpegApp0Bytes,
     "app1exifbytes" => $jpegApp1ExifBytes,
     "app1xmpbytes" => $jpegApp1XMPBytes,
     "app2iccbytes" => $iccColourProfileBytes,
     "app13iptcbytes" => $jpegPhotoShopBytes,
     "xmpbytes" =>  $xmpBytes,
     "commentbytes" => $commentBytes,
     "gifframecount" => $gifFrameCount,
     "debug" => $debug
    );

    return $arr;
}
?>