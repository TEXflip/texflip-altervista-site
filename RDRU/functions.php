<?php
$db_host = "localhost";
$db_user = "texflip";
$db_name = "my_texflip";

$db = mysql_connect($db_host, $db_user);
if ($db == FALSE)
die ("Errore nella connessione.");

$ris = mysql_select_db($db_name);
if ($ris == FALSE)
die ("Errore nella selezione del DB.");

function str_replace_first($from, $to, $content)
{
    $from = '/'.preg_quote($from, '/').'/';
    return preg_replace($from, $to, $content, 1);
}

function getRandom(){
	$db = mysql_connect("localhost", "my_texflip");
	$query = "SELECT l.objects,l.phrase,l.meters,p.phrase,p.singular FROM lengths l INNER JOIN phrases p ON l.phrase=p.id ORDER BY RAND() LIMIT 1";
    $query2 = "SELECT name,metersForUnit,nameSingular FROM units order by RAND() LIMIT 1";
    if ($row = mysql_fetch_array(mysql_query($query)))
	{
    	$objects = split(";",$row['objects']);
        $out = $row['phrase'];
        $notOne = TRUE;
        foreach ($objects as &$v)
        	$out = str_replace_first("?","<label class = \"place\">".$v."</label>",$out);
        if($row2 = mysql_fetch_array(mysql_query($query2))){
        	$val = doubleval($row['meters'])/doubleval($row2['metersForUnit']);
            $absVal = abs($val);
            if($absVal > 100)
            	$val = number_format($val, 0, '.', '');
            else if($absVal <= 100 && $absVal > 10)
            	$val = number_format($val, 0, '.', '');
            else if($absVal <= 10 && $absVal > 1)
            	$val = number_format($val, 1, '.', '');
            else if($absVal == 1){
            	$val = number_format($val, 0, '.', '');
                $notOne = FALSE;
            }
            else if($absVal < 1 && $absVal > 0.1)
            	$val = number_format($val, 2, '.', '');
            else if($absVal <= 0.1 && $absVal > 0.01)
            	$val = number_format($val, 3, '.', '');
            else if($absVal <= 0.01 && $absVal > 0.0001)
            	$val = number_format($val, 5, '.', '');
            else if($absVal <= 0.0001)
            	$val = number_format($val, 10, '.', '');
            $out = str_replace_first("?","<label id = \"distance\">".$val."</label>",$out);
            if ($notOne && ($row['singular']==0 || is_null($row2['nameSingular'])))
            	$out = str_replace_first("?","<label id = \"unit\">".$row2['name']."</label>",$out);
            else
            	$out = str_replace_first("?","<label id = \"unit\">".$row2['nameSingular']."</label>",$out);
        }
	}
    echo $out;
}
?>