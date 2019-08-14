### BESCHREIBUNG:
Erzeugt Bildunterschriften für alle markierten Objekte mit verknüpften Grafiken.
Dafür werden alle Metadaten aus der verknüpften Bilddatei gelesen und zu einer informativen Bildunterschrift zusammengestellt. 
Anschließend wird ein Textrahmen, welcher unter dem Bild platziert wird. 
Alle Textrahmen mit Bildunterschriften werden in einem eigenen Layer für Bildunterschriften erzeugt. 
Der Textrahmen erhält als Inhalt den Text mit den Metadaten. 
Dabei wird geprüft, ob die Bildunterschrift aufgrund zu geringer Breite des Bildes umbrochen wird. 
Der Test der Bildunterschrift wird in einer Schleife so lange intelligent gekürzt, bis er in eine einzige Zeile passt.
Die Art des Umbruchs kann in der Funktion 'GetXmpMetadataTextFromImage' angepasst werden. 

### DESCRIPTION: 
Creates captions for all selected objects with linked graphics.
All metadata is read from the linked image file and combined into an informative caption. 
A text frame is then placed under the image. All text frames with picture captions are created in a separate layer for picture captions. 
The text frame contains the text with the metadata. The system checks whether the caption is wrapped because the width of the image is too small. The caption test is intelligently shortened in a loop until it fits into a single line.
The type of wrapping can be adjusted in the function 'GetXmpMetadataTextFromImage'. 

