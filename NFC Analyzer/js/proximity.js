(function () {
    var resourceGlobalization = new Windows.ApplicationModel.Resources.ResourceLoader();
    var proximityDevice = null;
    var messageDiv = null;

    function hexVal(rawByte) {
        var returnVal = rawByte.toString(16);
        while (returnVal.length < 2) returnVal = "0" + returnVal;
        return returnVal.toUpperCase();
    }

    function utf16Val(rawWord) {
        var returnVal = rawWord.toString(16);
        while (returnVal.length < 4) returnVal = "0" + returnVal;
        return returnVal.toUpperCase();
    }

    function clearMessageDiv() {
        while (messageDiv && messageDiv.hasChildNodes()) messageDiv.removeChild(messageDiv.firstChild);
    }

    function initializeProximityDevice() {
        proximityDevice = Windows.Networking.Proximity.ProximityDevice.getDefault();

        if (proximityDevice != null) return true;
        else return false;
    }

    function proximityDeviceArrived(e) {
        clearMessageDiv();

        var objDiv = document.createElement("div");
        objDiv.className = "FlexDiv";
        if ((proximityDevice) && (proximityDevice.target) && (proximityDevice.target.deviceId)) {
            objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('tagArrivedMsg') + "   " + resourceGlobalization.getString('id') + " = " + proximityDevice.target.deviceId));
        } else {
            objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('tagArrivedMsg')));
        }
        objDiv.appendChild(document.createElement("br"));
        objDiv.appendChild(document.createElement("br"));
        messageDiv.appendChild(objDiv);

        showNoTextMessage = true;
    }

    function proximityDeviceDeparted(e) {
        var objDiv = document.createElement("div");
        objDiv.className = "FlexDiv";
        if ((proximityDevice) && (proximityDevice.target) && (proximityDevice.target.deviceId)) {
            objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('tagDepartedMsg') + "   " + resourceGlobalization.getString('id') + " = " + proximityDevice.target.deviceId));
        } else {
            objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('tagDepartedMsg')));
        }
        objDiv.appendChild(document.createElement("br"));
        objDiv.appendChild(document.createElement("br"));
        messageDiv.appendChild(objDiv);
    }

    function messageReceived(device, message, targetDiv) {
        var spanObj = document.createElement("span");
        spanObj.style.marginRight = "20px";
        spanObj.appendChild(document.createTextNode(resourceGlobalization.getString('MsgTypeHdr') + " " + message.messageType + "."));
        targetDiv.appendChild(spanObj);
    }

    function writeableTagReceived(device, message) {
        var objDiv = document.createElement("div");
        objDiv.className = "FlexDiv";
        messageReceived(device, message, objDiv);
        var dataReader = Windows.Storage.Streams.DataReader.fromBuffer(message.data);
        dataReader.byteOrder = Windows.Storage.Streams.ByteOrder.littleEndian;
        var maxLength = dataReader.readInt32(message.data.length);
        objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('MaxLengthHdr') + " " + maxLength + " bytes"));
        objDiv.appendChild(document.createElement("br"));
        objDiv.appendChild(document.createElement("br"));
        messageDiv.appendChild(objDiv);
    }

    function windowsTagReceived(device, message) {
        var objDiv = document.createElement("div");
        objDiv.className = "FlexDiv";
        messageReceived(device, message, objDiv);
        objDiv.appendChild(document.createElement("br"));
        objDiv.appendChild(document.createElement("br"));
        messageDiv.appendChild(objDiv);
    }

    function launchAppTagReceived(device, message) {
        var objDiv = document.createElement("div");
        objDiv.className = "FlexDiv";
        messageReceived(device, message, objDiv);
        objDiv.appendChild(document.createElement("br"));
        objDiv.appendChild(document.createElement("br"));
        messageDiv.appendChild(objDiv);
    }

    function windowsUriTagReceived(device, message) {
        var objDiv = document.createElement("div");
        objDiv.className = "FlexDiv";

        messageReceived(device, message, objDiv);

        objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('UTF-16LE_Msg')));
        objDiv.appendChild(document.createElement("br"));
        objDiv.appendChild(document.createElement("br"));
        messageDiv.appendChild(objDiv);

        var dataReader = Windows.Storage.Streams.DataReader.fromBuffer(message.data);
        dataReader.byteOrder = Windows.Storage.Streams.ByteOrder.littleEndian;
        dataReader.unicodeEncoding = Windows.Storage.Streams.UnicodeEncoding.utf16LE;

        objDiv = document.createElement("div");
        objDiv.className = "FlexDiv";
        objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('MsgLengthHdr') + " " + message.data.length + " " + resourceGlobalization.getString('bytes')));
        objDiv.appendChild(document.createElement("br"));
        objDiv.appendChild(document.createElement("br"));
        messageDiv.appendChild(objDiv);

        var messageWords = "";
        var messageText = "";
        var uriString = "";
        var wordLength = message.data.length / 2;
        for (var i = 0; i < wordLength; i++) {
            var unicode16Char = dataReader.readInt16();
            messageWords += utf16Val(unicode16Char) + " ";
            if (unicode16Char < 32) messageText += '.';
            else messageText += String.fromCharCode(unicode16Char);
            uriString += String.fromCharCode(unicode16Char);
        }

        objDiv = document.createElement("div");
        objDiv.className = "FlexDiv forceWordWrap";
        objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('MsgTextHdr') + " " + messageText));
        objDiv.appendChild(document.createElement("br"));
        objDiv.appendChild(document.createElement("br"));
        messageDiv.appendChild(objDiv);

        objDiv = document.createElement("div");
        objDiv.className = "FlexDiv";
        objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('MsgCharHdr')));
        objDiv.appendChild(document.createElement("br"));
        messageDiv.appendChild(objDiv);

        while (messageWords.length > 80) {
            objDiv = document.createElement("div");
            objDiv.className = "FlexDivIndented";
            objDiv.appendChild(document.createTextNode(messageWords.substr(0, 79)));
            messageWords = messageWords.substr(80);
            objDiv.appendChild(document.createElement("br"));
            messageDiv.appendChild(objDiv);
        }
        objDiv = document.createElement("div");
        objDiv.className = "FlexDivIndented";
        objDiv.appendChild(document.createTextNode(messageWords));
        objDiv.appendChild(document.createElement("br"));
        objDiv.appendChild(document.createElement("br"));
        messageDiv.appendChild(objDiv);

        objDiv = document.createElement("div");
        objDiv.className = "FlexDiv";
        objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('URIHdr') + " " + uriString));
        messageDiv.appendChild(objDiv);

        objDiv = document.createElement("div");
        objDiv.className = "FlexDiv";
        objDiv.appendChild(document.createElement("br"));
        messageDiv.appendChild(objDiv);
    }

    function isMessageBegin(recordFlags) {
        return ((recordFlags & 0x80) != 0);
    }

    function isMessageEnd(recordFlags) {
        return ((recordFlags & 0x40) != 0);
    }

    function isChunkedFormat(recordFlags) {
        return ((recordFlags & 0x20) != 0);
    }

    function isShortRecord(recordFlags) {
        return ((recordFlags & 0x10) != 0);
    }

    function hasIdLength(recordFlags) {
        return ((recordFlags & 0x08) != 0);
    }

    function typeNameFormat(recordFlags) {
        return recordFlags & 0x07;
    }

    function appendNfcMessageFlags(objDiv, recordFlags) {
        if (isMessageBegin(recordFlags)) {
            objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('MsgBeginItem') + "  "));
        }

        if (isMessageEnd(recordFlags)) {
            objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('MsgEndItem') + "  "));
        }

        if (isChunkedFormat(recordFlags)) {
            objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('ChunkedFormatItem') + "  "));
        } else {
            objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('NonChunkedFormatItem') + "  "));
        }

        if (isShortRecord(recordFlags)) {
            objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('ShortRecordItem') + "  "));
        } else {
            objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('LongRecordItem') + "  "));
        }

        if (hasIdLength(recordFlags)) {
            objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('HasIdLengthItem')));
            objDiv.appendChild(document.createElement("br"));
        } else {
            objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('NoIdLengthItem')));
            objDiv.appendChild(document.createElement("br"));
        }
        objDiv.appendChild(document.createElement("br"));
    }

    function appendMessageText(messageHeader, messageText, className) {
        if (className == "FlexDivIndented") var textIndentClass = "FlexDivDoubleIndented";
        else textIndentClass = "FlexDivIndented";

        var objDiv = document.createElement("div");
        objDiv.className = className + " addLeadingBelow";

        objDiv.appendChild(document.createTextNode(messageHeader));
        objDiv.appendChild(document.createElement("br"));

        messageDiv.appendChild(objDiv);

        objDiv = document.createElement("div");
        objDiv.className = textIndentClass + " forceWordWrap";

        objDiv.appendChild(document.createTextNode(messageText));
        objDiv.appendChild(document.createElement("br"));
        objDiv.appendChild(document.createElement("br"));

        messageDiv.appendChild(objDiv);
    }

    function appendMessageTextLines(messageHeader, textString, className) {
        var messageText = textString.replace("\r\n ", ""); // unfold text lines
        var messageArray = messageText.split("\r\n");
        if (className == "FlexDivIndented") var textIndentClass = "FlexDivDoubleIndented";
        else textIndentClass = "FlexDivIndented";

        var objDiv = document.createElement("div");
        objDiv.className = className + " addLeadingBelow";

        objDiv.appendChild(document.createTextNode(messageHeader));
        objDiv.appendChild(document.createElement("br"));

        messageDiv.appendChild(objDiv);

        for (var i = 0; i < messageArray.length; i++) {
            objDiv = document.createElement("div");
            objDiv.className = textIndentClass + " forceWordWrap";

            objDiv.appendChild(document.createTextNode(messageArray[i]));
            objDiv.appendChild(document.createElement("br"));

            messageDiv.appendChild(objDiv);
        }
    }

    function appendMessageBytes(messageHeader, messageBytes, className) {
        if (className == "FlexDivIndented") var bytesIndentClass = "FlexDivDoubleIndented";
        else bytesIndentClass = "FlexDivIndented";

        objDiv = document.createElement("div");
        objDiv.className = className + " addLeadingBelow";

        objDiv.appendChild(document.createTextNode(messageHeader));
        objDiv.appendChild(document.createElement("br"));

        messageDiv.appendChild(objDiv);

        while (messageBytes.length > 48) {
            var objDiv = document.createElement("div");
            objDiv.className = bytesIndentClass + " fixedWidth";
            objDiv.appendChild(document.createTextNode(messageBytes.substr(0, 47)));
            messageBytes = messageBytes.substr(48);
            messageDiv.appendChild(objDiv);
        }
        objDiv = document.createElement("div");
        objDiv.className = bytesIndentClass + " fixedWidth";
        objDiv.appendChild(document.createTextNode(messageBytes));
        objDiv.appendChild(document.createElement("br"));
        objDiv.appendChild(document.createElement("br"));
        messageDiv.appendChild(objDiv);
    }

    function ndefTagReceived(device, message) {
        var dataReader = Windows.Storage.Streams.DataReader.fromBuffer(message.data);
        var messageBytes = "";
        var messageText = "";
        var messageArray = new Array;

        var objDiv = document.createElement("div");
        objDiv.className = "FlexDiv";
        messageReceived(device, message, objDiv);
        objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('MsgLengthHdr') + " " + message.data.length + " " + resourceGlobalization.getString('bytes')));
        objDiv.appendChild(document.createElement("br"));
        objDiv.appendChild(document.createElement("br"));
        messageDiv.appendChild(objDiv);

        for (var i = 0; i < message.data.length; i++) {
            messageArray[i] = dataReader.readByte();
        }

        var ndefRecordCount = 0;
        while (messageArray.length > 2) {
            ndefRecordCount++;

            var messageOffset = 0;
            var recordFlags = messageArray[messageOffset++];
            var typeLength = 0;
            var typeString = "";
            var textStatus = null;
            var idType = null;
            var idLength = 0;
            var payloadLength = 0;
            var payloadArray = new Array;
            var validRecord = false;

            typeLength = messageArray[messageOffset++];
            payloadLength = 0;
            if (isShortRecord(recordFlags)) {
                payloadLength += messageArray[messageOffset++];
            } else {
                for (i=0; i < 4; i++) {
                    payloadLength *= 256;
                    payloadLength += messageArray[messageOffset++];
                }
            }
            if (hasIdLength(recordFlags)) idLength = messageArray[messageOffset++];

            for (i = 0; i < typeLength; i++) {
                typeString += String.fromCharCode(messageArray[i + messageOffset]);
            }
            messageOffset += typeLength;

            for (i = 0; i < payloadLength; i++) {
                payloadArray[i] = messageArray[i + messageOffset];
            }
            messageOffset += payloadLength;

            messageBytes = "";
            messageText = "";
            for (j = 0; j < messageArray.length; j++) {
                var rawByte = messageArray[j];
                messageBytes += hexVal(rawByte) + " ";
                if ((rawByte < 32) || (rawByte > 127)) messageText += '.';
                else messageText += String.fromCharCode(rawByte);
            }

            remainderHex = "";
            remainderString = "";
            messageArray = messageArray.slice(messageOffset, messageArray.length);
            for (i = 0; i < messageArray.length; i++) {
                remainderHex += hexVal(messageArray[i]) + " ";
                if ((messageArray[i] < 32) || (messageArray[i] > 127)) remainderString += '.';
                else remainderString += String.fromCharCode(messageArray[i]);
            }

            objDiv = document.createElement("div");
            objDiv.className = "FlexDiv newColumn";
            objDiv.appendChild(document.createTextNode("NDEF Record " + ndefRecordCount));
            objDiv.appendChild(document.createElement("br"));
            objDiv.appendChild(document.createElement("br"));
            messageDiv.appendChild(objDiv);

            objDiv = document.createElement("div");
            objDiv.className = "FlexDivIndented";
            objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('TypeLengthHdr') + " " + typeLength + " " + resourceGlobalization.getString('bytes')));
            var spanObj = document.createElement("span");
            spanObj.style.marginRight = "20px";
            objDiv.appendChild(spanObj);
            objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('PayloadLengthHdr') + " " + payloadLength + " " + resourceGlobalization.getString('bytes')));
            if (idLength > 0) {
                spanObj = document.createElement("span");
                spanObj.style.marginRight = "20px";
                objDiv.appendChild(spanObj);
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('IdLengthHdr') + " " + idLength + " " + resourceGlobalization.getString('bytes')));
            } else {
                spanObj = document.createElement("span");
                spanObj.style.marginRight = "20px";
                objDiv.appendChild(spanObj);
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('NoId')));
            }
            objDiv.appendChild(document.createElement("br"));
            objDiv.appendChild(document.createElement("br"));
            messageDiv.appendChild(objDiv);

            if (typeNameFormat(recordFlags) == 0x01) { // NFC Forum Well Known Type
                var wellKnownTypeString = resourceGlobalization.getString('Unknown') + typeString;

                if (typeString == "T") { // Text
                    wellKnownTypeString = resourceGlobalization.getString('Text');

                    textStatus = payloadArray[0];
                    payloadArray = payloadArray.slice(1);
                    --payloadLength;

                    var textEncoding = (textStatus & 0x01) ? "UTF16" : "UTF8";
                    var ianaLength = textStatus & 0x3F;

                    var languageCode = "";
                    for (i = 0; i < ianaLength; i++) {
                        languageCode += String.fromCharCode(payloadArray[0]);
                        payloadArray = payloadArray.slice(1);
                        --payloadLength;
                    }
                } else if (typeString == "Sp") { // Smart Poster
                    wellKnownTypeString = resourceGlobalization.getString('SmartPoster');
                } else if (typeString == "U") { // URI
                    wellKnownTypeString = resourceGlobalization.getString('URI');

                    idType = payloadArray[0];
                    payloadArray = payloadArray.slice(1);
                    --payloadLength;

                    var uriPrefixString = "";

                    switch (idType) {
                        case 0x00:
                            uriPrefixString = "";
                            break;

                        case 0x01:
                            uriPrefixString = "http://www.";
                            break;

                        case 0x02:
                            uriPrefixString = "https://www.";
                            break;

                        case 0x03:
                            uriPrefixString = "http://";
                            break;

                        case 0x04:
                            uriPrefixString = "https://";
                            break;

                        case 0x05:
                            uriPrefixString = "tel:";
                            break;

                        case 0x06:
                            uriPrefixString = "mailto:";
                            break;

                        case 0x07:
                            uriPrefixString = "ftp://anonymous:anonymous@";
                            break;

                        case 0x08:
                            uriPrefixString = "ftp://ftp.";
                            break;

                        case 0x09:
                            uriPrefixString = "ftps://";
                            break;

                        case 0x0a:
                            uriPrefixString = "sftp://";
                            break;

                        case 0x0b:
                            uriPrefixString = "smb://";
                            break;

                        case 0x0c:
                            uriPrefixString = "nfs://";
                            break;

                        case 0x0d:
                            uriPrefixString = "ftp://";
                            break;

                        case 0x0e:
                            uriPrefixString = "dav://";
                            break;

                        case 0x0f:
                            uriPrefixString = "news:";
                            break;
                        case 0x10:
                            uriPrefixString = "telnet://";
                            break;

                        case 0x11:
                            uriPrefixString = "imap:";
                            break;

                        case 0x12:
                            uriPrefixString = "rtsp://";
                            break;

                        case 0x13:
                            uriPrefixString = "urn:";
                            break;

                        case 0x14:
                            uriPrefixString = " pop:";
                            break;

                        case 0x15:
                            uriPrefixString = "sip:";
                            break;

                        case 0x16:
                            uriPrefixString = "sips:";
                            break;

                        case 0x17:
                            uriPrefixString = "tftp:";
                            break;

                        case 0x18:
                            uriPrefixString = "btspp://";
                            break;

                        case 0x19:
                            uriPrefixString = "btl2cap://";
                            break;

                        case 0x1a:
                            uriPrefixString = "btgoep://";
                            break;

                        case 0x1b:
                            uriPrefixString = "tcpobex://";
                            break;

                        case 0x1c:
                            uriPrefixString = "irdaobex://";
                            break;

                        case 0x1d:
                            uriPrefixString = "file://";
                            break;

                        case 0x1e:
                            uriPrefixString = "urn:epc:id:";
                            break;

                        case 0x1f:
                            uriPrefixString = "urn:epc:tag";
                            break;

                        case 0x20:
                            uriPrefixString = "urn:epc:pat:";
                            break;

                        case 0x21:
                            uriPrefixString = "urn:epc:raw:";
                            break;

                        case 0x22:
                            uriPrefixString = "urn:epc:";
                            break;

                        case 0x23:
                            uriPrefixString = "urn:nfc:";
                            break;

                        default:
                            uriPrefixString = "RFU";
                            break;
                    }
                } else if (typeString == "Gc") { // Generic Control
                    wellKnownTypeString = resourceGlobalization.getString('GenericCtrl');
                } else if (typeString == "Hr") { // Handover Request
                    wellKnownTypeString = resourceGlobalization.getString('HandoverReq');
                } else if (typeString == "Hs") { // Handover Select
                    wellKnownTypeString = resourceGlobalization.getString('HandoverSel');
                } else if (typeString == "Hc") { // Handover Carrier
                    wellKnownTypeString = resourceGlobalization.getString('HandoverCar');
                } else if (typeString == "Sg") { // Signature
                    wellKnownTypeString = resourceGlobalization.getString('Sig');
                }

                objDiv = document.createElement("div");
                objDiv.className = "FlexDivIndented";
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('TNF') + " = " + typeNameFormat(recordFlags).toString(16)));
                spanObj = document.createElement("span");
                spanObj.style.marginRight = "20px";
                objDiv.appendChild(spanObj);
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('WellKnownTypeHdr') + " " + wellKnownTypeString));

                if (typeString == "T") {
                    spanObj = document.createElement("span");
                    spanObj.style.marginRight = "20px";
                    objDiv.appendChild(spanObj);
                    objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('EncodingHdr') + " " + textEncoding));
                    spanObj = document.createElement("span");
                    spanObj.style.marginRight = "20px";
                    objDiv.appendChild(spanObj);
                    objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('LanguageHdr') + " " + languageCode));
                } else if (typeString == "U") {
                    spanObj = document.createElement("span");
                    spanObj.style.marginRight = "20px";
                    objDiv.appendChild(spanObj);
                    objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('IdTypeHdr') + " " + idType));
                }

                objDiv.appendChild(document.createElement("br"));

                appendNfcMessageFlags(objDiv, recordFlags);

                messageDiv.appendChild(objDiv);

                appendMessageText(resourceGlobalization.getString('MsgTextHdr'), messageText, "FlexDivIndented");
                appendMessageBytes(resourceGlobalization.getString('MsgBytesHdr'), messageBytes, "FlexDivIndented");

                var payloadString = "";
                if (textEncoding == "UTF16") {
                    for (i = 0; i < payloadLength; i += 2) {
                        payloadString += String.fromCharCode(payloadArray[i] + (256 * payloadArray[i + 1]));
                    }
                } else {
                    for (i = 0; i < payloadLength; i++) payloadString += String.fromCharCode(payloadArray[i]);
                }
                if (typeString == "T") {
                    objDiv = document.createElement("div");
                    objDiv.className = "FlexDivIndented";
                    objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('TextHdr') + " " + payloadString));
                    objDiv.appendChild(document.createElement("br"));
                    objDiv.appendChild(document.createElement("br"));
                    messageDiv.appendChild(objDiv);
                } else if (typeString == "U") {
                    objDiv = document.createElement("div");
                    objDiv.className = "FlexDivIndented";
                    objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('URIHdr') + " " + uriPrefixString + payloadString));
                    objDiv.appendChild(document.createElement("br"));
                    objDiv.appendChild(document.createElement("br"));
                    messageDiv.appendChild(objDiv);
                } else {
                    objDiv = document.createElement("div");
                    objDiv.className = "FlexDivIndented";
                    objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('PayloadHdr') + " " + payloadString));
                    objDiv.appendChild(document.createElement("br"));
                    objDiv.appendChild(document.createElement("br"));
                    messageDiv.appendChild(objDiv);
                }
            } else if (typeNameFormat(recordFlags) == 0x02) { // Media Type 
                objDiv = document.createElement("div");
                objDiv.className = "FlexDivIndented";
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('TNF') + " = " + typeNameFormat(recordFlags).toString(16)));
                var spanObj = document.createElement("span");
                spanObj.style.marginRight = "20px";
                objDiv.appendChild(spanObj);
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('MediaTypeHdr') + " " + typeString));
                objDiv.appendChild(document.createElement("br"));
                objDiv.appendChild(document.createElement("br"));
                messageDiv.appendChild(objDiv);

                appendMessageText(resourceGlobalization.getString('MsgTextHdr'), messageText, "FlexDivIndented");
                appendMessageBytes(resourceGlobalization.getString('MsgBytesHdr'), messageBytes, "FlexDivIndented");

                if (typeString.toLowerCase() == "text/plain") {
                    payloadString = "";
                    for (i = 0; i < payloadLength; i += 2) {
                        payloadString += String.fromCharCode(payloadArray[i] + (256 * payloadArray[i + 1]));
                    }
                    objDiv = document.createElement("div");
                    objDiv.className = "FlexDivIndented";
                    objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('TextHdr') + " " + payloadString));
                    objDiv.appendChild(document.createElement("br"));
                    messageDiv.appendChild(objDiv);
                }
                else if ((typeString.toLowerCase() == "text/vcard") || (typeString.toLowerCase() == "text/x-vcard")) {
                    var payloadString = "";
                    for (i = 0; i < payloadLength; i++) payloadString += String.fromCharCode(payloadArray[i]);
                    var payloadBytes = "";
                    for (j = 0; j < payloadArray.length; j++) {
                        var rawByte = payloadArray[j];
                        payloadBytes += hexVal(rawByte) + " ";
                    }

                    appendMessageTextLines(resourceGlobalization.getString('vCardDataHdr'), payloadString, "FlexDivIndented");
                    appendMessageBytes(resourceGlobalization.getString('VcardBytesHdr'), payloadBytes, "FlexDivIndented");

                    vCard.showVcard(typeString, payloadArray, messageDiv);
                }
            } else if (typeNameFormat(recordFlags) == 0x03) { // Absolute URI Type
                var param1 = payloadArray[0];
                var param2 = payloadArray[1];
                var param3 = payloadArray[2];
                payloadArray = payloadArray.slice(3);

                payloadLength -= 3;
                var argsString = "";
                for (i = 0; i < payloadLength; i++) {
                    argsString += String.fromCharCode(payloadArray[i]);
                }

                objDiv = document.createElement("div");
                objDiv.className = "FlexDivIndented";
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('TNF') + " = " + typeNameFormat(recordFlags).toString(16)));
                spanObj = document.createElement("span");
                spanObj.style.marginRight = "20px";
                objDiv.appendChild(spanObj);
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('AbsUriType')));
                objDiv.appendChild(document.createElement("br"));
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('Param1') + hexVal(param1)));
                spanObj = document.createElement("span");
                spanObj.style.marginRight = "20px";
                objDiv.appendChild(spanObj);
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('Param2') + hexVal(param2)));
                spanObj = document.createElement("span");
                spanObj.style.marginRight = "20px";
                objDiv.appendChild(spanObj);
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('Param3') + hexVal(param3)));
                objDiv.appendChild(document.createElement("br"));
                objDiv.appendChild(document.createElement("br"));
                messageDiv.appendChild(objDiv);

                objDiv = document.createElement("div");
                objDiv.className = "FlexDivIndented";
                appendNfcMessageFlags(objDiv, recordFlags);
                messageDiv.appendChild(objDiv);

                appendMessageText(resourceGlobalization.getString('MsgTextHdr'), messageText, "FlexDivIndented");
                appendMessageBytes(resourceGlobalization.getString('MsgBytesHdr'), messageBytes, "FlexDivIndented");

                objDiv = document.createElement("div");
                objDiv.className = "FlexDivIndented";
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('URIHdr') + " " + typeString));
                objDiv.appendChild(document.createElement("br"));
                messageDiv.appendChild(objDiv);

                objDiv = document.createElement("div");
                objDiv.className = "FlexDivIndented";
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('ArgsHdr') + " " + argsString));
                objDiv.appendChild(document.createElement("br"));
                objDiv.appendChild(document.createElement("br"));
                messageDiv.appendChild(objDiv);
            } else if (typeNameFormat(recordFlags) == 0x04) { // NFC Forum External Type
                objDiv = document.createElement("div");
                objDiv.className = "FlexDivIndented";
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('TNF') + " = " + typeNameFormat(recordFlags).toString(16)));
                spanObj = document.createElement("span");
                spanObj.style.marginRight = "20px";
                objDiv.appendChild(spanObj);
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('ExternalType')));
                objDiv.appendChild(document.createElement("br"));
                objDiv.appendChild(document.createElement("br"));
                messageDiv.appendChild(objDiv);

                objDiv = document.createElement("div");
                objDiv.className = "FlexDivIndented";
                appendNfcMessageFlags(objDiv, recordFlags);
                messageDiv.appendChild(objDiv);

                appendMessageText(resourceGlobalization.getString('MsgTextHdr'), messageText, "FlexDivIndented");
                appendMessageBytes(resourceGlobalization.getString('MsgBytesHdr'), messageBytes, "FlexDivIndented");

                objDiv = document.createElement("div");
                objDiv.className = "FlexDiv";
                objDiv.appendChild(document.createElement("br"));
                messageDiv.appendChild(objDiv);
            } else { // Currently unsupported Type
                objDiv = document.createElement("div");
                objDiv.className = "FlexDivIndented";
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('UnsupportedType') + " " + hexVal(typeNameFormat(recordFlags))));
                objDiv.appendChild(document.createElement("br"));
                objDiv.appendChild(document.createElement("br"));
                messageDiv.appendChild(objDiv);

                objDiv = document.createElement("div");
                objDiv.className = "FlexDivIndented";
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('TNF') + " = " + typeNameFormat(recordFlags).toString(16)));
                spanObj = document.createElement("span");
                spanObj.style.marginRight = "20px";
                objDiv.appendChild(spanObj);
                objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('UnknownType')));
                objDiv.appendChild(document.createElement("br"));
                objDiv.appendChild(document.createElement("br"));
                messageDiv.appendChild(objDiv);

                objDiv = document.createElement("div");
                objDiv.className = "FlexDivIndented";
                appendNfcMessageFlags(objDiv, recordFlags);
                messageDiv.appendChild(objDiv);

                appendMessageText(resourceGlobalization.getString('MsgTextHdr'), messageText, "FlexDivIndented");
                appendMessageBytes(resourceGlobalization.getString('MsgBytesHdr'), messageBytes, "FlexDivIndented");

                objDiv = document.createElement("div");
                objDiv.className = "FlexDiv";
                objDiv.appendChild(document.createElement("br"));
                messageDiv.appendChild(objDiv);
            }
        }
    }

    function ndefUnknownTagReceived(device, message) {
        var objDiv = document.createElement("div");
        objDiv.className = "FlexDiv";
        messageReceived(device, message, objDiv);
        objDiv.appendChild(document.createElement("br"));
        objDiv.appendChild(document.createElement("br"));
        messageDiv.appendChild(objDiv);
    }

    function mimeTagReceived(device, message) {
        var dataReader = Windows.Storage.Streams.DataReader.fromBuffer(message.data);
        var messageBytes = "";
        var messageText = "";
        for (var i = 0; i < message.data.length; i++) {
            var rawByte = dataReader.readByte();
            messageBytes += hexVal(rawByte) + " ";
            if ((rawByte < 32) || (rawByte > 127)) messageText += '.';
            else messageText += String.fromCharCode(rawByte);
        }

        var objDiv = document.createElement("div");
        objDiv.className = "FlexDiv";
        messageReceived(device, message, objDiv);
        objDiv.appendChild(document.createElement("br"));
        objDiv.appendChild(document.createElement("br"));
        messageDiv.appendChild(objDiv);

        appendMessageText(resourceGlobalization.getString('MsgTextHdr'), messageText, "FlexDiv");
        appendMessageBytes(resourceGlobalization.getString('MsgBytesHdr'), messageBytes, "FlexDiv");

        objDiv = document.createElement("div");
        objDiv.className = "FlexDiv";
        objDiv.appendChild(document.createElement("br"));
        messageDiv.appendChild(objDiv);
    }

    function bluetoothPairingTagReceived(device, message) {
        var objDiv = document.createElement("div");
        objDiv.className = "FlexDiv";
        messageReceived(device, message, objDiv);
        objDiv.appendChild(document.createElement("br"));
        objDiv.appendChild(document.createElement("br"));
        messageDiv.appendChild(objDiv);
    }

    function subscribeToMessage(message, handler) {
        var objDiv = document.createElement("div");
        objDiv.className = "FlexDiv";

        try {
            var subscribedMessageId = proximityDevice.subscribeForMessage(message, handler);
            objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('MsgType') + " \"" + message + "\" " + resourceGlobalization.getString('subscribed')));
            objDiv.appendChild(document.createElement("br"));
        } catch (e) {
            objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('MsgType') + " \"" + message + "\" " + resourceGlobalization.getString('rejected')));
            objDiv.appendChild(document.createElement("br"));
        };

        messageDiv.appendChild(objDiv);
    }

    function initEventListeners() {
        if (proximityDevice) {
            proximityDevice.addEventListener("devicearrived", proximityDeviceArrived);
            proximityDevice.addEventListener("devicedeparted", proximityDeviceDeparted);

            subscribeToMessage("Windows", windowsTagReceived);
            subscribeToMessage("WindowsUri", windowsUriTagReceived);
            subscribeToMessage("WindowsMime", mimeTagReceived);
            subscribeToMessage("Windows:WriteTag", windowsTagReceived);
            subscribeToMessage("WindowsUri:WriteTag", windowsUriTagReceived);
            subscribeToMessage("WindowsMime:WriteTag", mimeTagReceived);
            subscribeToMessage("LaunchApp:WriteTag", launchAppTagReceived);
            subscribeToMessage("WriteableTag", writeableTagReceived);
            subscribeToMessage("Pairing:Bluetooth", bluetoothPairingTagReceived);
            subscribeToMessage("NDEF", ndefTagReceived);
            subscribeToMessage("NDEF:ext", ndefUnknownTagReceived);
            subscribeToMessage("NDEF:MIME", ndefUnknownTagReceived);
            subscribeToMessage("NDEF:URI", ndefUnknownTagReceived);
            subscribeToMessage("NDEF:wkt", ndefUnknownTagReceived);
            subscribeToMessage("NDEF:WriteTag", ndefUnknownTagReceived);
            subscribeToMessage("NDEF:Unknown", ndefUnknownTagReceived);
        }
    }

    function showInitSuccessMessage() {
        clearMessageDiv();

        var objDiv = document.createElement("div");
        objDiv.className = "FlexDiv";
        objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('ProxDevInit')));
        objDiv.appendChild(document.createElement("br"));
        messageDiv.appendChild(objDiv);

        objDiv = document.createElement("div");
        objDiv.className = "FlexDiv";
        objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('ScanningForTag')));
        objDiv.appendChild(document.createElement("br"));
        objDiv.appendChild(document.createElement("br"));
        messageDiv.appendChild(objDiv);
    }

    function showInitFailMessage() {
        clearMessageDiv();

        var objDiv = document.createElement("div");
        objDiv.className = "FlexDiv";
        objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('AttachNfcReader')));
        objDiv.appendChild(document.createElement("br"));
        messageDiv.appendChild(objDiv);

        objDiv = document.createElement("div");
        objDiv.className = "FlexDiv";
        objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('ClickInitButton')));
        objDiv.appendChild(document.createElement("br"));
        objDiv.appendChild(document.createElement("br"));
        messageDiv.appendChild(objDiv);
    }

    function hideInitButton() {
        document.getElementById("initbutton").style.display = "none";
    }

    function revealInitButton() {
        document.getElementById("initbutton").style.display = "inline";
    }

    function initButtonClicked(e) {
        var objDiv = document.createElement("div");
        objDiv.className = "FlexDiv";

        if (initializeProximityDevice()) {
            showInitSuccessMessage();
            initEventListeners();
            hideInitButton();
        } else {
            var messageDialog = new Windows.UI.Popups.MessageDialog(resourceGlobalization.getString('AttachNfcReader'));
            messageDialog.title = "Failed to initialize proximity device.";
            messageDialog.showAsync();

            showInitFailMessage();
            document.getElementById("initbutton").style.display = "inline";
        }
        messageDiv.appendChild(objDiv);
    }

    function init() {
        if (messageDiv == null) messageDiv = document.getElementById("messageDiv");

        var objDiv = document.createElement("div");
        objDiv.className = "FlexDiv";

        if (initializeProximityDevice()) {
            showInitSuccessMessage();
            initEventListeners();
            hideInitButton();
        } else {
            showInitFailMessage();
            revealInitButton();
            document.getElementById("initbutton").addEventListener("click", initButtonClicked);
        }
        messageDiv.appendChild(objDiv);
    }

    function resumingHandler() {
        // TODO: Refresh network data
        clearMessageDiv();

        var objDiv = document.createElement("div");
        objDiv.className = "FlexDiv";
        objDiv.appendChild(document.createTextNode(resourceGlobalization.getString('ResumingMsg')));
        objDiv.appendChild(document.createElement("br"));
        messageDiv.appendChild(objDiv);

        proximityDevice = null;
        document.getElementById("initbutton").removeEventListener("click", initButtonClicked);

        init();
    }

    WinJS.Namespace.define("Proximity", {
    	init: init
    });
})();
