$ErrorActionPreference='Stop'
$taskRoot=Split-Path -Parent $PSScriptRoot
$logRoot=Join-Path $taskRoot 'outputs/qa'
$watchProcess=Start-Process -FilePath (Get-Command node).Source -ArgumentList @('--import','tsx','scripts/cli.ts','render','--input','outputs/qa/benchmark-30.story.json','--output','outputs/qa/memory-30.mp4') -WorkingDirectory $taskRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $logRoot 'memory-render.stdout.log') -RedirectStandardError (Join-Path $logRoot 'memory-render.stderr.log')
$peakBytes=0L
$samples=0
$watch= [Diagnostics.Stopwatch]::StartNew()
while (-not $watchProcess.HasExited) {
  $processRows=@(Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,WorkingSetSize)
  $ownedIds=[Collections.Generic.HashSet[uint32]]::new()
  [void]$ownedIds.Add([uint32]$watchProcess.Id)
  do {
    $expanded=$false
    foreach ($row in $processRows) { if ($ownedIds.Contains([uint32]$row.ParentProcessId) -and $ownedIds.Add([uint32]$row.ProcessId)) {$expanded=$true} }
  } while ($expanded)
  $sumBytes=0L
  foreach($row in $processRows){if($ownedIds.Contains([uint32]$row.ProcessId)){$sumBytes += [long]$row.WorkingSetSize}}
  $peakBytes=[Math]::Max($peakBytes,$sumBytes)
  $samples++
  Start-Sleep -Milliseconds 500
  $watchProcess.Refresh()
}
$watchProcess.WaitForExit()
if($watchProcess.ExitCode -ne 0){throw "Memory benchmark failed: $($watchProcess.ExitCode)"}
@{passed=$true;video_seconds=30;render_wall_ms=$watch.ElapsedMilliseconds;peak_process_tree_working_set_bytes=$peakBytes;samples=$samples;scope='Node renderer and descendants; sampled about every 500ms plus CIM overhead; excludes editor service'} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $taskRoot 'docs/memory-results.json') -Encoding utf8
Write-Output 'Sampled render process-tree memory benchmark PASS'
