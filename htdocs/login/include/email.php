<?php
##
# Klasse zum Zusammenstellen und Versenden von E-Mails
#
# Es werden beliebige Header-Informationen, text/plain und text/html Inhalte
# sowie beliebige Anhänge zu einer E-Mail zusammengestellt.
#
# Zu Testzwecken kann die Ausgabe auch auf einer HTML-Seite ausgegeben werden.
#
##

class Email {
	var $sendTo = "";
	var $from = "";
	var $subject = "";
	var $header = array();
	var $charset = "utf-8";
	var $text = "";
	var $html = "";
	var $attachments;
	var $alternativeSeparator = "-- alternative --";
	var $contentSeparator = "-- mixed --";

	function addHeader($item) {
		$this->header[] = $item;
	}

	function from($address) {
		$this->from = $address;
	}

	function sentTo($address) {
		$this->sendTo = $address;
	}
	
	function subject($subject) {
		$this->subject = $subject;
	}

	function setText($text) {
		$this->text = $text;
	}

	function setHtml($html) {
		$this->html = $html;
	}

	/**
	 * add attachment to the mail
	 * 
	 * @param String $name filename
	 * @param raw $content
	 * @param String $mime_type
	 */
	function addAttachment($name, $content, $mime_type) {
		$attachment['name'] = $name;
		$attachment['content'] = base64_encode($content);
		$attachment['mime_type'] = $mime_type;
		$this->attachments[] = $attachment;
	}

	/**
	 * create the basic headers
	 * 
	 * return array<string> header elements
	 */
	function getBasicHeader() {
		$extraString = "". time() . rand(0,1000);
		$header[] = "Message-ID: <".$extraString. "@uwegerdes.de>";
		$header[] = "X-Mailer: Uwe Gerdes PHP Mailer";
		$header[] = "Date: ".date("D, d M y H:i:s O (T)");
		$header[] = "MIME-Version: 1.0";
		return array_merge($this->header, $header);
	}

	/**
	 * get the headers for text content
	 * 
	 * @param bool $encodeqp use quoted printable encoding
	 * return array<string> header elements
	 */
	function getTextHeader($encodeqp) {
		$header[] = "Content-Type: text/plain; charset=" . $this->charset;
		if ($encodeqp) {
			$header[] = "Content-Transfer-Encoding: quoted-printable";
		} else {
			$header[] = "Content-Transfer-Encoding: 8-bit";
		}
		return $header;
	}

	/**
	 * get the headers for html content
	 * 
	 * @param bool $encodeqp use quoted printable encoding
	 * return array<string> header elements
	 */
	function getHtmlHeader($encodeqp) {
		$header[] = "Content-Type: text/html; charset=" . $this->charset;
		if ($encodeqp) {
			$header[] = "Content-Transfer-Encoding: quoted-printable";
		} else {
			$header[] = "Content-Transfer-Encoding: 8-bit";
		}
		return $header;
	}

	/**
	 * get the headers for alternative content
	 * 
	 * return array<string> header elements
	 */
	function getAlternativeHeader() {
		$extraString = "". time() . rand(0,1000);
		$this->alternativeSeparator = "-- alternative".$extraString." --";
		$header[] = "Content-Type: multipart/alternative;";
		$header[] = "   boundary=\"".$this->alternativeSeparator."\"";
		return $header;
	}

	/**
	 * get the headers for mixed content
	 * 
	 * return array<string> header elements
	 */
	function getMixedHeader() {
		$extraString = "". time() . rand(0,1000);
		$this->contentSeparator = "-- mixed".$extraString." --";
		$header[] = "Content-Type: multipart/mixed;";
		$header[] = "   boundary=\"".$this->contentSeparator."\"";
		return $header;
	}

	/**
	 * get the text content and encode it with encodedqp or not
	 * 
	 * @param bool $encodeqp use quoted printable encoding
	 * @return string text content
	 */
	function getTextContent($encodeqp) {
		if ($encodeqp) {
			return quoted_printable_encode($this->text);
		} else {
			return $this->text;
		}
	}

	/**
	 * get the html content and encode it with encodedqp or htmlentities
	 * 
	 * @param bool $encodeqp use quoted printable encoding
	 * @return string html content
	 */
	function getHtmlContent($encodeqp) {
		if ($encodeqp) {
			return quoted_printable_encode($this->html);
		} else {
			return htmlentities($this->html);
		}
	}

	/**
	 * get alternative content with text and html
	 * 
	 * @param bool $encodeqp use quoted printable encoding
	 * @return array<string> alternative content elements
	 */
	function getAlternativeContent($encodeqp) {
		$content[] = "--".$this->alternativeSeparator;
		$content = array_merge($content, $this->getTextHeader($encodeqp));
		$content[] = "";
		$content[] = $this->getTextContent($encodeqp);
		$content[] = "";
		$content[] = "--".$this->alternativeSeparator;
		$content = array_merge($content, $this->getHtmlHeader($encodeqp));
		$content[] = "";
		$content[] = $this->getHtmlContent($encodeqp);
		$content[] = "";
		$content[] = "--".$this->alternativeSeparator."--";
		$content[] = "";
		return $content;
	}

	/**
	 * 
	 * 
	 * Content-Type: application/pdf; name="14-UG-Feb.pdf"
Content-Disposition: attachment; filename="14-UG-Feb.pdf"
Content-Transfer-Encoding: base64

	 * @param unknown $encodeqp
	 * @return unknown
	 */
	function getMixedContent($encodeqp) {
		
		
		return $mixedContent;
	}
	/**
	 * compose headers depending on parts
	 * 
	 * @param bool $encodeqp use quoted printable encoding
	 * @return array<string> header elements
	 */
	function getCompleteHeader($encodeqp) {
		$header = $this->getBasicHeader();
		if (is_array($this->attachments)) {
			$header = array_merge($header, $this->getMixedHeader());
		} elseif ($this->html && $this->text) {
			$header = array_merge($header, $this->getAlternativeHeader());
		} elseif ($this->html) {
			$header = array_merge($header, $this->getHtmlHeader($encodeqp));
		} elseif ($this->text) {
			$header = array_merge($header, $this->getTextHeader($encodeqp));
		} else {
			# what to do with no content
		}
		return $header;
	}

	/**
	 * compose the content depending on parts
	 * 
	 * @param bool $encodeqp use quoted printable encoding
	 * @return array<String> content elements
	 */
	function getCompleteContent($encodeqp) {
		$content = array();
		if (is_array($this->attachments)) {
			$content[] = "This is a multi-part message in MIME format";
			$content[] = "";
			$content[] = "--".$this->contentSeparator;
		} elseif ($this->html && $this->text) {
			$content = $this->getAlternativeContent($encodeqp);
		} elseif ($this->html) {
			$content[] = $this->getHtmlContent($encodeqp);
			$content[] = "";
		} elseif ($this->text) {
			$content[] = $this->getTextContent($encodeqp);
			$content[] = "";
		} else {
			$content[] = "default content created by email.php";
			$content[] = "";
		}
		return $content;
	}

	/**
	 * create header, content and send email
	 * 
	 * @return bool send email success
	 */
	function sendEmail() {
		$success = false;
		if ($this->sendTo && $this->subject && $this->from) {
			$mailHeader = join("\r\n", $this->getCompleteHeader(true));
			$mailContent = join("\r\n", $this->getCompleteContent(true));
			$success = @mail($this->sendTo, $this->subject, $mailContent, $mailHeader, "-f" . $this->from);
			if(!$success) {
				$header = "Reply-to: " . $this->from . "\r\n" . $mailHeader;
				$success = @mail($this->sendTo, $this->subject, $mailContent, $mailHeader);
			}
		}
		return $success;
	}

	/**
	 * get the email content for testing
	 * 
	 * @return string the mail
	 */
	function toString() {
		$mailHeader = "To: " . $this->sendTo . "\r\n";
		$mailHeader .= "From: " . $this->from . "\r\n";
		$mailHeader .= "Subject: " . $this->subject . "\r\n";
		$mailHeader .= join("\r\n", $this->getCompleteHeader(false));
		$mailContent = join("\r\n", $this->getCompleteContent(false));
		return $mailHeader."\r\n\r\n".$mailContent;
	}
}
?>