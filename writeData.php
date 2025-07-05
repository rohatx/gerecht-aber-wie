<?php
header('Content-Type: text/plain; charset=utf-8');

// CSV-Datei
$csvDatei = 'stats.csv';

// POST-Daten auslesen
$name = $_POST['name'] ?? '';
$mode = $_POST['mode'] ?? '';
$withHalf = filter_var($_POST['withHalf'] ?? 'false', FILTER_VALIDATE_BOOLEAN);
$gFehler = floatval($_POST['gFehler'] ?? 0);
$zFehler = floatval($_POST['zFehler'] ?? 0);
$collectionClicks = floatval($_POST['collectionClicks'] ?? 0);

// Mapping der Spaltennamen → Index in der CSV
$spalten = [
    "gesamt" => ["bearbeitete-aufgaben-insgesamt", "gleichmaessigkeitsfehler-insgesamt", "zaehlfehler-insgesamt"],
    "ausgleichen" => ["bearbeitete-ausgleich-aufgaben", "gleichmaessigkeitsfehler-ausgleichen", "zaehlfehler-ausgleichen"],
    "ausgleichen_halb" => ["bearbeitete-ausgleich-aufgaben-mit-halben-keksen", "gleichmaessigkeitsfehler-ausgleichen-mit-haelften", "zaehlfehler-ausgleichen-mit-haelften"],
    "verteilen" => ["bearbeitete-verteil-aufgaben", "gleichmaessigkeitsfehler-verteilen", "zaehlfehler-verteilen"],
    "verteilen_halb" => ["bearbeitete-verteil-aufgaben-mit-halben-keksen", "gleichmaessigkeitsfehler-verteilen-mit-haelften", "zaehlfehler-verteilen-mit-haelften"],
    "ausgleichen-verteilen" => ["bearbeitete-ausgleich-verteil-aufgaben", "gleichmaessigkeitsfehler-ausgleichen-verteilen", "zaehlfehler-ausgleichen-verteilen"],
    "ausgleichen-verteilen_halb" => ["bearbeitete-ausgleich-verteil-aufgaben-mit-halben-keksen", "gleichmaessigkeitsfehler-ausgleichen-verteilen-mit-haelften", "zaehlfehler-ausgleichen-verteilen-mit-haelften"]
];

// CSV einlesen
$daten = [];
$kopf = [];
$zeileGefunden = false;

if (($handle = fopen($csvDatei, 'r')) !== false) {
    $kopf = fgetcsv($handle, 0, ",", '"', "\\"); // Erste Zeile: Header
    while (($row = fgetcsv($handle, 0, ",", '"', "\\")) !== false) {
        $daten[] = $row;
    }
    fclose($handle);
}

if ($withHalf) {
    $mode = $mode . "_halb";
}

// Spalten-Indizes ermitteln
$indexGesamtAnzahl = array_search($spalten["gesamt"][0], $kopf);
$indexGesamtGFehler = array_search($spalten["gesamt"][1], $kopf);
$indexGesamtZFehler = array_search($spalten["gesamt"][2], $kopf);
$indexModusAnzahl = array_search($spalten[$mode][0], $kopf);
$indexModusGFehler = array_search($spalten[$mode][1], $kopf);
$indexModusZFehler = array_search($spalten[$mode][2], $kopf);
$indexCollectionCount = array_search("haeufigkeit-des-kekse-einsammelns", $kopf);
$indexCollectionCountWithHalf = array_search("haeufigkeit-des-kekse-einsammelns-mit-haelften", $kopf);

// Bestehenden Namen suchen
foreach ($daten as &$row) {
    if (mb_strtolower($row[0]) === mb_strtolower($name)) {
        $row[$indexGesamtAnzahl]++;
        $row[$indexGesamtGFehler] += $gFehler;
        $row[$indexGesamtZFehler] += $zFehler;
        $row[$indexModusAnzahl]++;
        $row[$indexModusGFehler] += $gFehler;
        $row[$indexModusZFehler] += $zFehler;
        if ($withHalf) {
            $row[$indexCollectionCountWithHalf] += $collectionClicks;
        } else {
            $row[$indexCollectionCount] += $collectionClicks;
        }
        $zeileGefunden = true;
        break;
    }
}
unset($row); // Referenz aufheben

// Neuer Name: Zeile hinzufügen
if (!$zeileGefunden) {
    $neu = array_fill(0, count($kopf), 0);
    $neu[0] = $name;
    $neu[$indexGesamtAnzahl] = 1;
    $neu[$indexGesamtGFehler] = $gFehler;
    $neu[$indexGesamtZFehler] = $zFehler;
    $neu[$indexModusAnzahl] = 1;
    $neu[$indexModusGFehler] = $gFehler;
    $neu[$indexModusZFehler] = $zFehler;
    if ($withHalf) {
        $neu[$indexCollectionCountWithHalf] = $collectionClicks;
    } else {
        $neu[$indexCollectionCount] = $collectionClicks;
    }
    $daten[] = $neu;
}

// CSV neu schreiben
if (($handle = fopen($csvDatei, 'w')) !== false) {
    fputcsv($handle, $kopf, ",", '"', "\\");
    foreach ($daten as $row) {
        fputcsv($handle, $row, ",", '"', "\\");
    }
    fclose($handle);
    echo "OK";
} else {
    http_response_code(500);
    echo "Fehler beim Schreiben der Datei.";
}
