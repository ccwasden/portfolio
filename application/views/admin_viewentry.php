<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>Welcome to CodeIgniter</title>
	<link type="text/css" href="<?php echo base_url()?>static/css/style.css" rel="stylesheet"/>
</head>
<body>

<div id="container">
	<a href="<?php echo base_url()?>admin">Back to list</a>
	<h1><?=$entry->title?></h1>
	<h2><?=$entry->description?></h1>
	<a href="<?php echo base_url()?>admin/edit/<?=$entry->id?>">edit</a>
	<a href="<?php echo base_url()?>admin/deleteEntry/<?=$entry->id?>">delete</a>
	<a href="<?php echo base_url()?>admin/imageEdit/<?=$entry->id?>">add image</a>
	<ul class="imageList">
	<?php foreach($entry->images as $image): ?>
		<li>
			<img src="<?php echo base_url()?>uploads/<?=$image->path?>">
			<br>
			<?=$image->title?>
			<br>
			<?=$image->description?>
			<br>
			<a href="<?php echo base_url()?>admin/imageEdit/<?=$entry->id?>/<?=$image->id?>">edit</a>
		</li>
    <?php endforeach; ?>
	</ul>	
</div>

</body>
</html>