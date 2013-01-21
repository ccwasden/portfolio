<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Admin extends CI_Controller {

	function __construct(){
		parent::__construct();
		$this->load->model('entry');
		$this->load->model('image');
		$this->load->helper('form');
		$this->load->helper('url');
		$this->load->helper('file');
		$this->load->library('form_validation');
	}

	public function index() {
		$entries = $this->entry->getAll();
		$this->load->view('admin_entrylist', array('entries' => $entries));
	}

	public function viewEntry($id){
		$entry = $this->entry->getEntry($id);
		$this->load->view('admin_viewentry', array('entry' => $entry));
	}

	public function edit($id = null){
		$this->form_validation->set_rules('title', 'Title', 'trim|required|min_length[3]|max_length[45]|xss_clean');
		$this->form_validation->set_rules('description', 'Description', 'trim|required|xss_clean');
		if ($this->form_validation->run() == FALSE) {
			if($id != null) {
				$entry = $this->entry->getEntry($id);
				$data = array(
						'title' => $entry->title,
						'description' => $entry->description,
						'id' => $id
					);
				$this->load->view('admin_editentry', $data);
			}
			else {
				$data = array(
					'title' => '',
					'description' => ''
				);
				$this->load->view('admin_editentry', $data);	
			}
		}
		else {
			$id = $this->input->post('id');
			if($id && $id != ''){
				$this->entry->update($id, array(
					'title' => $this->input->post('title'),
					'description' => $this->input->post('description')
				));
				redirect('admin/viewEntry/'.$id);
			}
			else {
				$entry = $this->entry->insert(array(
					'title' => $this->input->post('title'),
					'description' => $this->input->post('description')
				));
				redirect('admin/viewEntry/'.$entry->id);
			}
		}
	}

	function do_upload()
	{
		$config['upload_path'] = './uploads/';
		$config['allowed_types'] = 'jpg|png|jpeg';
		$config['max_size']	= '1000';
		$config['max_width']  = '4000';
		$config['max_height']  = '4000';

		$this->db->select_max('id');
		$query = $this->db->get('image');
		$id = $query->row()->id;
		$config['file_name'] = $id;

		$this->load->library('upload', $config);

		if ( ! $this->upload->do_upload())
		{
			$error = array('error' => $this->upload->display_errors());
			return $error;
		}
		else
		{
			
			$data = array('upload_data' => $this->upload->data());
			return $data;
		}
	}

	public function imageEdit($entryId = null, $id = null){
		// $this->form_validation->set_rules('title', 'Title', 'trim|required|min_length[3]|max_length[45]|xss_clean');
		$this->form_validation->set_rules('description', 'Description', 'trim|required|xss_clean');
		if ($this->form_validation->run() == FALSE) {
			if($id != null) {
				$image = $this->image->getImage($id);
				$data = array(
						'title' => $image->title,
						'description' => $image->description,
						'id' => $id,
						'entryId' => $image->entryId,
						'path'=> $image->path
					);
				$this->load->view('admin_editimage', $data);
			}
			else if($entryId) {
				$data = array(
					'title' => '',
					'description' => '',
					'entryId' => $entryId,
					'path'=> ''
				);
				$this->load->view('admin_editimage', $data);	
			}
			else echo "No entry id sent in.... ";
		}
		else {
			
				// echo $this->input->post('imageFile');
				$imageResult = $this->do_upload();
				if(!isset($imageResult['error']) || $imageResult['error'] == "<p>You did not select a file to upload.</p>"){
					
					$entryId = $this->input->post('entryId');

					$data = array(
						'title' => $this->input->post('title'),
						'description' => $this->input->post('description')
					);
					if(!isset($imageResult['error'])){
						$data['path'] = $imageResult["upload_data"]["file_name"];
						$data['width'] = $imageResult["upload_data"]["image_width"];
						$data['height'] = $imageResult["upload_data"]["image_height"];
					}

					$id = $this->input->post('id');
					if($id && $id != '')
						$id = $this->image->update($id, $data);
					else {
						$data['entryId'] = $entryId;
						$id = $this->image->insert($data);
					}

					redirect('admin/viewEntry/'.$entryId);
				}
				else echo json_encode($imageResult);

				// $this->entry->update($id, array(
				//	'title' => $this->input->post('title'),
				//	'description' => $this->input->post('description')
				// ));
				// redirect('admin/viewEntry/'.$id);
			
		}
	}

	public function deleteEntry($id){
		$this->entry->delete($id);
		redirect('admin/');
	}

	public function deleteImage($id){
		$image = $this->image->getImage($id);
		$this->image->delete($id);
		unlink('./uploads/'.$image->path);
		redirect('admin/viewEntry/'.$image->entryId);
	}
}