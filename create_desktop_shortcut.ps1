# Create KeyFlow Desktop Shortcut with Custom App Icon
$WshShell = New-Object -comObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$ShortcutPath = Join-Path $DesktopPath "KeyFlow AI Typing.lnk"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$TargetBat = Join-Path $ScriptDir "KeyFlow.bat"
$IconPath = Join-Path $ScriptDir "web\favicon.ico"

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $TargetBat
$Shortcut.WorkingDirectory = $ScriptDir
if (Test-Path $IconPath) {
    $Shortcut.IconLocation = "$IconPath,0"
}
$Shortcut.Description = "KeyFlow AI Typing — Local Adaptive Desktop Studio"
$Shortcut.WindowStyle = 7 # Minimized / clean launch
$Shortcut.Save()

Write-Host "✅ Success! Desktop shortcut created at: $ShortcutPath" -ForegroundColor Green
