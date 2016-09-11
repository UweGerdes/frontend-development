/*
 * Vergleich von HTML-Style-Trees für Regressions- und Back-to-Back-Tests
 *
 * (c) Uwe Gerdes, entwicklung@uwegerdes.de
 */
'use strict';

function getStyles(element1, element2, properties) {
	var result = [];
	var what = {};
	for(var i in properties) {
		what[properties[i]] = (element1[properties[i]] + "").trim();
	}
	var hasChildWithSameTextContent = false;
	var ownTextContent = element1.textContent;
	element1.childElementInfo.forEach(function(element) {
		if (element.textContent == element1.textContent) {
			hasChildWithSameTextContent = true;
		}
		ownTextContent = ownTextContent.replace(element.textContent, "");
	});
	result.push({
		tagName1: element1.tagName,
		elementId1: element1.elementId,
		cssclass1: element1.cssclass,
		type1: element1.type,
		name1: element1.name,
		value1: element1.value,
		textContent1: element1.textContent.trim(),
		ownTextContent: element1.textContent.trim(),
		error: "Element auf anderer Seite nicht gefunden - Suche nach: " + properties
	});
	element1.childElementInfo.forEach(function(element) {
		result.push(getStyles(element, properties));
	});
	return result;
}

function search(element, what) {
	var found;
	element.childElementInfo.forEach(function(elem) {
		var res = search(elem, what);
		if (res !== undefined) {
			found = res;
		}
	});
	// TODO: success / found logic correct?
	var success = true;
	for(var key in what) {
		if (!element.hasOwnProperty(key) || (element[key] + "").trim() !== what[key]) {
			success = false;
			break;
		}
	}
	if (success) {
		found = element;
	}
	return found;
}

module.exports = function(styleTree) {
	return {
		getStyleTree: function() {
			return styleTree;
		},
		getStyles: function(other, properties) {
			return getStyles(styleTree[0], properties);
		},
		search: function(what) {
			return search(styleTree[0], what);
		}
	};
};
