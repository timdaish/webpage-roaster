<?php
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

function getMetadata($image_file,$no,$analysis_file,$basicanalysis_file,$tnexif_image_file,$tnps_image_file)
{
    global $OS,$perlbasedir;
    // call exiftool to get basic and verbose files and extract thumbnails
    
    // call exiftool - get basic output and save to file as php array
    $resBasic = array();
    if($OS == "Windows")
        exec($perlbasedir . 'perl win_tools\ExifToolPerl\exiftool.pl ' . $image_file,$resBasic);
    else
        exec('./lnx_tools/ExifTool/exiftool ' . escapeshellarg($image_file),$resBasic);
    // debug print
//print_r ($resBasic);
    // call exiftool - get verbose output and save to file as text
    $resVerbose= array();
    if($OS == "Windows")
        exec($perlbasedir . 'perl win_tools\ExifToolPerl\exiftool.pl -v ' . $image_file,$resVerbose);
    else
        exec('./lnx_tools/ExifTool/exiftool -v ' . escapeshellarg($image_file),$resVerbose);
    // debug print
    //print_r ($resVerbose);


    // extract EXIF thumbnail from APP1
    $restn = array();
    if($OS == "Windows")
        exec($perlbasedir . 'perl win_tools\ExifToolPerl\exiftool.pl -b -ThumbnailImage ' . $image_file . " > " . $tnexif_image_file,$restn);
    else
        exec('./lnx_tools/ExifTool/exiftool -b -ThumbnailImage ' . escapeshellarg($image_file) . " > " . $tnexif_image_file,$restn);
    // get file size of thumbnail and delete if zero bytes
    if(file_exists($tnexif_image_file) && filesize($tnexif_image_file) == 0)
        unlink($tnexif_image_file);
    
    // extract PhotoShop thumbnail from APP13
    $restn = array();
    if($OS == "Windows")
        exec($perlbasedir . 'perl win_tools\ExifToolPerl\exiftool.pl -b -PhotoShopThumbnail ' . $image_file . " > " . $tnps_image_file,$restn);
    else
        exec('./lnx_tools/ExifTool/exiftool -b -PhotoShopThumbnail ' . escapeshellarg($image_file) . " > " . $tnps_image_file,$restn);
    // get file size of thumbnail and delete if zero bytes
    if(file_exists($tnps_image_file) && filesize($tnps_image_file) == 0)
        unlink($tnps_image_file);

    // get basic image stuff
    // clear file before appending lines
    if(file_exists($basicanalysis_file))
        unlink($basicanalysis_file);

    $version = '';
    $fileType = '';
    $gifFrameCount = 0;
    $mimeType = '';
    $imageWidth = 0;
    $imageHeight = 0;
    $imageSize = '';
    $bitDepth = 0;
    $colorType = 'Palette';
    $colorDepth = 0;
    $chroma = '';
    $encodingMethod = '';
    $ColorComponents = 0;
    //parse basic analysis
    foreach($resBasic as $item) {
        file_put_contents($basicanalysis_file, $item."\r\n",FILE_APPEND | LOCK_EX);
     //   echo($item . " - " . $value.PHP_EOL);

        $lineq = $item;
        $line = trim(str_replace("'", "", $lineq));
    //echo $line . PHP_EOL;
        // parse a line
        if(strpos($line," : ") != false)
            $lineparts = explode(" : ",$line);
        else
            $lineparts = array($line);

        $key = trim($lineparts[0]);
        @$value = trim($lineparts[1]);
        //echo ($key . " = "  . $value . PHP_EOL);
        // get basic image information
            switch($key)
            {
                case "File Type":
                    $fileType = $value;
                    break;
                case "MIME Type":
                    $mimeType = $value;
                    break;
                case "GIF Version":
                case "JFIF Version":
                case "VP8 Version":
                    $version = $value;
                    break;
                case "Frame Count":
                    $gifFrameCount = $value;
                    break;
                case "Image Size":
                    $imageSize = $value;
                    break;
                case "Image Width":
                    $imageWidth= $value;
                    break;
                case "Image Height":
                    $imageHeight = $value;
                    break;
                case "Y Cb Cr Sub Sampling":
                    $chroma = $value;
                    break;
                case "Bit Depth":   // BMP
                    $bitDepth = intval($value);
                    break;
                case "Bit Depth":   // GIF, PNG
                case "Bits Per Sample":  // JPEG
                case "Bits Per Pixel": // WEBP
                case "Bits Per Component": // JP2
                    $bitDepth = $value;
                    break;
                case "Color Components":
                case "Number Of Components":
                    $colorComponents = $value;
                     break;    
                case "Color Resolution Depth": // gif
                    $colorDepth = $value;
                    break;
                case "Color Type":
                    $colorType = $value;
                    switch($colorType)
                    {
                        case "RGB":
                            $colorDepth = $bitDepth * 3;
                            break;
                        case "RGB with Alpha":
                            $colorDepth = $bitDepth * 4;
                            break;
                        case "Grayscale":
                            $colorDepth = $bitDepth * 1;
                            break;
                        case "Grayscale With Alpha":
                            $colorDepth = $bitDepth * 2;
                            break;
                        case "Palette":
                            // get palette
                            $pcols = 3;
                            $colorDepth = $bitDepth;
                            break;
                    }
                    break;
                case "Encoding Process":
                case "Compression":
                    $encodingMethod = $value;
                    break;
            } // end switch
    } // end for each of basic file

    // set additional vars dependent upon file type
    switch($fileType)
    {
        case "JPEG":
            $colorType = 'True Color';
            $colorDepth = $bitDepth * $colorComponents;
            break;
        case "JP2":
            $colorType = 'RGB';
            $colorDepth = $bitDepth * $colorComponents;
            break;
        case "PNG":

            break;
        case "GIF":
            break;
        case "WEBP":
            if($encodingMethod == '')
                $encodingMethod = "VP8";
            $colorDepth = "24";
            $chroma = "YCbCr 4:2:0 (1:2)";
            break;
        case "BMP":
            $colorDepth = $bitDepth;
            break;
    }
    

    $arr = array('no' => $no, 'type' => $fileType, 'version' => $version, 'mimeType' => $mimeType,
    "imageSize" => $imageSize,
    "imageWidth" => $imageWidth,
    "imageHeight" => $imageHeight,
    "gifframecount" => $gifFrameCount,
    "encoding" => $encodingMethod,
    "bitdepth" => $bitDepth,
    "colordepth" => $colorDepth . " bits",
    "colortype" => $colorType,
    "chroma" => $chroma,
    );

    $arrMerged = array();
//echo("filetype:" . $fileType .PHP_EOL);
    // get metadata for each image type
    switch($fileType)
    {
        case "JPEG":
        case "JP2":
            $arrJPEG = getMetadataJPEG($resVerbose,$image_file,$no,$analysis_file,$basicanalysis_file,$tnexif_image_file,$tnps_image_file);
            $arrMerged = array_merge($arr, $arrJPEG);
            break;
        case "PNG":
            $arrPNG = getMetadataPNG($resVerbose,$image_file,$no,$analysis_file,$basicanalysis_file,$tnexif_image_file,$tnps_image_file);
            $arrMerged = array_merge($arr, $arrPNG);
            break;
        case "GIF":
            $arrGIF = getMetadataGIF($resVerbose,$image_file,$no,$analysis_file,$basicanalysis_file,$tnexif_image_file,$tnps_image_file);
            $arrMerged = array_merge($arr, $arrGIF);
            break;
        case "WEBP":
            $arrWEBP = getMetadataWEBP($resVerbose,$image_file,$no,$analysis_file,$basicanalysis_file,$tnexif_image_file,$tnps_image_file);
            $arrMerged = array_merge($arr, $arrWEBP);
            break;
        case "BMP":
            $arrBMP = getMetadataBMP($resVerbose,$image_file,$no,$analysis_file,$basicanalysis_file,$tnexif_image_file,$tnps_image_file);
            $arrMerged = array_merge($arr, $arrBMP);
            break;
    }

   return $arrMerged;
}


function getMetadataJPEG($resVerbose,$image_file,$no,$analysis_file,$basicanalysis_file,$tnexif_image_file,$tnps_image_file)
{    
    global $OS,$perlbasedir;
    // initialise vars for metadata

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
    $jpegApp12Quality = 0;
    $jpegestquality = 0;
  
    $rowCount = 0;
    // clear file before appending lines
    if(file_exists($analysis_file))
        unlink($analysis_file);
    //parse metadata verbose output
    foreach($resVerbose as $item) {
        $rowCount++;
        if($rowCount > 11)
            file_put_contents($analysis_file, $item."\r\n",FILE_APPEND | LOCK_EX);
        // to know what's in $item
        $lineq = $item;
        $line = trim(str_replace("'", "", $lineq));
//echo $line . PHP_EOL;
        // parse a line
        if(strpos($line," = ") != false)
            $lineparts = explode(" = ",$line);
        else
            $lineparts = array($line);

  
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
        if(strpos($lineparts[0],"ICC_Profile directory") !== false)
        {
            // icc metadata
            $iccColourProfileBytes = getBetween($lineparts[0],", "," bytes");
            $metadatabytes += intval($iccColourProfileBytes);
            $debug .= ";ICC colour profile " . $iccColourProfileBytes;
//echo "ICC colour profile metadata found ". $iccColourProfileBytes .PHP_EOL;
        }



    } // end foreach item

            $commentBytes = $jpegcommentBytes;
            $xmpBytes = $jpegApp1XMPBytes + $xmpBytes;

            // estimate quality
            $res = array();
            if($OS == "Windows")
                exec('tools\jpegquality '. $image_file,$qres);
            else
                exec('./tools/jpegq '. escapeshellarg($image_file),$qres);
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


    $arr = array("metadatabytes" => $metadatabytes,
     "app0jfifbytes" => $jpegApp0Bytes,
     "app1exifbytes" => $jpegApp1ExifBytes,
     "app1xmpbytes" => $jpegApp1XMPBytes,
     "iccbytes" => $iccColourProfileBytes,
     "app12bytes" => $jpegApp12Bytes,
     "app13bytes" => $jpegApp13Bytes,
     "xmpbytes" =>  $xmpBytes,
     "commentbytes" => $commentBytes,
     "duckyquality" => $jpegApp12Quality,
     "jpegestquality" => $jpegestquality,
     "debug" => $debug
    );

    return $arr;
} //end jpg

function getMetadataPNG($resVerbose,$image_file,$no,$analysis_file,$basicanalysis_file,$tnexif_image_file,$tnps_image_file)
{    
    global $OS,$perlbasedir;
    // initialise vars for metadata

    $mdXMPFound = false;
    $debug = '';
    $xmpBytes = 0;
    $commentBytes = 0;
    $tEXtcommentBytes = 0;
    $iTXtcommentBytes = 0;
    $zTXtcommentBytes = 0;
    $iccColourProfileBytes = 0;
    $metadatabytes = 0;
  
    $rowCount = 0;
    // clear file before appending lines
    if(file_exists($analysis_file))
        unlink($analysis_file);
    //parse metadata verbose output
    foreach($resVerbose as $item) {
        $rowCount++;
        if($rowCount > 11)
        file_put_contents($analysis_file, $item."\r\n",FILE_APPEND | LOCK_EX);
        // to know what's in $item
        $lineq = $item;
        $line = trim(str_replace("'", "", $lineq));
//echo $line . PHP_EOL;
        // parse a line
        if(strpos($line," = ") != false)
            $lineparts = explode(" = ",$line);
        else
            $lineparts = array($line);

  
        // look for metadata sizes
        

        if(strpos($lineparts[0],"XMP directory") !== false)
        {
            // xmp metadata
            $xmpBytes = getBetween($lineparts[0],", "," bytes");
            $metadatabytes += intval($xmpBytes);
            $debug .= ";XMP " . $xmpBytes;
//echo "XMP metadata found " . $xmpBytes .PHP_EOL;
        }
        if(strpos($lineparts[0],"ICC_Profile directory") !== false)
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
            $tEXtcommentBytes += getBetween($lineparts[0],"("," bytes");
            $debug .= ";PNG Text " . $tEXtcommentBytes;
//echo "PNG Text metadata found ". $pngtextBytes .PHP_EOL;
        }
        if(strpos($lineparts[0],"PNG iTXt") !== false)
        {
            // png text metadata
            $iTXtcommentBytes += getBetween($lineparts[0],"("," bytes");
            $debug .= ";PNG Text " . $iTXtcommentBytes;
//echo "PNG Text metadata found ". $pngtextBytes .PHP_EOL;
        }
        if(strpos($lineparts[0],"PNG zTXt") !== false)
        {
            // png text metadata
            $zTXtcommentBytes += getBetween($lineparts[0],"("," bytes");
            $debug .= ";PNG Text " . $zTXtcommentBytes;
//echo "PNG Text metadata found ". $pngtextBytes .PHP_EOL;
        }

    } // end foreach item

    $metadatabytes += $tEXtcommentBytes + $iTXtcommentBytes + $zTXtcommentBytes;
    $arr = array("metadatabytes" => $metadatabytes,
     "iccbytes" => $iccColourProfileBytes,
     "xmpbytes" =>  $xmpBytes,
     "commentbytes" => $tEXtcommentBytes + $iTXtcommentBytes + $zTXtcommentBytes,
     "debug" => $debug
    );

    return $arr;
} //end png

function getMetadataGIF($resVerbose,$image_file,$no,$analysis_file,$basicanalysis_file,$tnexif_image_file,$tnps_image_file)
{    
    global $OS,$perlbasedir;
    // initialise vars for metadata

    $mdXMPFound = false;
    $debug = '';
    $xmpBytes = 0;
    $commentBytes = 0;
    $iccColourProfileBytes = 0;
    $metadatabytes = 0;
  
    $rowCount = 0;
    // clear file before appending lines
    if(file_exists($analysis_file))
        unlink($analysis_file);
    //parse metadata verbose output
    foreach($resVerbose as $item) {
        $rowCount++;
        if($rowCount > 11)
            file_put_contents($analysis_file, $item."\r\n",FILE_APPEND | LOCK_EX);
        // to know what's in $item
        $lineq = $item;
        $line = trim(str_replace("'", "", $lineq));
//echo $line . PHP_EOL;
        // parse a line
        if(strpos($line," = ") != false)
            $lineparts = explode(" = ",$line);
        else
            $lineparts = array($line);

  
        // look for metadata sizes
        
        if(strpos($lineparts[0],"XMP directory") !== false)
        {
            // xmp metadata
            $xmpBytes = getBetween($lineparts[0],", "," bytes");
            $metadatabytes += intval($xmpBytes);
            $debug .= ";XMP " . $xmpBytes;
//echo "XMP metadata found " . $xmpBytes .PHP_EOL;
        }
        if(strpos($lineparts[0],"ICC_Profile directory") !== false)
        {
            // icc metadata
            $iccColourProfileBytes = getBetween($lineparts[0],", "," bytes");
            $metadatabytes += intval($iccColourProfileBytes);
            $debug .= ";ICC colour profile " . $iccColourProfileBytes;
//echo "GIF ICC colour profile metadata found ". $iccColourProfileBytes .PHP_EOL;
        }
    } // end foreach item

    $arr = array("metadatabytes" => $metadatabytes,
     "iccbytes" => $iccColourProfileBytes,
     "xmpbytes" =>  $xmpBytes,
     "commentbytes" => $commentBytes,
     "debug" => $debug
    );

    return $arr;
} //end gif

function getMetadataWEBP($resVerbose,$image_file,$no,$analysis_file,$basicanalysis_file,$tnexif_image_file,$tnps_image_file)
{    
    global $OS,$perlbasedir;
    // initialise vars for metadata

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
    $jpegApp12Quality = 0;
    $jpegestquality = 0;
  
    $rowCount = 0;
    // clear file before appending lines
    if(file_exists($analysis_file))
        unlink($analysis_file);
    //parse metadata verbose output
    foreach($resVerbose as $item) {
        $rowCount++;
        if($rowCount > 11)
            file_put_contents($analysis_file, $item."\r\n",FILE_APPEND | LOCK_EX);
        // to know what's in $item
        $lineq = $item;
        $line = trim(str_replace("'", "", $lineq));
//echo $line . PHP_EOL;
        // parse a line
        if(strpos($line," = ") != false)
            $lineparts = explode(" = ",$line);
        else
            $lineparts = array($line);

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
        if(strpos($lineparts[0],"ICC_Profile directory") !== false)
        {
            // icc metadata
            $iccColourProfileBytes = getBetween($lineparts[0],", "," bytes");
            $metadatabytes += intval($iccColourProfileBytes);
            $debug .= ";ICC colour profile " . $iccColourProfileBytes;
//echo "ICC colour profile metadata found ". $iccColourProfileBytes .PHP_EOL;
        }

    } // end foreach item

            $commentBytes = $jpegcommentBytes;
            $xmpBytes = $jpegApp1XMPBytes + $xmpBytes;

            // estimate quality
            $res = array();
            if($OS == "Windows")
                exec('tools\jpegquality '. $image_file,$qres);
            else
                exec('./tools/jpegq '. escapeshellarg($image_file),$qres);
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


    $arr = array("metadatabytes" => $metadatabytes,
     "app0jfifbytes" => $jpegApp0Bytes,
     "app1exifbytes" => $jpegApp1ExifBytes,
     "app1xmpbytes" => $jpegApp1XMPBytes,
     "iccbytes" => $iccColourProfileBytes,
     "app12bytes" => $jpegApp12Bytes,
     "app13bytes" => $jpegApp13Bytes,
     "xmpbytes" =>  $xmpBytes,
     "commentbytes" => $commentBytes,
     "duckyquality" => $jpegApp12Quality,
     "jpegestquality" => $jpegestquality,
     "debug" => $debug
    );

    return $arr;
} //end webp


function getMetadataBMP($resVerbose,$image_file,$no,$analysis_file,$basicanalysis_file,$tnexif_image_file,$tnps_image_file)
{    
    global $OS,$perlbasedir;
    // initialise vars for metadata

    $mdXMPFound = false;
    $debug = '';
    $xmpBytes = 0;
    $commentBytes = 0;
    $iccColourProfileBytes = 0;
    $metadatabytes = 0;
  
    $rowCount = 0;
    // clear file before appending lines
    if(file_exists($analysis_file))
        unlink($analysis_file);
    //parse metadata verbose output
    foreach($resVerbose as $item) {
        $rowCount++;
        if($rowCount > 11)
            file_put_contents($analysis_file, $item."\r\n",FILE_APPEND | LOCK_EX);
        // to know what's in $item
        $lineq = $item;
        $line = trim(str_replace("'", "", $lineq));
//echo $line . PHP_EOL;
        // parse a line
        if(strpos($line," = ") != false)
            $lineparts = explode(" = ",$line);
        else
            $lineparts = array($line);

  
        // look for metadata sizes
        
        if(strpos($lineparts[0],"XMP directory") !== false)
        {
            // xmp metadata
            $xmpBytes = getBetween($lineparts[0],", "," bytes");
            $metadatabytes += intval($xmpBytes);
            $debug .= ";XMP " . $xmpBytes;
//echo "XMP metadata found " . $xmpBytes .PHP_EOL;
        }
        if(strpos($lineparts[0],"ICC_Profile directory") !== false)
        {
            // icc metadata
            $iccColourProfileBytes = getBetween($lineparts[0],", "," bytes");
            $metadatabytes += intval($iccColourProfileBytes);
            $debug .= ";ICC colour profile " . $iccColourProfileBytes;
//echo "GIF ICC colour profile metadata found ". $iccColourProfileBytes .PHP_EOL;
        }
    } // end foreach item

    $arr = array("metadatabytes" => $metadatabytes,
     "iccbytes" => $iccColourProfileBytes,
     "xmpbytes" =>  $xmpBytes,
     "commentbytes" => $commentBytes,
     "debug" => $debug
    );

    return $arr;
} //end bmp

?>