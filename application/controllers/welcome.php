<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Welcome extends CI_Controller {

	/**
	 * Index Page for this controller.
	 *
	 * Maps to the following URL
	 *		http://example.com/index.php/welcome
	 *	- or -  
	 *		http://example.com/index.php/welcome/index
	 *	- or -
	 * Since this controller is set as the default controller in 
	 * config/routes.php, it's displayed at http://example.com/
	 *
	 * So any other public methods not prefixed with an underscore will
	 * map to /index.php/welcome/<method_name>
	 * @see http://codeigniter.com/user_guide/general/urls.html
	 */
	public function index()
	{
		$this->load->view('home');
	}

	public function projectInfo()
	{
		$this->load->model('entry');
		$entries = $this->entry->getAllWithImageInfo();
		echo json_encode($entries);
	}

	public function info(){
		$this->load->view('info');
	}

	public function email(){
		$address = $this->input->post('address');
		$this->db->insert('email', array('email'=> $address));

		$config = Array(
		    'protocol' => 'smtp',
		    'smtp_host' => 'ssl://smtp.googlemail.com',
		    'smtp_port' => 465,
		    'smtp_user' => 'xxx',
		    'smtp_pass' => 'xxx',
		    'mailtype'  => 'html', 
		    'charset'   => 'iso-8859-1'
		);
		$this->load->library('email', $config);
		$this->email->set_newline("\r\n");


		$this->email->from('wazztone@gmail.com', 'Chase Wasden');
		$this->email->to('ccwasden@gmail.com'); 
		// $this->email->cc('another@another-example.com'); 
		// $this->email->bcc('them@their-example.com'); 

		$this->email->subject('Resume Request');
		$this->email->message('This email has requested your resume: '.$address);	

		$this->email->send();

		echo $this->email->print_debugger();

	}
}

/* End of file welcome.php */
/* Location: ./application/controllers/welcome.php */