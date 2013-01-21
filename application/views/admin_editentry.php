<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>Welcome to CodeIgniter</title>
	<link type="text/css" href="<?php echo base_url()?>static/css/style.css" rel="stylesheet"/>
</head>
<body>

<div id="container">
	<?php
		$entryId = isset($id) ? $id : null;
		$hidden = array('id' => set_value('id', $entryId));
		$url = 'admin/edit'.(isset($id) ? '/'.$entryId : '');
		echo form_open($url, '', $hidden);
		echo form_error('title');
		echo form_label('Title', 'title');
		echo form_input('title', set_value('title', $title));
		echo form_error('description');
		echo form_label('Description', 'description');
		echo form_textarea('description', set_value('description', $description));
		echo form_submit('mysubmit', 'Save');
		if(!$entryId) {
			echo "<a href='".base_url()."/admin/'>Cancel</a>";
		}
		else {
			echo "<a href='".base_url()."admin/viewEntry/".$entryId."'>Cancel</a>";
		}
		echo form_close();
	?>
</div>

</body>
</html>