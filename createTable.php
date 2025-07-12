<?php
// Get the identifier from the URL
$identifier = isset($_GET["kuerzel"]) ? trim($_GET["kuerzel"]) : null;

// Open File
$csvfile = "stats.csv";
if (!file_exists($csvfile)) {
    echo "CSV-file nicht gefunden.";
    exit;
}

// Read File
$identifierData = null;
$sums = null;
if (($handle = fopen($csvfile, "r")) !== false) {
    $firstRow = true;
    while (($daten = fgetcsv($handle, 0, ',', '"', '\\')) !== false) {
        // Remove UTF-8 BOM from the first cell.
        if (isset($daten[0])) {
            $daten[0] = preg_replace('/^\xEF\xBB\xBF/', '', $daten[0]);
        }

        if ($firstRow) {
            $sums = array_fill(0, count($daten)-1, 0);
            $firstRow = false;
            continue;
        }

        if ($identifier) {
            if (trim($daten[0]) === $identifier) {
                $identifierData = array_slice($daten, 1);
                break;
            }
        } else {
            // If no identifier is specified, the values should be totaled.
            for ($i = 1; $i < count($daten); $i++) { // column = 0: identifier
                $sums[$i-1] += $daten[$i];
            }
        }
    }
    fclose($handle);
}

$dataToWrite = null;
if ($identifier){
    if ($identifierData === null) {
        echo "Keine Daten für '$identifier' gefunden.";
        exit;
    }
    $dataToWrite = $identifierData;
} else {
    $dataToWrite = $sums;
}
?>

<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Statistik-Tabelle</title>
    <style>
        table {
            border-collapse: collapse;
            width: 100%;
            font-family: sans-serif;
        }
        th, td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: center;
        }
        th {
            background-color: #eee;
        }
        td:nth-child(4),
        th:nth-child(4),
        td:nth-child(7),
        th:nth-child(7),
        td:nth-child(10),
        th:nth-child(10),
        td:nth-child(13),
        th:nth-child(13),
        td:nth-child(16),
        th:nth-child(16),
        td:nth-child(20),
        th:nth-child(20) {
            border-left: 3px solid #000;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
    </style>
</head>
<body>

<table>
    <thead>
        <tr>
            <th>insgesamt bearbeitete Aufgaben</th>
            <th>Fehler bei der Gleichm&auml;&szlig;igkeit</th>
            <th>Fehler beim Z&auml;hlen</th>

            <th>bearbeitete Ausgleich-Aufgaben</th>
            <th>Fehler bei der Gleichm&auml;&szlig;igkeit</th>
            <th>Fehler beim Z&auml;hlen</th>

            <th>bearbeitete Ausgleich-Aufgaben mit halben Keksen</th>
            <th>Fehler bei der Gleichm&auml;&szlig;igkeit</th>
            <th>Fehler beim Z&auml;hlen</th>

            <th>bearbeitete Verteil-Aufgaben</th>
            <th>Fehler bei der Gleichm&auml;&szlig;igkeit</th>
            <th>Fehler beim Z&auml;hlen</th>

            <th>bearbeitete Verteil-Aufgaben mit halben Keksen</th>
            <th>Fehler bei der Gleichm&auml;&szlig;igkeit</th>
            <th>Fehler beim Z&auml;hlen</th>

            <th>bearbeitete Ausgleich/Verteil-Aufgaben</th>
            <th>H&auml;ufigkeit des Kekse-Einsammelns</th>
            <th>Fehler bei der Gleichm&auml;&szlig;igkeit</th>
            <th>Fehler beim Z&auml;hlen</th>

            <th>bearbeitete Ausgleich/Verteil-Aufgaben mit halben Keksen</th>
            <th>H&auml;ufigkeit des Kekse-Einsammelns</th>
            <th>Fehler bei der Gleichm&auml;&szlig;igkeit</th>
            <th>Fehler beim Z&auml;hlen</th>
        </tr>
    </head>
    <tbody>
        <tr>
            <?php foreach ($dataToWrite as $wert): ?>
                <td><?php echo htmlspecialchars($wert); ?></td>
            <?php endforeach; ?>
        </tr>
    </tbody>
</table>

</body>
</html>
