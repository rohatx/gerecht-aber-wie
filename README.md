Um die Seite anzusehen, müssen alle Datein in einen Ordner heruntergeladen werden.
Die Seite kann dann durch öffnen von index.html gestartet werden.

**Einstellungen per URL vornehmen** 

    Wenn mit halben Keksen gearbeitet werden soll: mit-halben-keksen=true (sonst =false oder weglassen)

    Modus 1: Kekse ausgleichen: modus=ausgleichen
    Modus 2: Kekse verteilen: modus=verteilen
    MOdus 3: Kekse ausgleichen mit beliebig oft einsammeln: modus=ausgleichen-verteilen
    
    Keksanzahl-Intervall einstellen: anzahl-kekse=minKeksanzahl,maxKeksanzahl

    Die Statistiken unter einem bestimmten Kürzel (z.B. "abc") speichern: kuerzel=abc

    Beispiel URL:
    ...?mit-halben-keksen=true&modus=ausgleichen&anzahl-kekse=4,16&kuerzel=abc

**Statistiken filtern und ansehen**

    Für summierte Statistiken der URL Folgendes anfügen:
    ...createTable.php

    Für gefilterte Statistiken nach Kürzel (z.B. "abc") der URL Folgendes anfügen:
    ...createTable.php?kuerzel=abc

## Lizenz

    Dieses Projekt steht unter der [MIT-Lizenz](./LICENSE).
