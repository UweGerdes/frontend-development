/*
 * Vergleich von HTML-Style-Trees für Regressions- und Back-to-Back-Tests
 *
 * (c) Uwe Gerdes, entwicklung@uwegerdes.de
 */
'use strict';

var totalError = false;

function compare(element1, element2, properties) {
	var errorProperties = ['cursor', 'background-color', 'font-weight'];
	var result = [];
	var what = {};
	for(var i in properties) {
		what[properties[i]] = (element1[properties[i]] + "").trim();
	}
	var styleDifference = [];
	var hasChildWithSameTextContent = false;
	var ownTextContent = element1.textContent;
	element1.childElementInfo.forEach(function(element) {
		if (element.textContent == element1.textContent) {
			hasChildWithSameTextContent = true;
		}
		ownTextContent = ownTextContent.replace(element.textContent, "");
	});
	var otherElement = search(element2, what);
	if (otherElement) {
		var errorList = [];
		Object.keys(element1.style).forEach(function(key) {
			var thisValue = normalize(element1.style[key]);
			if (otherElement.style.hasOwnProperty(key)) {
				var otherValue = normalize(otherElement.style[key]);
				if (thisValue != otherValue) {
					var styleDiff = {property: key, style1: thisValue, style2: otherValue};
					if (errorProperties.indexOf(key) > -1) {
						styleDiff.error = true;
						errorList.push(key);
						totalError = true;
					}
					styleDifference.push(styleDiff);
				}
			}
		});
		result.push({
			tagName1: element1.tagName,
			tagName2: otherElement.tagName,
			elementId1: element1.elementId,
			elementId2: otherElement.elementId,
			cssclass1: element1.cssclass,
			cssclass2: otherElement.cssclass,
			type1: element1.type,
			type2: otherElement.type,
			name1: element1.name,
			name2: otherElement.name,
			value1: element1.value,
			value2: otherElement.value,
			textContent1: element1.textContent,
			textContent2: otherElement.textContent,
			ownTextContent: ownTextContent.trim(),
			styleDiff: styleDifference,
			errorList: errorList
		});
		if (errorList.length > 0) {
			result.error = 'Differenzen bei: ' + errorList.join(', ');
		}
	} else {
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
	}
	element1.childElementInfo.forEach(function(element) {
		if (otherElement) {
			result.push(compare(element, otherElement, properties));
		} else {
			result.push(compare(element, element2, properties));
		}
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

function normalize(val) {
	var colorNames = /(transparent|white|black)/;
	var colorHex = /#([0-9A-za-z]{2})([0-9A-za-z]{2})([0-9A-za-z]{2})/;
	var colorRgb = /rgb\(([0-9]+, ?[0-9]+, ?[0-9]+)\)/;
	var result = "";
	if (val.match(colorRgb)) {
		result = 'rgba(' + RegExp.$1 + ', 255)';
	} else if (val.match(colorHex)){
		result = 'rgba(' + parseInt(RegExp.$1, 16) + ', ' + parseInt(RegExp.$2, 16) + ', ' + parseInt(RegExp.$3, 16) + ', 255)';
	} else if (val.match(colorNames)) {
		if (val == 'transparent') {
			result = 'rgba(0, 0, 0, 0)';
		} else if (val == 'white') {
			result = 'rgba(255, 255, 255, 255)';
		} else if (val == 'transparent') {
			result = 'rgba(0, 0, 0, 255)';
		} else {
			result = val;
		}
	} else {
		result = val;
	}
	return result.replace(/, +/g, ',');
}

module.exports = function(styleTree) {
	return {
		getStyleTree: function() {
			return styleTree;
		},
		compareTo: function(other, properties) {
			return compare(styleTree[0], other.getStyleTree()[0], properties);
		},
		search: function(what) {
			return search(styleTree[0], what);
		},
		totalError: function() {
			return totalError;
		}
	};
};
