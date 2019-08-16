/* This file is part of the ** indesign_scripts distribution ** (https://github.com/benpla/indesign_scripts.git).
Copyright © 2017 - 2019 by Benny Platte
Licensed under the EUPL 1.2 (European Union Public Licence 1.2)
Licence text is available in different languages under https://joinup.ec.europa.eu/collection/eupl/eupl-text-11-12

The Licensor Benny Platte hereby grants a worldwide, royalty-free, non-exclusive, sublicensable licence to
  — use the Work in any circumstance and for all usage, reproduce the Work,
  — modify the Work, and make Derivative Works based upon the Work,
  — communicate to the public, including the right to make available or display the Work to the public
  — distribute the Work or copies thereof,
Obligations of the Licensee:
  - The Licensee shall keep intact all copyright, patent or trademarks notices
  - The Licensee must include a copy of such notices and a copy of the Licence with every copy of the Work
Disclaimer of Warranty/Liability:
  - The Licensor will in no event be liable for any direct or indirect, material or moral, damages of any kind, arising out of the Licence or of the use of the Work, including without limitation, damages for loss of goodwill, work stoppage, computer failure or malfunction, loss of data or any commercial damage
  - the Work is provided under the Licence on an ‘as is’ basis and without warranties of any kind concerning the Work, including without limitation merchantability, fitness for a particular purpose, absence of defects or errors, accuracy, non-infringement of intellectual property rights


// BESCHREIBUNG:
Erzeugt Bildunterschriften für alle markierten Objekte mit verknüpften Grafiken.
Dafür werden alle Metadaten aus der verknüpften Bilddatei gelesen und zu einer informativen Bildunterschrift zusammengestellt. 
Anschließend wird ein Textrahmen, welcher unter dem Bild platziert wird. 
Alle Textrahmen mit Bildunterschriften werden in einem eigenen Layer für Bildunterschriften erzeugt. 
Der Textrahmen erhält als Inhalt den Text mit den Metadaten. 
Dabei wird geprüft, ob die Bildunterschrift aufgrund zu geringer Breite des Bildes umbrochen wird. 
Der Test der Bildunterschrift wird in einer Schleife so lange intelligent gekürzt, bis er in eine einzige Zeile passt.
Die Art des Umbruchs kann in der Funktion 'GetXmpMetadataTextFromImage' angepasst werden. 

DESCRIPTION: 
Creates captions for all selected objects with linked graphics.
All metadata is read from the linked image file and combined into an informative caption. 
A text frame is then placed under the image. All text frames with picture captions are created in a separate layer for picture captions. 
The text frame contains the text with the metadata. The system checks whether the caption is wrapped because the width of the image is too small. The caption test is intelligently shortened in a loop until it fits into a single line.
The type of wrapping can be adjusted in the function 'GetXmpMetadataTextFromImage'. 
*/

#target Indesign

var bildunterschriftTrennzeichen = "  "  //Geviert " — "
//var bildunterschriftTrennzeichen = " — "   // Geviert-Strich



function appendLeadingZeroes(n){
  if(n <= 9){
    return "0" + n;
  }
  return n
}

function parseIsoDatetime(dtstr) {
    var dt = dtstr.split(/[: T-]/).map(parseFloat);
    return new Date(dt[0], dt[1] - 1, dt[2], dt[3] || 0, dt[4] || 0, dt[5] || 0, 0);
}

function parseExifDatestring(s) {
    //var d = parseIsoDatetime(s);
     s = s.replace ("T", " ");
  //$.writeln (s);    // 2019-07-14T15:35:43.953
  var b = s.split(/\D/);
  var year = parseInt (b[0], 10)
  var month = b[1]-1
  var day =  parseInt (b[2], 10)
  var hour =  parseInt (b[3], 10)
  var minutes =  parseInt (b[4], 10)
  var sec =  parseFloat (b[5])

  var retval = new Date(year, month, day, hour, minutes,sec);

  return retval;
}


function GetDate_ddmmhhmm(datum) {
    formatted_date = appendLeadingZeroes(datum.getDate()) + "."
                                + appendLeadingZeroes(datum.getMonth() + 1) + "."
                                //+ datum.getFullYear() 
                                + " "
                                + appendLeadingZeroes(datum.getHours()) + ":" 
                                + appendLeadingZeroes(datum.getMinutes()) 
                                //+ ":" + appendLeadingZeroes(datum.getSeconds());
    return formatted_date;
}

function GetDate_ddmmyyhhmm(datum) {
    formatted_date = appendLeadingZeroes(datum.getDate()) + "."
                                + appendLeadingZeroes(datum.getMonth() + 1) + "."
                                + (datum.getFullYear() - 2000)
                                + " "
                                + appendLeadingZeroes(datum.getHours()) + ":" 
                                + appendLeadingZeroes(datum.getMinutes()) 
                                //+ ":" + appendLeadingZeroes(datum.getSeconds());
    return formatted_date;
}



function GetXmpValue(xmp, namespace, exifFieldname, valueForNotExist) {
    try {
        var value= xmp.getProperty(namespace,  exifFieldname).value;
        return value;
    }
    catch (e) {
        $.writeln ("     '" + exifFieldname + "' " + e)
        return valueForNotExist
    }
}


/* Get file name */
File.prototype.getFileName = function() {
    var str = this.fsName;
    return str.substring(str.lastIndexOf("\\") + 1, str.lastIndexOf("."));
};
/* Get file extension */
File.prototype.getFileExtension = function() {
    var str = this.fsName;
    return str.substring(str.lastIndexOf(".") + 1);
};

function GetXmpMetadataTextFromImage(filepath) {
    var fileRef = new File(filepath);
    if (fileRef instanceof File) {
        if (ExternalObject.AdobeXMPScript == undefined){
            ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
        }
        var xmpf = new XMPFile (fileRef.fsName, XMPConst.NS_PHOTOSHOP, XMPConst.OPEN_FOR_READ);
        var xmp = xmpf.getXMP();
        xmpf.closeFile()
        
        var exposureTime= xmp.getProperty(XMPConst.NS_EXIF,  "ExposureTime").value;  //
        var exposureBias= xmp.getProperty(XMPConst.NS_EXIF,  "ExposureBiasValue").value;  //

        // ISO
        var isoValue = null;
        if (xmp.doesPropertyExist (XMPConst.NS_EXIF,  "ISOSpeedRatings")) {
            // Property exisitiert. Das EXIF-Feld "ISOSpeedRatings" ist ein Array,warum auch immer.
            // lese also alle Elemente aus und nimm einfach das letzte. Steht ja eh immer nur eines drin
            var isoValue = null;
            var isoValueCnt = xmp.countArrayItems ( XMPConst.NS_EXIF, "ISOSpeedRatings" );
            for ( i = 1; i <= isoValueCnt; ++i ) {
                isoValueXmp = xmp.getArrayItem ( XMPConst.NS_EXIF, "ISOSpeedRatings", i );  
                isoValue = isoValueXmp.value;
            }
        }
              
        var pixelX= xmp.getProperty("http://ns.adobe.com/exif/1.0/",  "PixelXDimension");  //
        var aperture= GetXmpValue(xmp, XMPConst.NS_EXIF,  "ApertureValue", null);  //
        if (aperture != null) {
            aperture = eval(aperture.value).toFixed(1);
        }

        var shutterSpeed= GetXmpValue(xmp, XMPConst.NS_EXIF,  "ShutterSpeedValue", null);  //
        var focalLength= GetXmpValue(xmp, XMPConst.NS_EXIF,  "focalLength", null);  //
        var focalLengthIn35mmFilm= GetXmpValue(xmp, XMPConst.NS_EXIF,  "FocalLengthIn35mmFilm", null);  //
        var dateTimeDigitized= GetXmpValue(xmp, XMPConst.NS_EXIF,  "DateTimeDigitized", null);  //
        var exposureProgram= GetXmpValue(xmp, XMPConst.NS_EXIF,  "ExposureProgram", null);  //
        var exposureMode= GetXmpValue(xmp, XMPConst.NS_EXIF,  "ExposureMode", null);  //
        var sensingMethod= GetXmpValue(xmp, XMPConst.NS_EXIF,  "SensingMethod", null);  //

        var lens= xmp.getProperty(XMPConst.NS_EXIF_AUX, "Lens");
        var serialNumber= GetXmpValue(xmp, XMPConst.NS_EXIF,  "SerialNumber", null);  //
        
        var cameraModel= xmp.getProperty(XMPConst.NS_TIFF,  "Model").value;  //
        var cameraMake= xmp.getProperty(XMPConst.NS_TIFF,  "Make").value;

        var myLat = xmp.getProperty(XMPConst.NS_EXIF, "exif:GPSLatitude");
        var myLong = xmp.getProperty(XMPConst.NS_EXIF, "exif:GPSLongitude");
        
        // Belichtungs-Infomation
        if (exposureTime != null && aperture != null) {
            var belichtungsInfo = exposureTime + "s f" + aperture;
        } 
        else if (exposureTime != null ) {
            var belichtungsInfo = exposureTime + "s";
        }
        else {
            var belichtungsInfo = "";
        }
    
        if (isoValue != null) belichtungsInfo += " Iso " + isoValue
        
        
        // Brennweite
        if (focalLengthIn35mmFilm != null && focalLength != null ) {
            brennweitenInfo = " @" + focalLength.toFixed(0) + " (" + focalLengthIn35mmFilm + ")mm"
        }
        else if (focalLength != null) {
            brennweitenInfo = " @" + focalLength.toFixed(0) + "mm"
        }
        else {
            brennweitenInfo = ""
        }       
    
        // Objektiv
        if (lens == "LEICA DG 12-60/F2.8-4.0") {
            lens = "L12-60"
        }
 
        var cameraInfo = bildunterschriftTrennzeichen
        switch (cameraModel) {
            case "DC-G9": 
                cameraInfo += "Pana G9+" + lens;
                break;
            
            case "Canon IXUS 125 HS":
                cameraInfo += "Canon IXUS rot";
                break;
                
            case "S41":
                cameraInfo += "Handy S41";
                break;
                
            default:
                cameraInfo +=  cameraModel
                break;            
        }
    
        var datestring = ""
        if (dateTimeDigitized != null) {
            dateobj = parseExifDatestring(dateTimeDigitized);
            datestring = GetDate_ddmmyyhhmm(dateobj);
            datestring += bildunterschriftTrennzeichen
        }
    
        var fileName = fileRef.getFileName();
        var fileExt = fileRef.getFileExtension();     
        var fileInfo = bildunterschriftTrennzeichen + fileName;
        
        var captions = [];
        captions.unshift(datestring);
        captions.unshift(datestring + fileInfo);
        captions.unshift(datestring + belichtungsInfo);
        captions.unshift(datestring + belichtungsInfo + fileInfo);
        captions.unshift(datestring + belichtungsInfo + brennweitenInfo + fileInfo);
        captions.unshift(datestring + belichtungsInfo + brennweitenInfo + cameraInfo + fileInfo);
    
        myString = myLat + ", " + myLong;        
    }
    var retval = captions;
    return retval;
}


function GetMetadatenText(linkObj) {
    var xmp = linkObj.linkXmp;
    var date = xmp.creationDate;
    var s = xmp.author; 

    // "http://ns.adobe.com/exif/1.0/"
    //  "http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/"
    var a1= xmp.getProperty("http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/",  "exif:ExposureTime"); 
    var a2= xmp.getProperty("http://ns.adobe.com/exif/1.0/",  "exif:ExposureTime");  //
    var a3= xmp.getProperty("http://ns.adobe.com/xap/1.0/",  "xmp:Rating");  //
    var a4= xmp.getProperty("http://ns.adobe.com/xap/1.0/",  "exif:ExposureTime"); 
    
    var descriptionProperty = xmp.getProperty("http://purl.org/dc/elements/1.1/", "dc:description[1]");  
        var description = descriptionProperty.value; 
        
    return s;
}



function GetTextrahmenBounds(grafikrahmenBounds) {
    var myDistance = -4; // Abstand zum Bild in mm
    var myHeight = 4; // Höhe des Rahmens für die Bildunterschrift in mm 
    
    //var oben = grafikrahmenBounds[2] - myHeight
    var oben = grafikrahmenBounds[2]   // Oberkante ist Unterkante des Bildes
    var unten = grafikrahmenBounds[2] + myHeight
    return [oben , grafikrahmenBounds[1], unten, grafikrahmenBounds[3]]
}



function CreateTextFrame(page, layer, text, rahmenKoord, objectstyle, name) {
       
    var myFrame = page.textFrames.add(
        layer, 
        undefined, undefined, 
        {geometricBounds:rahmenKoord, contents:text}
    )

    myFrame.applyObjectStyle(objectstyle);
    myFrame.name = name
            //myFrame.textFramePreferences.insetSpacing = [myDistance, 0, 0, 0]
        //myFrame.moveToBeginning(app.activeDocument.layers["Bild-Metadaten"]);
    return myFrame
}



function GetValidFramesWithImagesFromAllSelectedObjects(forbiddenLayer) {
    $.writeln ("selected objects: '" + app.selection.length);    
    $.writeln ("all selected objects: filter valid frames containing images");
    
    var validImageframes = [];
    for (i = 0; i < app.selection.length; i++){
        var selItem = app.selection[i];
        if (selItem.itemLayer === forbiddenLayer) {
            $.writeln ("    sorted out, because in layer " + forbiddenLayer.name );
            continue;
        }       
        //~         // wenn kein Rechteckrahmen, dann raus
//~         if (selItem.constructor.name != "Rectangle") continue;
        if (selItem.contentType != ContentType.GRAPHIC_TYPE) {
            $.writeln ("    sorted out, because contentType != ContentType.GRAPHIC_TYPE");
            continue;
        }
        // wenn keine Bilder im Rahmen sind, raus
        if (selItem.images.length == 0) {
            $.writeln ("   sorted out, because frame contains no images");
            continue;
        }
        // wenn die Bilder im Rahmen nicht verknüpft sind, dann raus
        var linkObj = selItem.images[0].itemLink;
        if (linkObj == null) continue;
        
        // hier ist es ein gültiger Rahmen mit Bild darin, also zur Liste gültiger Objekte hinzufügen
        validImageframes.push(selItem);
    }
    $.writeln ("    ---------------------------------------------- " );
    $.writeln ("    -->invalid objects sorted out: " + (app.selection.length - validImageframes.length) );
    $.writeln ("    -->valid frames with images: " + validImageframes.length);
    return validImageframes;
}



function CreateBildunterschriftFromMetadata(itm, layer, objStyleBildOverlay) {
    var linkObj = itm.images[0].itemLink;

    $.writeln ("selected object on layer'" + itm.itemLayer.name + "'")
    
    // Abmessungen des äußeren Rahmens und Seitenzahl ermitteln
    var myPage = itm.parentPage;
    $.writeln ("     File '" + linkObj.name + "', Page " + myPage.name)
   
    //var testtext = GetMetadatenText(linkObj);
    var page = itm.parent

    // bereits Bildunterschrift zu diesem Element vorhanden? Dann löschen
    $.write ("     old Bildunterschrift: ")
    var bereitsVorhandeneBildunterschrift = page.textFrames.itemByName(linkObj.name)
    if (bereitsVorhandeneBildunterschrift != null) {
        $.writeln ("delete  '" + bereitsVorhandeneBildunterschrift.name + "'")
        bereitsVorhandeneBildunterschrift.remove();
    } else {
        $.writeln ("non-existent");
    }

    // Metadaten aus verknüpftem Bild holen, returnVal enthält Liste mit Überschriften abnehmender Länge
    var captions = GetXmpMetadataTextFromImage(linkObj.filePath);    
    var longestCaption = captions[0]
    
    // neue Bildunterschrift generieren
    var grafikrahmenBounds = itm.geometricBounds;
    var textrahmenBounds = GetTextrahmenBounds(grafikrahmenBounds);
    $.writeln ("    erstelle neue Bildunterschrift für Verknüpfung'" + linkObj.name + "'")
    var textframe = CreateTextFrame(page, layer, longestCaption, textrahmenBounds, objStyleBildOverlay, linkObj.name);
    
     // Der Text ist zu lang für eine Zeile, daher sind es mehr als zwei Zeilen.
        // Also kürzere Überschrift verwenden
    var par = textframe.paragraphs[0];
    var n = 0;
    while (textframe.paragraphs[0].lines.length > 1 && n<captions.length ) {
        n++;
        par.contents = captions[n]; 
        var debugtext = par.contents;
        $.writeln ("    Caption too long, use shorter with index " + n + ": '" + captions[n] + "'")
    } 
}




function main () {
    var myDoc = app.activeDocument;
    $.writeln ("*****************************************************************************************");
    $.writeln ("Start " + myDoc.fullName);
    $.writeln("\n")
 
    // Get ObjectStyle for Picture Overlay
    var formatGroupBild = myDoc.objectStyleGroups.itemByName("Bild"); 
    var objStyleBildOverlay = formatGroupBild.objectStyles.itemByName("Bild Metadaten Overlay");
    $.writeln ("benötigter objectstyle '" + objStyleBildOverlay.name + "' gefunden");
    // Get Layer
    var myLayer = myDoc.layers.itemByName("Bild-Metadaten");
    $.writeln ("required layer '" + myLayer.name + "' found");
   
    
    var validImageframes = GetValidFramesWithImagesFromAllSelectedObjects(forbiddenLayer=myLayer)
    $.writeln
    
    if (validImageframes.length == 0) {
        $.writeln ("no Image Frames selected");
    }
    
    for (var i = 0; i < validImageframes.length; i++){
        var itm = validImageframes[i];
        CreateBildunterschriftFromMetadata (itm, myLayer, objStyleBildOverlay);
        var a=4
    } 

    
    $.writeln ("\n<<<<<<<<<<<<<<< DONE <<<<<<<<<<<<<<<");
}


main();
