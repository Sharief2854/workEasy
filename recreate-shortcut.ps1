$paths = @(
    "C:\Users\gotlu\Desktop\WorkEasy.lnk",
    "C:\Users\gotlu\OneDrive\Desktop\WorkEasy.lnk",
    "C:\Users\Public\Desktop\WorkEasy.lnk"
)

# 1. Remove all existing shortcuts completely
foreach ($p in $paths) {
    if (Test-Path $p) {
        Remove-Item -Path $p -Force -ErrorAction SilentlyContinue
        Write-Output "Removed old shortcut: $p"
    }
}

Start-Sleep -Seconds 1

# 2. Re-create fresh shortcut with the 3D Orange Icon
$workEasyDir = "d:\sharief\workEasy"
$icoPath = "$workEasyDir\public\workeasy.ico"
$electronExe = "$workEasyDir\node_modules\electron\dist\electron.exe"

$targetDesktop = if (Test-Path "C:\Users\gotlu\OneDrive\Desktop") { "C:\Users\gotlu\OneDrive\Desktop" } else { "C:\Users\gotlu\Desktop" }
$newShortcutPath = "$targetDesktop\WorkEasy.lnk"

$wshShell = New-Object -ComObject WScript.Shell
$shortcut = $wshShell.CreateShortcut($newShortcutPath)
$shortcut.TargetPath = $electronExe
$shortcut.Arguments = "."
$shortcut.WorkingDirectory = $workEasyDir
$shortcut.IconLocation = "$icoPath,0"
$shortcut.Description = "WorkEasy Pro - Developed by Sharief"
$shortcut.Save()

Write-Output "Created fresh shortcut: $newShortcutPath"

if (Test-Path "C:\Users\gotlu\Desktop") {
    Copy-Item $newShortcutPath -Destination "C:\Users\gotlu\Desktop\WorkEasy.lnk" -Force -ErrorAction SilentlyContinue
}
