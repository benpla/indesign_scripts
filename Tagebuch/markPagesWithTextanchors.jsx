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


BESCHREIBUNG: 
markiert Seiten, die Textanker enthalten

*/

#target Indesign


	//=====================================================================================

var myDoc = app.activeDocument;

function main () {

    var docObjects=myDoc.pageItems;
//~     for (i=0;i<docObjects.length;i++){
//~         var currObj=docObjects[i];
//~         if (currObj.name = "SeitenmarkierungPrivatNotiz") {
//~                 var haha = currObj;
//~         }
//~     }
     
    var Seitenmarkierungsobjekt = myDoc.pageItems.itemByName("SeitenmarkierungPrivatNotiz");
    if( !Seitenmarkierungsobjekt.isValid )  return;

    // Anchors ("Hyperlinkziele") einlesen
    var anchors = app.documents[0].hyperlinkTextDestinations.everyItem().getElements();
    if (anchors.length == 0) return;

    for (var i = anchors.length-1; i >= 0; i--) {
        // Hyperlinkziele durchgehen
        //  anchors[i].destinationText.textFrames.add ({appliedObjectStyle: ostyle, contents: anchors[i].name});
        var anchor = anchors[i];
        if (anchor.name == "TestankerFilmLegendeWeihnachtsstern") {
            // Anchor gefunden
            // Objekt soll hierher kopiert werden
//~             var myPage = app.documents.item(0).pages.add();
             var SeitenmarkierungsobjektCopy = Seitenmarkierungsobjekt.duplicate([20,20]);
             //SeitenmarkierungsobjektCopy.name = "SeitenmarkierungPrivatNotiz-" + anchor.name
            //anchor.destinationText.textFrames.add (SeitenmarkierungsobjektCopy);
            with (SeitenmarkierungsobjektCopy.anchoredObjectSettings) {
                .insertAnchoredObject (anchor.destinationText.insertionPoints[0]);
                .anchorPoint = AnchorPoint.CENTER_ANCHOR;
                .anchoredPosition = AnchorPosition.ANCHORED;
                .horizontalReferencePoint = AnchoredRelativeTo.PAGE_EDGE;
                .verticalReferencePoint = AnchoredRelativeTo.PAGE_EDGE;
                .spineRelative = true;
                .anchorXoffset = 1;
                .anchorYoffset = -1;
            }
            // Anchor the rectangle inline  at the first insertion point of the text frame:  
//            rectangle.anchoredObjectSettings.insertAnchoredObject( textFrame.insertionPoints[0] , AnchorPosition.INLINE_POSITION );
   
                var x=5;
          }
    }

}


main();
