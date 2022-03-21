<?php

$tables = [
  'Item', 'Bag', 'ProductCategory', 'Product', 'Category', 'PackageType', 'Config', 'User'
];

define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'zasoby-nggcv');
define('DB_PASSWORD', 'BH8zleml6v62');
define('DB_NAME', 'zasoby-nggcv');

$db = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
$db->set_charset('utf8mb4');

foreach($tables as $table){

  $query = 'truncate table '.$table.';';

  echo 'Executing: '.$query."<br>";

  $stmt = $db->prepare($query);
  $stmt->execute();
  $stmt->close();

}

for($t = count($tables)-1; $t>=0; $t--){

  $table = $tables[$t];

  $file = file_get_contents('tmp_convert_'.$table.'.txt');
  $lines = explode("\n", trim($file));
  $rows = [];

  foreach($lines as $line){
    $cols = [];
    // $parts = explode("\t", trim($line));
    $parts = str_getcsv(trim($line), ' ', "'");
    foreach($parts as $part){
      $cols[] = $part;
    }
    $rows[] = $cols;
  }

  echo "====== Table ".$table." ======<br>";

  $queryBase = 'insert into '.$table.'('.implode(", ", $rows[0]).') values ';

  for($i = 1; $i<count($rows); $i++){

    $cols = [];
    $parts = $rows[$i];
    // for($j = 0; $j<count($rows[0]); $j++){
    //   // if($j>=count($parts)) $cols[] = 'null';
    //   $cols[] = "'".$db->real_escape_string($parts[$j])."'";
    // }
    foreach($parts as $part){
      if($part=='null') $cols[] = 'null';
      else $cols[] = "'".$db->real_escape_string($part)."'";
    }

    $query = $queryBase.'('.implode(', ', $cols).');';

    echo 'Executing: '.$query."<br>";

    $stmt = $db->prepare($query);
    if(!$stmt) throw new Exception($db->error);
    $executed = $stmt->execute();
    if(!$executed) throw new Exception($db->error);
    $stmt->close();

  }

  // $query = 'select * from '.$table;
  //
  // $data = '';
  //
  // $stmt = $db->prepare($query);
  // $stmt->execute();
  // $res = $stmt->get_result();
  // $stmt->close();
  //
  // while($row = $res->fetch_assoc()){
  //   foreach($row as $col){
  //     $data .= $col."\t";
  //   }
  //   $data .= "\n";
  // }
  //
  // echo $data;
  //
  // file_put_contents('tmp_convert_'.$table.'.txt', $data);

}

?>
