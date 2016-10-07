<?php
$pageId = 'lastUnseenMail';
$title = 'Letzte ungelesene Mail';
?>
<?php ob_start() ?>
	<div class="container">
		<div class="row">
<?php
if (isset($fail)) {
?>
			<div class="mail">
				<div class="fail"><?php echo $fail; ?></div>
			</div>
<?php
} else {
?>
			<div class="mail">
				<div class="head">
					<span class="subject"><?php echo $header["subject"]; ?></span>
					<span class="from">from <?php echo $header["from"]; ?></span>
					<span class="to">to <?php echo $header["to"]; ?></span>
					<span class="date">on <?php echo $header["date"]; ?></span>
				</div>

				<pre class="body"><?php echo $message; ?></pre>
				<?php if (isset($errors)) echo '<div class="errors">'.join("<br />\n", $errors).'</div>'; ?>
				<?php if (isset($alerts)) echo '<div class="alerts">'.$alerts.'</div>'; ?>
			</div>
<?php
}
?>
		</div>
	</div>
<?php $content = ob_get_clean() ?>
<?php include 'page.php' ?>
