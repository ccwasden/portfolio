<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>Welcome to CodeIgniter</title>
	<link type="text/css" href="<?php echo base_url()?>/static/css/style.css" rel="stylesheet"/>
</head>
<body>

<div id="container">

	<?php
		$imageId = isset($id) ? $id : null;
		echo "<h1>Edit Image Of Id: $imageId</h1>";
		$hidden = array('id' => set_value('id', $imageId), 'entryId' => $entryId);
		$url = 'admin/imageEdit/'.$entryId.($imageId ? '/'.$imageId : '');
		echo form_open_multipart($url, '', $hidden);
		echo form_error('title');
		echo form_label('Title', 'title');
		echo form_input('title', set_value('title', $title));
		echo form_error('description');
		echo form_label('Description', 'description');
		echo form_textarea('description', set_value('description', $description));
		echo "<img src='".base_url()."/uploads/$path'>";
		echo form_upload('userfile');
		echo form_submit('upload', 'Save');
		if(!$entryId) {
			echo "<a href='".base_url()."admin/'>Cancel</a>";
		}
		else {
			echo "<a href='".base_url()."admin/viewEntry/".$entryId."'>Cancel</a>";
		}
		echo form_close();

		if($imageId) echo "<a href=\"".base_url()."admin/deleteImage/$imageId\">delete</a>";
	?>

</div>

</body>
</html>