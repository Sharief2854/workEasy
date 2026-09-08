$workEasyDir = "d:\sharief\workEasy"
$icoPath = "$workEasyDir\public\workeasy.ico"
$pngPath = "$workEasyDir\public\workeasy.png"

# 1. Regenerate Python-based proper binary ICO
python -c "
import os, struct

png_path = r'$pngPath'
ico_path = r'$icoPath'

if os.path.exists(png_path):
    with open(png_path, 'rb') as f:
        png_data = f.read()

    ico_header = struct.pack('<HHH', 0, 1, 1)
    ico_entry = struct.pack('<BBBBHHII', 0, 0, 0, 0, 1, 32, len(png_data), 22)
    
    with open(ico_path, 'wb') as f:
        f.write(ico_header + ico_entry + png_data)
    print('ICO generated!')
"

# 2. Locate all Desktop locations
$desktopPaths = @(
    [System.Environment]::GetFolderPath('Desktop'),
    "$env:USERPROFILE\Desktop",
    "$env:USERPROFILE\OneDrive\Desktop"
) | Select-Object -Unique | Where-Object { Test-Path $_ }

$wshShell = New-Object -ComObject WScript.Shell
$electronExe = "$workEasyDir\node_modules\electron\dist\electron.exe"

foreach ($destDir in $desktopPaths) {
    $shortcutPath = "$destDir\WorkEasy.lnk"
    
    if (Test-Path $shortcutPath) {
        Remove-Item $shortcutPath -Force -ErrorAction SilentlyContinue
    }
    
    $shortcut = $wshShell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = $electronExe
    $shortcut.Arguments = "."
    $shortcut.WorkingDirectory = $workEasyDir
    $shortcut.IconLocation = "$icoPath,0"
    $shortcut.Description = "WorkEasy Pro - Developed by Sharief"
    $shortcut.Save()
    
    Write-Output "Created: $shortcutPath with icon $icoPath"
}

# 3. Notify Windows Shell to refresh icon cache immediately
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;

public class ShellNotifier {
    [DllImport("shell32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    public static extern void SHChangeNotify(int wEventId, uint uFlags, IntPtr dwItem1, IntPtr dwItem2);
}
"@

# SHCNE_ASSOCCHANGED = 0x08000000, SHCNF_FLUSH = 0x1000
[ShellNotifier]::SHChangeNotify(0x08000000, 0x1000, [IntPtr]::Zero, [IntPtr]::Zero)
Write-Output "Windows Shell notified to refresh icon cache."
