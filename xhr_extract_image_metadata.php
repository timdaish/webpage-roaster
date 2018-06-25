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
 @mkdir($filepath_savedir, 0777, true);
//echo "creating dir: " . $filepath_savedir . PHP_EOL;
}
$savepath = joinFilePaths($filepath_savedir,$no . "_" . $fn);
$savepathanalysis = joinFilePaths($filepath_savedir,$no . "_" . "etanalysis.txt");
//echo "saving image to " . $savepath . PHP_EOL;
if (!file_exists($savepath))
    download_image($fp, $savepath);

if (file_exists($savepath))
    $metadata = getMetadata($savepath,$no,$savepathanalysis);

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

function getMetadata($image_file,$no,$analysis_file)
{
    global $OS,$perlbasedir;
    // call exiftool perl
    $res = array();
    if($OS == "Windows")
        exec($perlbasedir . 'perl tools\ExifToolPerl\exiftool.pl -v ' . $image_file,$res);
    else
        exec('./tools/ExifTool/exiftool -v ' . $image_file,$res);
// debug print
//print_r ($res);

// Write the contents to the file
file_put_contents($analysis_file, $res);

    // initialise vars
    $version = '';
    $fileType = '';
    $mdXMPFound = false;
    $debug = '';
    $xmpBytes = 0;
    $jpegcommentBytes = 0;
    $commentBytes = 0;
    $iccColourProfileBytes = 0;
    $metadatabytes = 0;
    $jpegApp0Bytes = 0;
    $jpegApp1Bytes = 0;
    $jpegApp1XMPBytes = 0;
    $jpegApp1ExifBytes = 0;
    $jpegApp12Bytes = 0;
    $jpegApp13Bytes = 0;
    $jpegApp1 = false;
    $jpegApp12 = false;
    $pngtextBytes = 0;
    $gifFrameCount = 0;
    $jpegApp12Quality = 0;
    $webpencoding = "VP8";
    $encodingMethod = '';
    $jpegestquality = 0;
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
            $version = "JFIF " . str_replace(" ",".0",$lineparts[1]);
        }
        if(strpos($lineparts[0],"JPEG APP1 ") !== false)
        {
            // jpeg xmp or exif metadata
            $jpegApp1 = true;
            $jpegApp1Bytes = getBetween($lineparts[0],"("," bytes");
        }
        if(strpos($lineparts[0],"XMP directory") !== false and $jpegApp1 == true)
        {
            // jpeg xmp metadata
            $jpegApp1 = false;
            $jpegApp1XMPBytes = $jpegApp1Bytes;
            $metadatabytes += intval($jpegApp1Bytes);
            $debug .= ";JPEG APP1 XMP " . $jpegApp1Bytes;
// echo "JPEG APP1 XMP metadata found " . $jpegApp1Bytes .PHP_EOL;
        }
        else
            if(strpos($lineparts[0],"XMP directory") !== false)
            {
                // xmp metadata
                $xmpBytes = getBetween($lineparts[0],", "," bytes");
                $metadatabytes += intval($xmpBytes);
                $debug .= ";XMP " . $xmpBytes;
    //echo "XMP metadata found " . $xmpBytes .PHP_EOL;
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
        if(strpos($lineparts[0],"JPEG APP12") !== false)
        {
            // jpeg app13 ducky tag metadata
            $jpegApp12Bytes = getBetween($lineparts[0],"("," bytes");
            $metadatabytes += intval($jpegApp12Bytes);
            $debug .= ";JPEG APP12 Photoshop " . $jpegApp12Bytes;
            $jpegApp12 = true;
//echo "JPEG APP12 metadata found ". $jpegApp12Bytes .PHP_EOL;
        }
        if(strpos($lineparts[0],"Quality") !== false and $jpegApp12 == true)
        {
            // jpeg exif metadata
            $jpegApp12 = false;
            $jpegApp12Quality = intval(ord($lineparts[1]));

//echo "JPEG APP1 Exif metadata found ". $jpegApp1Bytes .PHP_EOL;
        }
        if(strpos($lineparts[0],"JPEG APP13") !== false)
        {
            // jpeg app13 colour profile metadata
            $jpegApp13Bytes = getBetween($lineparts[0],"("," bytes");
            $metadatabytes += intval($jpegApp13Bytes);
            $debug .= ";JPEG APP13 Photoshop " . $jpegApp13Bytes;
//echo "JPEG APP13 metadata found ". $jpegApp13Bytes .PHP_EOL;
        }
        if($fileType != "JPEG" and strpos($lineparts[0],"ICC_Profile directory") !== false)
        {
            // icc metadata
            $iccColourProfileBytes = getBetween($lineparts[0],", "," bytes");
            $metadatabytes += intval($iccColourProfileBytes);
            $debug .= ";ICC colour profile " . $iccColourProfileBytes;
//echo "GIF ICC colour profile metadata found ". $iccColourProfileBytes .PHP_EOL;
        }
        if(strpos($lineparts[0],"PNG tEXt") !== false)
        {
            // png text metadata
            $pngtextBytes = getBetween($lineparts[0],"("," bytes");
            $metadatabytes += intval($pngtextBytes);
            $debug .= ";PNG Text " . $pngtextBytes;
//echo "PNG Text metadata found ". $pngtextBytes .PHP_EOL;
        }

        // get encoding
        if($fileType == "JPEG" and strpos($lineparts[0],"EncodingProcess") !== false)
        {
            // jpeg  encoding
            $jpegencoding = $lineparts[1];
            $debug .= ";JPEG encoding " . $jpegencoding;
            switch($jpegencoding)
            {
                case 0:
                    $encodingMethod = "Baseline DCT, Huffman coding"; 
                    break;
                case 1: 
                    $encodingMethod = "Extended sequential DCT, Huffman coding"; 
                    break;
                case 2:
                    $encodingMethod = "Progressive DCT, Huffman coding";
                    break;
                case 3:
                    $encodingMethod = "Lossless, Huffman coding";
                    break;
                case 5: 
                    $encodingMethod = "Sequential DCT, differential Huffman coding"; 
                    break;
                case 6:
                    $encodingMethod =  "Progressive DCT, differential Huffman coding"; 
                    break;
                case 7:
                    $encodingMethod =  "Lossless, Differential Huffman coding"; 
                    break;
                case 9:
                    $encodingMethod = "Extended sequential DCT, arithmetic coding";
                    break; 
                case 10:
                    $encodingMethod = "Progressive DCT, arithmetic coding";
                    break; 
                case  11:
                    $encodingMethod = "Lossless, arithmetic coding";
                    break;
                case 13:
                    $encodingMethod = "Sequential DCT, differential arithmetic coding";
                    break; 
                case 14:
                    $encodingMethod = "Progressive DCT, differential arithmetic coding";
                    break;
                case 15: 
                    $encodingMethod = "Lossless, differential arithmetic coding";
                    break;
            }

//echo "JPEG encoding found ". $pngtextBytes .PHP_EOL;
        }
        else 
            if($fileType == "GIF")
                $encodingMethod = "LZW";
                else 
                if($fileType == "PNG")
                    $encodingMethod = "Deflate";
                else 
                    if($fileType == "WEBP")
                    {
                        if(strpos($lineparts[0],"RIFF 'VP8L") !== false)
                            $webpencoding = "VP8 Lossless";
                    }
    } // end foreach item

    // consolidate common attributes and do extra quality checks
    switch($fileType)
    {
        case "JPEG":
            $commentBytes = $jpegcommentBytes;
            $xmpBytes = $jpegApp1XMPBytes + $xmpBytes;

            // estimate quality
            $res = array();
            if($OS == "Windows")
                exec('tools\jpegquality '. $image_file,$qres);
            else
                exec('./tools/jpegq '. $image_file,$qres);
            $resstr = implode($qres);
            if(strpos($resstr,'%'))
            {
                if(intval($resstr>0))
                $jpegestquality = $resstr;
                else
                    $jpegestquality = 'Low';
            }
            else
            {
                $jpegestquality = 'N/A';
            }
            //echo ("Estimated quality ". $estquality . "($resstr) for ". $lfn."<br/>");

            break;
        case "PNG":
            $commentBytes = $pngtextBytes;
            break;
        case "GIF":
            break;
        case "WEBP":
            break;
    }

    $arr = array('no' => $no, 'type' => $fileType, 'version' => $version, 'mimeType' => $mimeType,
     'metadatabytes' => $metadatabytes,
     "app0jfifbytes" => $jpegApp0Bytes,
     "app1exifbytes" => $jpegApp1ExifBytes,
     "app1xmpbytes" => $jpegApp1XMPBytes,
     "app2iccbytes" => $iccColourProfileBytes,
     "app12bytes" => $jpegApp12Bytes,
     "app13bytes" => $jpegApp13Bytes,
     "xmpbytes" =>  $xmpBytes,
     "commentbytes" => $commentBytes,
     "gifframecount" => $gifFrameCount,
     "duckyquality" => $jpegApp12Quality,
     "encoding" => $encodingMethod,
     "jpegestquality" => $jpegestquality,
     "debug" => $debug
    );

    return $arr;
}
?>