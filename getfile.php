<?php
function download_file($file_url, $save_file){
  $fp = fopen ($save_file, 'w+');              // open file handle
  $ch = curl_init($filee_url);
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

?>