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


BESCHREIBUNG: überträgt bei 2 selektierten Objekten die Rahmengröße des ersten auf den zweiten und markiert nur den zweiten.
*/


#target Indesign
 
#include  "../includes/Platzierungsfunktionen.jsx"
 
var mySelection = null; 


main();

function main(){
	logNew("Start")
	app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;
	//Make certain that user interaction (display of dialogs, etc.) is turned on.
	//app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
	
    
	if(app.documents.length != 0){    
        var RahmenAnz = app.selection.length;
        var currentSelection = app.selection[0];
        var objectTypeName = currentSelection.constructor.name ;
        if(RahmenAnz >= 2 &&  (  objectTypeName == "Rectangle" || objectTypeName == "TextFrame") )  {
            // speichere Werte des ersten Rahmens
            var xPos = app.activeDocument.selection[0].geometricBounds[1];
            var yPos = app.activeDocument.selection[0].geometricBounds[0];
            var breite = app.activeDocument.selection[0].geometricBounds[3] -  app.activeDocument.selection[0].geometricBounds[1];
            var höhe = app.activeDocument.selection[0].geometricBounds[2] -  app.activeDocument.selection[0].geometricBounds[0];
            var objektstil = app.activeDocument.selection[0].appliedObjectStyle;
            
             //gehe alle folgenden Rahmen durch                       
            for (i = 1; i < RahmenAnz; i++) {     
                var rahmen = app.activeDocument.selection[i];
                
                // Position des Rahemns soll erhalten bleiben
                var yPosNeu = rahmen.geometricBounds[0];
                var xPosNeu = rahmen.geometricBounds[1];
                // er bekommt aber neue Werte für breite und höhe
                var neueGeometricBounds = [ yPosNeu , xPosNeu , yPosNeu + höhe , xPosNeu + breite ]  ;
                // neue Werte zuweisen
                rahmen.geometricBounds = neueGeometricBounds;
                rahmen.appliedObjectStyle = objektstil;
                
                
            } // <<<< gehe alle Rahmen durch
        
            app.select(app.selection.slice(1))

        } //<<<<< stimmt Rahmenanzahl
	}
	else alert("No documents are open. Please open a document and try again.");
}



