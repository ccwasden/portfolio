<?php

class Image extends CI_Model {
	function __construct() {
        parent::__construct();
    }
	function imagesOfEntry($id){
		$query = $this->db->get_where('image', array('entryId' => $id));
		return $query->result();
	}
	function getImage($id){
		$query = $this->db->get_where('image', array('id' => $id));
		return $query->row();
	}
	public function update($id, $data){
		$this->db->where('id', $id);
		$this->db->update('image', $data);
	}
	public function insert($data){
		$this->db->insert('image', $data);	
		$this->db->select_max('id');
		$query = $this->db->get('image');
		return $query->row();
	}
	public function delete($id){
		$this->db->where('id', $id);
		$this->db->delete('image'); 
	}
}