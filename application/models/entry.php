<?php

class Entry extends CI_Model {
	function __construct() {
        parent::__construct();
        $this->load->model('image');
    }
	function getAll(){
	    $query = $this->db->get('entry');
	    return $query->result();
	}
	function getEntry($id){
		$query = $this->db->get_where('entry', array('id' => $id));
		$images = $this->db->get_where('image', array('entryId' => $id));
		$entry = $query->row();
		$entry->images = $this->image->imagesOfEntry($id);
		return $entry;
	}
	public function getAllWithImageInfo(){
		$all = $this->getAll();
		foreach($all as $entry){
			$entry->images = $this->image->imagesOfEntry($entry->id);
		}
		return $all;
	}
	public function update($id, $data){
		$this->db->where('id', $id);
		$this->db->update('entry', $data);
	}
	public function insert($data){
		$this->db->insert('entry', $data);	
		$this->db->select_max('id');
		$query = $this->db->get('entry');
		return $query->row();
	}
	public function delete($id){
		$this->db->where('id', $id);
		$this->db->delete('entry'); 
	}
}