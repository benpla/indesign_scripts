// Datei zum Einbinden, enthält Funktionen zur Positionierung

#target Indesign

var currentPage = app.activeWindow.activePage
const baselineOffset = app.activeDocument.gridPreferences.baselineStart
const baselineAbstand = app.activeDocument.gridPreferences.baselineDivision 
const textbereichTop = currentPage.marginPreferences.top
const textbereichBottom = currentPage.marginPreferences.bottom
const textbereichLeft = currentPage.marginPreferences.left

const horizGridAbstand = app.activeDocument.gridPreferences.horizontalGridlineDivision  / app.activeDocument.gridPreferences.horizontalGridSubdivision   
const vertGridAbstand = app.activeDocument.gridPreferences.verticalGridlineDivision   / app.activeDocument.gridPreferences.verticalGridSubdivision    
const horizGridAbstandPt = UnitValue(horizGridAbstand, app.documents[0].viewPreferences.horizontalMeasurementUnits).as('pt');
const vertGridAbstandPt = UnitValue(vertGridAbstand, app.documents[0].viewPreferences.horizontalMeasurementUnits).as('pt');
const currPageHeight =  currentPage.bounds[2] - currentPage.bounds[0]; 	
const currTextareaHeight = currPageHeight - currentPage.marginPreferences.bottom - currentPage.marginPreferences.top
const currTextareaBottomY =  currPageHeight - currentPage.marginPreferences.bottom 
//das Folgende funktioniert auch nur bei meiner Konstellation
const baselineToAboveGridOffset = baselineOffset - 2 * vertGridAbstand;
const gridToAboveBaselineOffset = vertGridAbstand - baselineToAboveGridOffset;
const letSpaceForPicCaptions = true;

const gridlinesTextbereichCnt = (textbereichBottom - textbereichTop) / vertGridAbstand



function PlatziereRahmenVertikal (letSpaceForPicCaptions)
{
    var RahmenAnz = app.selection.length;
    if(RahmenAnz > 0 && app.selection[0].constructor.name == "Rectangle"){
            //mindestens 2 Rahmen
            //berechne theoretisch mögliche Bildhöhe (theoretisch, da Bildhöhe sich nicht an Gridlines orientiert)
            var neededSpace = 0

            if (letSpaceForPicCaptions) neededSpace = (RahmenAnz ) * (baselineAbstand + gridToAboveBaselineOffset);
            else   neededSpace = (RahmenAnz - 1) * gridToAboveBaselineOffset;
                
            // Bildhöhe wird ermittelt. Da der spätere Algorithmus die Bilder bis zur nächsten Baseline verlängert, ziehe ich hier von der 
            // Bildhöhe eine halbe Basislinienabstand ab. Grund: Wenn das Bild nur etwas über die baseline hinausragt, verlängert er es zur nächsten
            // das bedeutet: er rundet immer auf. Also ziehe ich hier vorsorglich eine halbe Grundlinienabstandhöhe ab
            var picHeightTheoretisch = (currTextareaHeight - neededSpace) / RahmenAnz - 0.5 * baselineAbstand;
            var startY = (letSpaceForPicCaptions) ? vertGridAbstand*3 :  vertGridAbstand*2;
            var startX =GetNextHorizontalGridline(app.activeDocument.selection[0].geometricBounds[1]);
            var picWidth = app.activeDocument.selection[0].geometricBounds[3] -  app.activeDocument.selection[0].geometricBounds[1];

            var i = -1;
            //gehe alle Rahmen durch                       
            for (i = 0; i < RahmenAnz; i++) {                   
               log ("***** Rahmen " + i + " ***************");
                var rahmen = app.activeDocument.selection[i];

                // Daten brauche ich vielleicht später
                //var datum = rahmen.images[0].itemLink.linkXmp.creationDate;
                //var pfad = rahmen.graphics[0].itemLink.filePath;
                 
                //var yNextBaseline = GetNextBaseline(vertGridAbstand*2 + picHeightTheoretisch);
                // bei allen weiteren Rahmen ab unterer Kante nach weiteren Positionen suchen
                if (i > 0)  {
                    var letzterRahmen = app.activeDocument.selection[i - 1];
                    if (letSpaceForPicCaptions) {
                         // suche die nächste Gridline, ausgehend von der nächsten Baseline (Platz für Bildüberschrift lassen)
                         // die Y-Pos des letzten Rahmens wird noch ein wenig dazu addiert, sonst findet er als nächste baseline genau die, auf der
                         // sich das Bild befindet. Wir wollen aber die nächste
                        startY = GetNextVerticalGridline( GetNextBaseline(letzterRahmen.geometricBounds[2] + 0.1));
                    } 
                    else {
                        startY = GetNextVerticalGridline(letzterRahmen.geometricBounds[2] + 0.1);
                    }    
                }
            
                moveToNextPossiblePos(rahmen, currTextareaBottomY, startX, startY , picWidth, picHeightTheoretisch, baselineAbstand);
            } 
     }
    else alert("Anzahl selektierter Objekte stimmt nicht");      
}



function GetNextBaseline(ymm)
{
	//log ('GetNextBaseline: Ausgangspunkt ymm = ' + ymm);
	for (i = 0; i < 50; i++) {
		var baselineMM = baselineOffset + baselineAbstand * i;
		if (baselineMM > ymm) {
			//log("    GetNextBaseline = " + i + '   (=' + baselineMM + ' mm');
			return baselineMM;
			break;
		}
		else {
		}
	}
	return -1;
}


function moveToNextPossiblePos(rahmen, maxPossibleY, startX, earliestPossibleY, breite, minHeight, erweitereUmMaxMM)
{
    log ("moveToNextPossiblePos ")
    //suche nächste Grundlinie
    var yNextGridline = GetNextVerticalGridline(earliestPossibleY);
    var yNextBaseline = GetNextBaseline(yNextGridline + minHeight);

    var höhe = yNextBaseline - yNextGridline
    if (yNextBaseline > maxPossibleY) {
        höhe = maxPossibleY - yNextGridline;
        log ("    Bild würde über untere Grenze hinausragen, kürze bis zur unteren Grenze");
    } 

        // wenn unterer Bildrand nach unten nur wenig Luft hat, dann erweitere das Bild bis runter zum unteren Rand
    var abstandZuMaxPossibleY = maxPossibleY - (yNextGridline + höhe)
    if (abstandZuMaxPossibleY <= erweitereUmMaxMM) {
        log("   erweitere Bild um " + abstandZuMaxPossibleY.toFixed(1) + "mm nach unten bis zum Rand");
        höhe = maxPossibleY - yNextGridline;
    }

    log("   berechnet: yNextGridline = " + yNextGridline.toFixed(1) 
                       + ", yNextBaseline = " + yNextBaseline + " mm"
                                    + ", höhe = " + höhe + "mm");
    moveAndResize (rahmen, startX, yNextGridline, breite, höhe);  
    
    log("    earliestPossibleY = " + earliestPossibleY.toFixed(1) 
                  + ", breite = " + breite.toFixed(1)  + " mm"
                  + ", minHeight = " + minHeight.toFixed(1)  + "mm"
                  + ", PicEndY = " + (yNextGridline + höhe).toFixed(1)  + "mm");
                                                                             
 }



function GetNextVerticalGridline(ymm)
{
	//log ('GetNextVerticalGridline: Ausgangspunkt ymm = ' + ymm);
	for (i = 0; i < 50; i++) {
		var gridlineMM = vertGridAbstand * i;
		if (gridlineMM >= ymm) {
			//log("    GetNextVerticalGridline = " + i + '   (=' + gridlineMM + ' mm');
			return gridlineMM;
			break;
		}
		else {
		}
	}
	return -1;
}


function GetNextHorizontalGridline(xPosMM)
{
	//log ('GetNextVerticalGridline: Ausgangspunkt ymm = ' + ymm);
	for (i = -70; i < 70; i++) {
		var gridlineMM = horizGridAbstand * i;
		if (gridlineMM >= xPosMM) {
			//log("    GetNextVerticalGridline = " + i + '   (=' + gridlineMM + ' mm');
			return gridlineMM;
			break;
		}
		else {
		}
	}
	return -1;
}



function moveAndResizeCoords(rahmen, x1, y1, x2, y2)
{
	rahmen.move([x1, y1])
	
    var w = x2 - x1
    var h = y2 - y1
	var wPt = UnitValue(w, app.documents[0].viewPreferences.horizontalMeasurementUnits).as('pt');
	var hPt = UnitValue(h, app.documents[0].viewPreferences.horizontalMeasurementUnits).as('pt');
	
	rahmen.resize(CoordinateSpaces.innerCoordinates,
		AnchorPoint.topLeftAnchor,
		ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,[wPt, hPt]);
		
	log('moveAndResize: x1=' 
		+ (x1).toFixed(1) 
	   + '   y1=' + (y1).toFixed(1)
	   + '   w=' + (w).toFixed(1)
	   + '   h=' + (h).toFixed(1));
}


function moveAndResize(rahmen, x1, y1, w, h)
{
	rahmen.move([x1, y1])
	
	var wPt = UnitValue(w, app.documents[0].viewPreferences.horizontalMeasurementUnits).as('pt');
	var hPt = UnitValue(h, app.documents[0].viewPreferences.horizontalMeasurementUnits).as('pt');
	
	rahmen.resize(CoordinateSpaces.innerCoordinates,
		AnchorPoint.topLeftAnchor,
		ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,[wPt, hPt]);
		
	log('moveAndResize: x1=' 
		+ (x1).toFixed(1) 
	   + '   y1=' + (y1).toFixed(1)
	   + '   w=' + (w).toFixed(1)
	   + '   h=' + (h).toFixed(1));
}

function logNew(msg) { 
	//Define path and file name
	var path = 'E:/temp/';
	var filename = 'IndesignLog.txt';

	//Create File object
	var file = new File(path + filename);

	file.encoding = 'UTF-8';
	file.open('w');
	file.writeln(msg);
	file.close();
}

function log(msg) { 
	//Define path and file name
	var path = 'E:/temp/';
	var filename = 'IndesignLog.txt';

	//Create File object
	var file = new File(path + filename);

	file.encoding = 'UTF-8';
	file.open('a');
	file.writeln(msg);
	file.close();
}  
