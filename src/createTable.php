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
    <link rel="stylesheet" href="customizableData.css">
    <link rel="stylesheet" href="style.css">
</head>

<body id="tableBody">

<table id="tableAll">
    <thead>
        <tr>
            <th colspan="3">insgesamt</th>
        </tr>
        <tr>
            <th>bearbeitete Aufgaben</th>
            <th>Fehler bei der Gleichm&auml;&szlig;igkeit</th>
            <th>Fehler beim Z&auml;hlen</th>
        </tr>
    </head>
    <tbody>
        <tr>
            <?php foreach (array_slice($dataToWrite, 0, 3) as $wert): ?>
                <td><?php echo htmlspecialchars($wert); ?></td>
            <?php endforeach; ?>
        </tr>
    </tbody>
</table>

<table id="tableEqualize">
    <thead>
        <tr>
            <th colspan="6">Modus Ausgleichen</th>
        </tr>
        <tr>
            <th>bearbeitete Aufgaben</th>
            <th>Fehler bei der Gleichm&auml;&szlig;igkeit</th>
            <th>Fehler beim Z&auml;hlen</th>

            <th>bearbeitete Aufgaben mit halben Keksen</th>
            <th>Fehler bei der Gleichm&auml;&szlig;igkeit</th>
            <th>Fehler beim Z&auml;hlen</th>
        </tr>
    </head>
    <tbody>
        <tr>
            <?php foreach (array_slice($dataToWrite, 3, 6) as $wert): ?>
                <td><?php echo htmlspecialchars($wert); ?></td>
            <?php endforeach; ?>
        </tr>
    </tbody>
</table>

<table id="tableDistribute">
    <thead>
        <tr>
            <th colspan="8">Modus Verteilen</th>
        </tr>
        <tr>
            <th>bearbeitete Aufgaben</th>
            <th>H&auml;ufigkeit des Kekse-Einsammelns</th>
            <th>Fehler bei der Gleichm&auml;&szlig;igkeit</th>
            <th>Fehler beim Z&auml;hlen</th>

            <th>bearbeitete Aufgaben mit halben Keksen</th>
            <th>H&auml;ufigkeit des Kekse-Einsammelns</th>
            <th>Fehler bei der Gleichm&auml;&szlig;igkeit</th>
            <th>Fehler beim Z&auml;hlen</th>
        </tr>
    </head>
    <tbody>
        <tr>
            <?php foreach (array_slice($dataToWrite, 9, 8) as $wert): ?>
                <td><?php echo htmlspecialchars($wert); ?></td>
            <?php endforeach; ?>
        </tr>
    </tbody>
</table>

<table id="tableEqualizeDistribute">
    <thead>
        <tr>
            <th colspan="8">Modus Ausgleichen / Verteilen</th>
        </tr>
        <tr>
            <th>bearbeitete Aufgaben</th>
            <th>H&auml;ufigkeit des Kekse-Einsammelns</th>
            <th>Fehler bei der Gleichm&auml;&szlig;igkeit</th>
            <th>Fehler beim Z&auml;hlen</th>

            <th>bearbeitete Aufgaben mit halben Keksen</th>
            <th>H&auml;ufigkeit des Kekse-Einsammelns</th>
            <th>Fehler bei der Gleichm&auml;&szlig;igkeit</th>
            <th>Fehler beim Z&auml;hlen</th>
        </tr>
    </head>
    <tbody>
        <tr>
            <?php foreach (array_slice($dataToWrite, 17, 8) as $wert): ?>
                <td><?php echo htmlspecialchars($wert); ?></td>
            <?php endforeach; ?>
        </tr>
    </tbody>
</table>

</body>
</html>