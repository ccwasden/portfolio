<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>Admin</title>
	<link type="text/css" href="<?php echo base_url()?>static/css/style.css" rel="stylesheet"/>
</head>
<body>

<div id="container">
	<h1>Projects</h1>
	<a href="<?php echo base_url()?>admin/edit">new project</a>
	<ul class="imageList">
		<?php foreach($entries as $entry): ?>
			<li><a href="<?php echo base_url()?>admin/viewEntry/<?=$entry->id?>"><?=$entry->title?></a></li>
	    <?php endforeach; ?>
	</ul>
</div>

</body>
</html>