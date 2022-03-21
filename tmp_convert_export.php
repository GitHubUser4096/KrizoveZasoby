<pre>
<?php

$tables = [
  'Bag', 'Category', 'Config', 'Item', 'PackageType', 'Product', 'ProductCategory', 'User'
];

define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'admin');
define('DB_PASSWORD', 'admin');
define('DB_NAME', 'EmergencySupplies');

$db = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

foreach($tables as $table){

  echo "====== Table ".$table." ======\n";

  $query = 'select * from '.$table;

  $data = '';

  $stmt = $db->prepare($query);
  $stmt->execute();
  $res = $stmt->get_result();
  $stmt->close();

  $fields = $res->fetch_fields();
  foreach($fields as $field){
    $data .= $field->name." ";
  }

  $data .= "\n";

  while($row = $res->fetch_assoc()){
    foreach($row as $col){
      if($col===null) $data .= 'null ';
      else $data .= "'".$db->real_escape_string($col)."' ";
    }
    $data .= "\n";
  }

  echo $data;

  file_put_contents('tmp_convert_'.$table.'.txt', $data);

}

?>
</pre>
