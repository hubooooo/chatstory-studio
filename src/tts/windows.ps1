param([Parameter(Mandatory=$true)][string]$TextBase64,[Parameter(Mandatory=$true)][string]$OutputFile,[string]$Gender='Female',[int]$SpeechRate=0)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Speech
$synth=New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
  $voices=@($synth.GetInstalledVoices() | Where-Object {$_.Enabled -and $_.VoiceInfo.Culture.Name -eq 'zh-CN' -and $_.VoiceInfo.Gender.ToString() -eq $Gender})
  if ($voices.Count -eq 0) { throw "No installed zh-CN $Gender SAPI voice. Import local audio or install Windows speech voices." }
  $synth.SelectVoice($voices[0].VoiceInfo.Name)
  $synth.Rate=[Math]::Max(-10,[Math]::Min(10,$SpeechRate))
  $synth.SetOutputToWaveFile($OutputFile)
  $synth.Speak([Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($TextBase64)))
} finally { $synth.Dispose() }
