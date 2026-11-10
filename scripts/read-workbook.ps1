param([Parameter(Mandatory=$true)][string]$Workbook)
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [IO.Compression.ZipFile]::OpenRead($Workbook)
function Read-Xml($name) {
  $reader = [IO.StreamReader]::new($zip.GetEntry($name).Open())
  try { [xml]$reader.ReadToEnd() } finally { $reader.Dispose() }
}
try {
  $book = Read-Xml 'xl/workbook.xml'
  $rels = Read-Xml 'xl/_rels/workbook.xml.rels'
  $strings = @()
  if ($zip.GetEntry('xl/sharedStrings.xml')) { $sx = Read-Xml 'xl/sharedStrings.xml'; $strings = @($sx.sst.si | ForEach-Object { $_.InnerText }) }
  $sheets = [ordered]@{}
  foreach ($sheet in $book.workbook.sheets.sheet) {
    $id = $sheet.GetAttribute('id','http://schemas.openxmlformats.org/officeDocument/2006/relationships')
    $target = ($rels.Relationships.Relationship | Where-Object { $_.Id -eq $id }).Target
    $entry = if ($target.StartsWith('/')) { $target.TrimStart('/') } else { 'xl/'+$target }
    $xml = Read-Xml $entry
    $cells = [ordered]@{}
    foreach ($row in $xml.worksheet.sheetData.row) {
      foreach ($cell in $row.c) {
        $value = $null
        if ($cell.t -eq 's') { $value = $strings[[int]$cell.v] }
        elseif ($cell.t -eq 'inlineStr') { $value = $cell.is.InnerText }
        elseif ($cell.v -ne $null) {
          if ($cell.t -eq 'str' -or $cell.t -eq 'e') { $value = [string]$cell.v }
          else { $value = [double]::Parse([string]$cell.v,[Globalization.CultureInfo]::InvariantCulture) }
        }
        $formula = $cell.SelectSingleNode('*[local-name()="f"]')
        $cells[$cell.r] = @{ value=$value; formula=$(if($formula){$formula.InnerText}else{$null}) }
      }
    }
    $sheets[[string]$sheet.name] = $cells
  }
  ConvertTo-Json -InputObject $sheets -Depth 8 -Compress
} finally { $zip.Dispose() }
