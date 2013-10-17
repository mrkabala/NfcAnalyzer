(function () {
    var resourceGlobalization = new Windows.ApplicationModel.Resources.ResourceLoader();

    function utf8Decode(byteArray) {
        var textString = "";
        var i = 0;
        var byte0 = byte1 = byte2 = 0;
 
        while (i < byteArray.length) {
 
            byte0 = byteArray[i];
 
            if (byte0 < 128) {
                textString += String.fromCharCode(byte0);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                byte1 = byteArray[i + 1];
                textString += String.fromCharCode(((byte0 & 0x1F) << 6) | (byte1 & 0x3F));
                i += 2;
            }
            else {
                byte1 = byteArray[i + 1];
                byte2 = byteArray[i + 2];
                textString += String.fromCharCode(((byte0 & 0x0F) << 12) | ((byte1 & 0x3F) << 6) | (byte2 & 63));
                i += 3;
            }
        }
 
        return textString;
    }

    function splitUnescaped(textStr, splitChar) {
        var charSplitArray = textStr.split(splitChar);
        var splitArray = new Array;
        var j = 0;

        for (var i = 0; i < charSplitArray.length; i++) {
            if ((splitArray[j]) && (splitArray[j].length > 0)) {
                splitArray[j] += splitChar + charSplitArray[i];
            } else {
                splitArray[j] = charSplitArray[i];
            }
            var lastchar = charSplitArray[i].substr(-1);
            if (lastchar != "\\") j++;
        }

        return splitArray;
    }

    function parseValue(textStr) {
        textStr = textStr.replace(/\,/g, ","); // Ref. RFC6350 Section 3.4
        textStr = textStr.replace(/\\;/g, ';'); // Ref. RFC6350 Section 3.4
        textStr = textStr.replace(/\\\\/g, String.fromCharCode(0x005C)); // Ref. RFC6350 Section 3.4
        return textStr;
    }

    function parseName(paramArray, nameArray, domObj) {
        var paramName = paramArray.join(";");
        if (paramName == 'N') domObj.appendChild(document.createTextNode(resourceGlobalization.getString('NameHdr')));
        else domObj.appendChild(document.createTextNode(paramName));
        domObj.appendChild(document.createElement("br"));

        var objDiv = document.createElement("div");
        objDiv.className = "FlexDivIndented";
        if ((nameArray.length > 0) && (nameArray[0].length > 0)) {
            var familyArray = splitUnescaped(nameArray[0], ",");
            if (familyArray.length > 1) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('FamNamesHdr') + " "));
            } else {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('FamNameHdr') + " "));
            }
            for (var i = 0; i < familyArray.length; i++) {
                objDiv.appendChild(document.createTextNode(parseValue(familyArray[i])));
                if (i < familyArray.length - 1) {
                    objDiv.appendChild(document.createTextNode(", "));
                }
            }
            objDiv.appendChild(document.createElement("br"));
        }
        if ((nameArray.length > 1) && (nameArray[1].length > 0)) {
            var givenArray = splitUnescaped(nameArray[1], ",");
            if (givenArray.length > 1) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('GivenNamesHdr') + " "));
            } else {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('GivenNameHdr') + " "));
            }
            for (i = 0; i < givenArray.length; i++) {
                objDiv.appendChild(document.createTextNode(parseValue(givenArray[i])));
                if (i < givenArray.length - 1) {
                    objDiv.appendChild(document.createTextNode(", "));
                }
            }
            objDiv.appendChild(document.createElement("br"));
        }
        if ((nameArray.length > 2) && (nameArray[2].length > 0)) {
            var additionalArray = splitUnescaped(nameArray[2], ",");
            if (additionalArray.length > 1) {
                objDiv.appendChild(document.createTextNode("Additional Names: "));
            } else {
                objDiv.appendChild(document.createTextNode("Additional Name: "));
            }
            for (i = 0; i < additionalArray.length; i++) {
                objDiv.appendChild(document.createTextNode(parseValue(additionalArray[i])));
                if (i < additionalArray.length - 1) {
                    objDiv.appendChild(document.createTextNode(", "));
                }
            }
            objDiv.appendChild(document.createElement("br"));
        }
        if ((nameArray.length > 3) && (nameArray[3].length > 0)) {
            var prefixArray = splitUnescaped(nameArray[3], ",");
            if (prefixArray.length > 1) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('HonPrefixesHdr') + " "));
            } else {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('HonPrefixHdr') + " "));
            }
            for (i = 0; i < prefixArray.length; i++) {
                objDiv.appendChild(document.createTextNode(parseValue(prefixArray[i])));
                if (i < prefixArray.length - 1) {
                    objDiv.appendChild(document.createTextNode(", "));
                }
            }
            objDiv.appendChild(document.createElement("br"));
        }
        if ((nameArray.length > 4) && (nameArray[4].length > 0)) {
            var suffixArray = splitUnescaped(nameArray[4], ",");
            if (suffixArray.length > 1) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('HonSuffixesHdr') + " "));
            } else {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('HonSuffixHdr') + " "));
            }
            for (i = 0; i < suffixArray.length; i++) {
                objDiv.appendChild(document.createTextNode(parseValue(suffixArray[i])));
                if (i < suffixArray.length - 1) {
                    objDiv.appendChild(document.createTextNode(", "));
                }
            }
            objDiv.appendChild(document.createElement("br"));
        }
        domObj.appendChild(objDiv);
    }

    function parseAddress(paramArray, addressArray, domObj) {
        // Need to add GEO and TZ with this code.
        // Need to add LABEL property.
        var paramName = paramArray.join(";");
        var preferredAddress = "";
        if (paramArray[0] == 'ADR') {
            if (paramArray.length == 1) {
                paramName = resourceGlobalization.getString('AddressHdr');
            } else {
                for (var i = 1; i < paramArray.length; i++) {
                    if (paramArray[i].substr(0,4) == 'GEO=') {
                    } else if (paramArray[i].substr(0, 3) == 'TZ=') {
                    } else if (paramArray[i].substr(0, 6) == 'LABEL=') {
                    } else if (paramArray[i].substr(0, 4) == 'PREF') {
                        if (paramArray.length > 2) {
                            i++;
                            preferredAddress = resourceGlobalization.getString('PrefParam');
                        }
                    } else if (paramArray[1] == 'HOME') {
                        paramName = resourceGlobalization.getString('HmAdrHdr');
                    } else if (paramArray[1] == 'WORK') {
                        paramName = resourceGlobalization.getString('WkAdrHdr');
                    } else {
                        paramName = paramArray[i];
                    }
                }
            }
        }
        if (preferredAddress) {
            domObj.appendChild(document.createTextNode(preferredAddress + " "));
        }
        domObj.appendChild(document.createTextNode(paramName));
        domObj.appendChild(document.createElement("br"));
        var objDiv = document.createElement("div");
        objDiv.className = "FlexDivIndented";
        if ((addressArray.length > 0) && (addressArray[0].length > 0)) {
            var pobArray = splitUnescaped(addressArray[0], ",");
            if (pobArray.length > 1) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('POBoxesHdr') + " "));
            } else {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('POBoxHdr') + " "));
            }
            for (var i = 0; i < pobArray.length; i++) {
                objDiv.appendChild(document.createTextNode(parseValue(pobArray[i])));
                if (i < pobArray.length - 1) {
                    objDiv.appendChild(document.createTextNode(", "));
                }
            }
            objDiv.appendChild(document.createElement("br"));
        }
        if ((addressArray.length > 1) && (addressArray[1].length > 0)) {
            var extendedArray = splitUnescaped(addressArray[1], ",");
            if (extendedArray.length > 1) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('ExtAddressesHdr') + " "));
            } else {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('ExtAddressHdr') + " "));
            }
            for (i = 0; i < extendedArray.length; i++) {
                objDiv.appendChild(document.createTextNode(parseValue(extendedArray[i])));
                if (i < extendedArray.length - 1) {
                    objDiv.appendChild(document.createTextNode(", "));
                }
            }
            objDiv.appendChild(document.createElement("br"));
        }
        if ((addressArray.length > 2) && (addressArray[2].length > 0)) {
            var streetlArray = splitUnescaped(addressArray[2], ",");
            if (streetlArray.length > 1) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('StreetAddrsHdr') + " "));
            } else {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('StreetAddrHdr') + " "));
            }
            for (i = 0; i < streetlArray.length; i++) {
                objDiv.appendChild(document.createTextNode(parseValue(streetlArray[i])));
                if (i < streetlArray.length - 1) {
                    objDiv.appendChild(document.createTextNode(", "));
                }
            }
            objDiv.appendChild(document.createElement("br"));
        }
        if ((addressArray.length > 3) && (addressArray[3].length > 0)) {
            var localityArray = splitUnescaped(addressArray[3], ",");
            if (localityArray.length > 1) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('CitiesHdr') + " "));
            } else {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('CityHdr') + " "));
            }
            for (i = 0; i < localityArray.length; i++) {
                objDiv.appendChild(document.createTextNode(parseValue(localityArray[i])));
                if (i < localityArray.length - 1) {
                    objDiv.appendChild(document.createTextNode(", "));
                }
            }
            objDiv.appendChild(document.createElement("br"));
        }
        if ((addressArray.length > 4) && (addressArray[4].length > 0)) {
            var regionArray = splitUnescaped(addressArray[4], ",");
            if (regionArray.length > 1) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('RegionsHdr') + " "));
            } else {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('RegionHdr') + " "));
            }
            for (i = 0; i < regionArray.length; i++) {
                objDiv.appendChild(document.createTextNode(parseValue(regionArray[i])));
                if (i < regionArray.length - 1) {
                    objDiv.appendChild(document.createTextNode(", "));
                }
            }
            objDiv.appendChild(document.createElement("br"));
        }
        if ((addressArray.length > 5) && (addressArray[5].length > 0)) {
            var postalCodeArray = splitUnescaped(addressArray[5], ",");
            if (postalCodeArray.length > 1) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('PostalCodesHdr') + " "));
            } else {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('PostalCodeHdr') + " "));
            }
            for (i = 0; i < postalCodeArray.length; i++) {
                objDiv.appendChild(document.createTextNode(parseValue(postalCodeArray[i])));
                if (i < postalCodeArray.length - 1) {
                    objDiv.appendChild(document.createTextNode(", "));
                }
            }
            objDiv.appendChild(document.createElement("br"));
        }
        if ((addressArray.length > 6) && (addressArray[6].length > 0)) {
            var countryArray = splitUnescaped(addressArray[6], ",");
            if (countryArray.length > 1) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('CountriesHdr') + " "));
            } else {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('CountryHdr') + " "));
            }
            for (i = 0; i < countryArray.length; i++) {
                objDiv.appendChild(document.createTextNode(parseValue(countryArray[i])));
                if (i < countryArray.length - 1) {
                    objDiv.appendChild(document.createTextNode(", "));
                }
            }
            objDiv.appendChild(document.createElement("br"));
        }
        domObj.appendChild(objDiv);
    }

    function parsePhone(paramArray, valueStr, objDiv) {
        var paramName = paramArray.join(";");
        var preferredPhone = "";
        var isVoicePhone = false;
        var isCellPhone = false;
        if (paramArray[0] == 'TEL') {
            paramName = resourceGlobalization.getString('TelHdr');
            if (paramArray.length > 1) {
                for (var i = 1; i < paramArray.length; i++) {
                if (paramArray[i].substr(0, 6) == 'VALUE=') {
                } else if (paramArray[i].substr(0, 5) == 'TYPE=') {
                } else if (paramArray[i].substr(0, 4) == 'PREF') {
                    if (paramArray.length > 2) {
                        i++;
                        preferredAddress = resourceGlobalization.getString('PrefParam');
                    }
                } else if (paramArray[i] == 'VOICE') {
                    isVoicePhone = true;
                } else if (paramArray[i] == 'CELL') {
                    isCellPhone = true;
                } else if (paramArray[i].substr(0, 4) == 'FAX=') {
                } else if (paramArray[i].substr(0, 3) == 'VIDEO=') {
                } else if (paramArray[i].substr(0, 6) == 'PAGER=') {
                } else if (paramArray[i].substr(0, 10) == 'TEXTPHONE=') {
                } else if (paramArray[i].substr(0, 11) == 'IANA-TOKEN=') {
                } else if (paramArray[i].substr(0, 7) == 'X-NAME=') {
                } else {
                        paramName = paramArray[i];
                    }
                }
            }
        }
        if (preferredPhone) {
            objDiv.appendChild(document.createTextNode(preferredPhone + " "));
        }
        if (isVoicePhone) {
            objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('VoicePre') + " "));
        }
        if (isCellPhone) {
            objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('CellPre') + " "));
        }
        objDiv.appendChild(document.createTextNode(paramName + " " + parseValue(valueStr)));
    }

    function parseEmail(paramArray, valueStr, objDiv) {
        var paramName = paramArray.join(";");
        var preferredEmail = "";
        if (paramArray[0] == 'EMAIL') {
            if (paramArray.length == 1) {
                paramName = resourceGlobalization.getString('EmailHdr');
            } else {
                var i = 1;
                if (paramArray[i] == 'PREF') {
                    if (paramArray.length > 2) {
                        i++;
                        preferredEmail = resourceGlobalization.getString('PrefParam');
                    }
                }
                if (paramArray[i] == 'INTERNET') {
                    paramName = resourceGlobalization.getString('InetEmailHdr');
                } else {
                    paramName = paramArray[i];
                }
            }
        }
        if (preferredEmail) {
            objDiv.appendChild(document.createTextNode(preferredEmail + " "));
        }
        objDiv.appendChild(document.createTextNode(paramName + " " + parseValue(valueStr)));
    }

    function showMainParam(paramArray, valueStr, valueArray) {
        var showParam = {
            "N": function (objDiv, paramArray, valueStr, valueArray) {
                parseName(paramArray, valueArray, objDiv);
            },
            "ADR": function (objDiv, paramArray, valueStr, valueArray) {
                parseAddress(paramArray, valueArray, objDiv);
            },
            "FN": function (objDiv, paramArray, valueStr, valueArray) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('FormNameHdr') + " " + parseValue(valueStr)));
            },
            "NICKNAME": function (objDiv, paramArray, valueStr, valueArray) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('NicknameHdr') + " " + parseValue(valueStr)));
            },
            "PHOTO": function (objDiv, paramArray, valueStr, valueArray) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('PhotoHdr') + " " + parseValue(valueStr)));
            },
            "BDAY": function (objDiv, paramArray, valueStr, valueArray) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('BdayHdr') + " " + parseValue(valueStr)));
            },
            "ANNIVERSARY": function (objDiv, paramArray, valueStr, valueArray) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('AnnivHdr') + " " + parseValue(valueStr)));
            },
            "GENDER": function (objDiv, paramArray, valueStr, valueArray) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('GenderHdr') + " " + parseValue(valueStr)));
            },
            "TEL": function (objDiv, paramArray, valueStr, valueArray) {
                parsePhone(paramArray, valueStr, objDiv);
            },
            "EMAIL": function (objDiv, paramArray, valueStr, valueArray) {
                parseEmail(paramArray, valueStr, objDiv);
            },
            "IMPP": function (objDiv, paramArray, valueStr, valueArray) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('ImppUriHdr') + " " + parseValue(valueStr)));
            },
            "LANG": function (objDiv, paramArray, valueStr, valueArray) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('LanguageHdr') + " " + parseValue(valueStr)));
            },
            "TZ": function (objDiv, paramArray, valueStr, valueArray) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('TzHdr') + " " + parseValue(valueStr)));
            },
            "GEO": function (objDiv, paramArray, valueStr, valueArray) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('GeoCodeHdr') + " " + parseValue(valueStr)));
            },
            "TITLE": function (objDiv, paramArray, valueStr, valueArray) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('TitleHdr') + " " + parseValue(valueStr)));
            },
            "ROLE": function (objDiv, paramArray, valueStr, valueArray) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('RoleHdr') + " " + parseValue(valueStr)));
            },
            "LOGO": function (objDiv, paramArray, valueStr, valueArray) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('LogoHdr') + " " + parseValue(valueStr)));
            },
            "ORG": function (objDiv, paramArray, valueStr, valueArray) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('OrgHdr') + " " + parseValue(valueStr)));
            },
            "MEMBER": function (objDiv, paramArray, valueStr, valueArray) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('MemberHdr') + " " + parseValue(valueStr)));
            },
            "RELATED": function (objDiv, paramArray, valueStr, valueArray) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('RelatedHdr') + " " + parseValue(valueStr)));
            },
            "CATEGORIES": function (objDiv, paramArray, valueStr, valueArray) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('TagsHdr') + " " + parseValue(valueStr)));
            },
            "NOTE": function (objDiv, paramArray, valueStr, valueArray) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('NoteHdr') + " " + parseValue(valueStr)));
            },
            "PRODID": function (objDiv, paramArray, valueStr, valueArray) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('ProdIdHdr') + " " + parseValue(valueStr)));
            },
            "REV": function (objDiv, paramArray, valueStr, valueArray) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('RevHdr') + " " + parseValue(valueStr)));
            },
            "SOUND": function (objDiv, paramArray, valueStr, valueArray) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('SndUriHdr') + " " + parseValue(valueStr)));
            },
            "UID": function (objDiv, paramArray, valueStr, valueArray) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('UidHdr') + " " + parseValue(valueStr)));
            },
            "CLIENTPIDMAP": function (objDiv, paramArray, valueStr, valueArray) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('CpidMapHdr') + " " + parseValue(valueStr)));
            },
            "URL": function (objDiv, paramArray, valueStr, valueArray) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('UrlHdr') + " " + parseValue(valueStr)));
            },
            "VERSION": function (objDiv, paramArray, valueStr, valueArray) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('VcVersionHdr') + " " + parseValue(valueStr)));
            },
            "KEY": function (objDiv, paramArray, valueStr, valueArray) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('PubKeyOrAuthCertHdr') + " " + parseValue(valueStr)));
            },
            "FBURL": function (objDiv, paramArray, valueStr, valueArray) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('BusyTimeUriHdr') + " " + parseValue(valueStr)));
            },
            "CALADRURI": function (objDiv, paramArray, valueStr, valueArray) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('CalUserAddrUriHdr') + " " + parseValue(valueStr)));
            },
            "CALURI": function (objDiv, paramArray, valueStr, valueArray) {
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('CalUriHdr') + " " + parseValue(valueStr)));
            },
            "default": function (objDiv, paramArray, valueStr, valueArray) {
                objDiv.appendChild(document.createTextNode(mainParam + ": " + parseValue(valueStr)));
            }
        }

        var mainParam = paramArray[0];

        var objDiv = document.createElement("div");
        objDiv.className = "FlexDivIndented";

        if (showParam[mainParam]) {
            showParam[mainParam](objDiv, paramArray, valueStr, valueArray);
        } else {
            showParam["default"](objDiv, valueStr, valueArray);
        }

        return objDiv;
    }

    function parseXVcard(textArray, domObj) {
        var inVcard = false;
        var textString = utf8Decode(textArray);

        textString = textString.replace("\r\n ", ""); // Ref. RFC6350 Section 3.2
        var arrXVcard = textString.split("\r\n");
        for (var i = 0; i < arrXVcard.length; i++) {
            var vCardRecord = arrXVcard[i].split(":");
            if (vCardRecord.length > 1) {
                var paramStr = vCardRecord[0];
                var paramArray = splitUnescaped(paramStr, ";");
                var mainParam = paramArray[0];
                var valueStr = vCardRecord[1];
                var valueArray = splitUnescaped(valueStr, ";");
                //var mainParam = paramArray[0];
                if (inVcard && mainParam == "END") inVcard = false;
                if ((inVcard)  && ((vCardRecord.length < 3) || (valueArray.length > 1))) {
                    var objDiv = showMainParam(paramArray, valueStr, valueArray);
                    //objDiv.appendChild(document.createElement("br"));
                    domObj.appendChild(objDiv);
                }
                if (mainParam == "BEGIN") inVcard = true;
                if (inVcard && vCardRecord.length > 2) {
                    if (valueArray.length == 1) {
                        var subParam = valueStr;
                        var subValueStr = vCardRecord[2];
                        var subValueArray = splitUnescaped(subValueStr, ";");
                    } else {
                        subParam = paramArray[paramArray.length - 1];
                        subValueStr = vCardRecord[2];
                        subValueArray = splitUnescaped(subValueStr, ";");
                    }
                    if (mainParam == "ADR") {
                        if (subParam == "HOME") {
                            objDiv = document.createElement("div");
                            objDiv.className = "FlexDivIndented";
                            objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('HomeAddrHdr') + " " + parseValue(subValueStr)));
                            objDiv.appendChild(document.createElement("br"));
                            domObj.appendChild(objDiv);
                        } else {
                            objDiv = document.createElement("div");
                            objDiv.className = "FlexDivIndented";
                            objDiv.appendChild(document.createTextNode(subParam + " " + resourceGlobalization.getString('AddressHdr') + " " + parseValue(subValueStr)));
                            objDiv.appendChild(document.createElement("br"));
                            domObj.appendChild(objDiv);
                        }
                    } else if (mainParam == "URL") {
                        if (subParam == "fb") {
                            objDiv = document.createElement("div");
                            objDiv.className = "FlexDivIndented";
                            objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('FacebookUrlHdr') + " " + parseValue(subValueStr)));
                            objDiv.appendChild(document.createElement("br"));
                            domObj.appendChild(objDiv);
                        } else {
                            objDiv = document.createElement("div");
                            objDiv.className = "FlexDivIndented";
                            objDiv.appendChild(document.createTextNode(subParam + " " + resourceGlobalization.getString('UrlHdr') + " " + parseValue(valueStr)));
                            objDiv.appendChild(document.createElement("br"));
                            domObj.appendChild(objDiv);
                        }
                    } else {
                        objDiv = document.createElement("div");
                        objDiv.className = "FlexDivIndented";
                        objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('VcardParamHdr') + " " + mainParam + ": " + subParam));
                        objDiv.appendChild(document.createElement("br"));
                        domObj.appendChild(objDiv);
                    }
                }
            }
        }
        objDiv = document.createElement("div");
        objDiv.className = "FlexDivIndented";
        objDiv.appendChild(document.createElement("br"));
        domObj.appendChild(objDiv);

        return arrXVcard;
    }

    function hexVal(rawByte) {
        var returnVal = rawByte.toString(16);
        while (returnVal.length < 2) returnVal = "0" + returnVal;
        return returnVal.toUpperCase();
    }

    function showVcard(typeString, textArray, domObj) {
        if ((typeString.toLowerCase() == "text/vcard") || (typeString.toLowerCase() == "text/x-vcard")) {
            var arrVcard = parseXVcard(textArray, domObj);
        }
    }

    WinJS.Namespace.define("vCard", {
        showVcard: showVcard
    });
})();
