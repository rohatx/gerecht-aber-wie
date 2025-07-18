<?php
header("Content-Type: text/plain; charset=utf-8");

$csvFile = "stats.csv";

// Read POST-Data
$identifier = $_POST["identifier"] ?? "";
$mode = $_POST["mode"] ?? "";
$withHalf = filter_var($_POST["withHalf"] ?? "false", FILTER_VALIDATE_BOOLEAN);
$equalityErrors = floatval($_POST["equalityErrors"] ?? 0);
$countErrors = floatval($_POST["countErrors"] ?? 0);
$collectionClicks = floatval($_POST["collectionClicks"] ?? 0);

$columns = [
    "gesamt" => ["bearbeitete-aufgaben-insgesamt", "gleichmaessigkeitsfehler-insgesamt", "zaehlfehler-insgesamt"],
    "ausgleichen" => ["bearbeitete-ausgleich-aufgaben", "gleichmaessigkeitsfehler-ausgleichen", "zaehlfehler-ausgleichen"],
    "ausgleichen_halb" => ["bearbeitete-ausgleich-aufgaben-mit-halben-keksen", "gleichmaessigkeitsfehler-ausgleichen-mit-haelften", "zaehlfehler-ausgleichen-mit-haelften"],
    "verteilen" => ["bearbeitete-verteil-aufgaben", "gleichmaessigkeitsfehler-verteilen", "zaehlfehler-verteilen"],
    "verteilen_halb" => ["bearbeitete-verteil-aufgaben-mit-halben-keksen", "gleichmaessigkeitsfehler-verteilen-mit-haelften", "zaehlfehler-verteilen-mit-haelften"],
    "ausgleichen-verteilen" => ["bearbeitete-ausgleich-verteil-aufgaben", "gleichmaessigkeitsfehler-ausgleichen-verteilen", "zaehlfehler-ausgleichen-verteilen"],
    "ausgleichen-verteilen_halb" => ["bearbeitete-ausgleich-verteil-aufgaben-mit-halben-keksen", "gleichmaessigkeitsfehler-ausgleichen-verteilen-mit-haelften", "zaehlfehler-ausgleichen-verteilen-mit-haelften"]
];

// CSV einlesen
$data = [];
$head = [];
$rowFound = false;

if (($handle = fopen($csvFile, "r")) !== false) {
    $head = fgetcsv($handle, 0, ",", '"', "\\"); // First row: Header
    while (($row = fgetcsv($handle, 0, ",", '"', "\\")) !== false) {
        $data[] = $row;
    }
    fclose($handle);
}

if ($withHalf) {
    $mode = $mode . "_halb";
}

// Determine the column-indices.
$indexTotalCount = array_search($columns["gesamt"][0], $head);
$indexTotalEqualityErrors = array_search($columns["gesamt"][1], $head);
$indexTotalCountErrors = array_search($columns["gesamt"][2], $head);
$indexModeCount = array_search($columns[$mode][0], $head);
$indexModeEqualityErrors = array_search($columns[$mode][1], $head);
$indexModeCountErrors = array_search($columns[$mode][2], $head);
$indexDistributeCollectionCount = array_search("haeufigkeit-des-kekse-einsammelns-verteilen", $head);
$indexDistributeCollectionCountWithHalf = array_search("haeufigkeit-des-kekse-einsammelns-mit-haelften-verteilen", $head);
$indexEqualizeDistributeCollectionCount = array_search("haeufigkeit-des-kekse-einsammelns-ausgleichen-verteilen", $head);
$indexEqualizeDistributeCollectionCountWithHalf = array_search("haeufigkeit-des-kekse-einsammelns-mit-haelften-ausgleichen-verteilen", $head);
echo $indexDistributeCollectionCount;
echo $indexDistributeCollectionCountWithHalf;
echo $indexEqualizeDistributeCollectionCount;
echo $indexEqualizeDistributeCollectionCountWithHalf;
echo $mode;

// Search for the right row with identifier.
foreach ($data as &$row) {
    if ($row[0] === $identifier) {
        $row[$indexTotalCount]++;
        $row[$indexTotalEqualityErrors] += $equalityErrors;
        $row[$indexTotalCountErrors] += $countErrors;
        $row[$indexModeCount]++;
        $row[$indexModeEqualityErrors] += $equalityErrors;
        $row[$indexModeCountErrors] += $countErrors;
        if ($withHalf) {
            if ($mode === "verteilen_halb"){
                $row[$indexDistributeCollectionCountWithHalf] += $collectionClicks;
                echo "Test1";
            } else {
                $row[$indexEqualizeDistributeCollectionCountWithHalf] += $collectionClicks;
                echo "Test2";
            }
        } else {
            if ($mode === "verteilen"){
                $row[$indexDistributeCollectionCount] += $collectionClicks;
                echo "Test3";
            } else {
                $row[$indexEqualizeDistributeCollectionCount] += $collectionClicks;
                echo "Test4";
            }
        }
        $rowFound = true;
        break;
    }
}
unset($row);

// New identifier: Add a row.
if (!$rowFound) {
    $new = array_fill(0, count($head), 0);
    $new[0] = $identifier;
    $new[$indexTotalCount] = 1;
    $new[$indexTotalEqualityErrors] = $equalityErrors;
    $new[$indexTotalCountErrors] = $countErrors;
    $new[$indexModeCount] = 1;
    $new[$indexModeEqualityErrors] = $equalityErrors;
    $new[$indexModeCountErrors] = $countErrors;
    if ($withHalf) {
        if ($mode === "verteilen_halb"){
            $new[$indexDistributeCollectionCountWithHalf] = $collectionClicks;
        } else {
            $new[$indexEqualizeDistributeCollectionCountWithHalf] = $collectionClicks;
        }
    } else {
        if ($mode === "verteilen"){
            $new[$indexDistributeCollectionCount] = $collectionClicks;
        } else {
            $new[$indexEqualizeDistributeCollectionCount] = $collectionClicks;
        }
    }
    $data[] = $new;
}

// Rewrite CSV
if (($handle = fopen($csvFile, "w")) !== false) {
    fputcsv($handle, $head, ",", '"', "\\");
    foreach ($data as $row) {
        fputcsv($handle, $row, ",", '"', "\\");
    }
    fclose($handle);
    echo "OK";
} else {
    http_response_code(500);
    echo "Fehler beim Schreiben der Datei.";
}
