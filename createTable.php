<?php
$csvDatei = 'stats.csv';

if (!file_exists($csvDatei)) {
    echo "CSV-Datei nicht gefunden.";
    exit;
}

$zeilen = [];
if (($handle = fopen($csvDatei, 'r')) !== false) {
    $ersteZeile = true;
    while (($daten = fgetcsv($handle, 0, ',', '"', '\\')) !== false) {
        // Entferne UTF-8 BOM aus der ersten Zelle (nur bei der ersten Zeile notwendig)
        if (isset($daten[0])) {
            $daten[0] = preg_replace('/^\xEF\xBB\xBF/', '', $daten[0]);
        }
        if ($ersteZeile) {
            // Ueberspringe die CSV-Kopfzeile
            $ersteZeile = false;
            continue;
        }
        $zeilen[] = $daten;
    }
    fclose($handle);
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
        td:nth-child(2),
        th:nth-child(2),
        td:nth-child(5),
        th:nth-child(5),
        td:nth-child(8),
        th:nth-child(8),
        td:nth-child(11),
        th:nth-child(11),
        td:nth-child(14),
        th:nth-child(14),
        td:nth-child(17),
        th:nth-child(17),
        td:nth-child(21),
        th:nth-child(21) {
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
            <th>Name</th>

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
        <?php foreach ($zeilen as $i => $zeile): ?>
            <tr>
                <?php foreach ($zeile as $zelle): ?>
                    <td><?= htmlspecialchars($zelle) ?></td>
                <?php endforeach; ?>
            </tr>
        <?php endforeach; ?>
    </tbody>
</table>

</body>
</html>
