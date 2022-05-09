<?php

class DB {

  public $db;
	public $debug;

  function __construct($server, $username, $password, $dbName, $debug){
    $this->db = new mysqli($server, $username, $password, $dbName);
		$this->debug = $debug;
    // if($this->db->connect_error) throw new Exception($this->$db->connect_error);
    if($this->db->connect_error) $this->fail('Connection failed: '.$this->$db->connect_error);
    $this->db->set_charset('utf8mb4');
  }

	function fail($msg){
    header('HTTP/1.1 500 Internal server error');
    if($this->debug) echo 'DB Error: '.$msg;
		else echo 'Unexpected DB Error';
    exit;
  }

  function execute($query, ...$args) {

    $stmt = $this->db->prepare($query);
    // if(!$stmt) throw new Exception('Invalid statement: '.$query);
    if(!$stmt) $this->fail('Invalid statement: '.$query);
    if(count($args)>0){
      $stmt->bind_param(str_repeat("s", count($args)), ...$args);
    }
    $executed = $stmt->execute();
    // if(!$executed) throw new Exception('Failed executing statement '.$query.': '.$this->db->error);
    if(!$executed) $this->fail('Failed executing statement '.$query.': '.$this->db->error);
    $stmt->close();

  }

  function query($query, ...$args) {

  	$stmt = $this->db->prepare($query);
  	// if(!$stmt) throw new Exception('Invalid statement: '.$query);
  	if(!$stmt) $this->fail('Invalid statement: '.$query);
  	if(count($args)>0){
  		$stmt->bind_param(str_repeat("s", count($args)), ...$args);
  	}
  	$executed = $stmt->execute();
  	// if(!$executed) throw new Exception('Failed executing statement '.$query.': '.$this->db->error);
  	if(!$executed) $this->fail('Failed executing statement '.$query.': '.$this->db->error);
  	$res = $stmt->get_result();
  	$stmt->close();

  	if(!$res) return false;

  	$rows = [];

  	while($row = $res->fetch_assoc()){
  		$rows[count($rows)] = $row;
  	}

  	return $rows;

  }

  function queryMap($query, $key, ...$args) {

  	$stmt = $this->db->prepare($query);
  	// if(!$stmt) throw new Exception('Invalid statement: '.$query);
    if(!$stmt) $this->fail('Invalid statement: '.$query);
  	if(count($args)>0){
  		$stmt->bind_param(str_repeat("s", count($args)), ...$args);
  	}
  	$executed = $stmt->execute();
  	// if(!$executed) throw new Exception('Failed executing statement '.$query.': '.$this->db->error);
    if(!$executed) $this->fail('Failed executing statement '.$query.': '.$this->db->error);
  	$res = $stmt->get_result();
  	$stmt->close();

  	if(!$res) return false;

  	$rows = [];

  	while($row = $res->fetch_assoc()){
  		$rows[$row[$key]] = $row;
  	}

  	return $rows;

  }

  function insert($query, ...$args) {

  	$stmt = $this->db->prepare($query);
  	// if(!$stmt) throw new Exception('Invalid statement: '.$query);
    if(!$stmt) $this->fail('Invalid statement: '.$query);
  	if(count($args)>0){
  		$stmt->bind_param(str_repeat("s", count($args)), ...$args);
  	}
  	$executed = $stmt->execute();
  	// if(!$executed) throw new Exception('Failed executing statement '.$query.': '.$this->db->error);
    if(!$executed) $this->fail('Failed executing statement '.$query.': '.$this->db->error);
  	$res = $this->db->insert_id;
  	$stmt->close();

  	return $res;

  }

  function escape($text){
    return $this->db->real_escape_string($text);
  }

  function close(){
  	$this->db->close();
  }

  function __destruct(){
    $this->close();
  }

}

?>
