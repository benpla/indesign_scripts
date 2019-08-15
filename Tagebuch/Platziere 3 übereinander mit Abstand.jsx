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



//BESCHREIBUNG: 
ordnet Tagebuch-Bilder vertikal innerhalb des Textbereichs an.
Dabei werden die Objekte exakt am Raster ausgerichtet:
    - Oberkante auf das Hauptraster, welches mit den Oberlinien der Kleinbuchstaben gleichauf liegt
    - Unterkante auf das Grundlinienraster, damit die Unterkante der Bilder mit den Zeilen abschließt
    - zwischen den Bildern wird 1 Grundlinienhöhe ausgelassen, um Platz für eine Bildüberschrift zu lassen
*/

#target Indesign
 
#include  "includes/Platzierungsfunktionen.jsx"
 
var mySelection = null; 


main();

function main(){
	logNew("Start")
	app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;
	//Make certain that user interaction (display of dialogs, etc.) is turned on.
	//app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
	
    
	if(app.documents.length != 0){    
        var letSpaceForPicCaptions = true;
        PlatziereRahmenVertikal (letSpaceForPicCaptions);
	}
	else alert("No documents are open. Please open a document and try again.");
}



