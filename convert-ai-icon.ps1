Add-Type -AssemblyName System.Drawing

$srcImage = "C:\Users\gotlu\.gemini\antigravity\brain\730f8f75-994b-4b26-8fb7-33f66c3a14fc\workeasy_app_icon_1788862728510.jpg"
$workEasyDir = "d:\sharief\workEasy"
$icoPath = "$workEasyDir\public\workeasy.ico"
$pngPath = "$workEasyDir\public\workeasy.png"

$original = [System.Drawing.Image]::FromFile($srcImage)

# Save high-res master PNG
$original.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)

$sizes = @(256, 128, 64, 48, 32, 16)
$pngStreams = @()

foreach ($s in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap($s, $s, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    $g.DrawImage($original, 0, 0, $s, $s)
    $g.Dispose()

    $ms = New-Object System.IO.MemoryStream
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $pngStreams += $ms
    $bmp.Dispose()
}
$original.Dispose()

# Create Multi-Resolution ICO Binary
$fs = New-Object System.IO.FileStream($icoPath, [System.IO.FileMode]::Create)
$bw = New-Object System.IO.BinaryWriter($fs)

$bw.Write([uint16]0)
$bw.Write([uint16]1)
$bw.Write([uint16]$sizes.Count)

$offset = 6 + ($sizes.Count * 16)

for ($i = 0; $i -lt $sizes.Count; $i++) {
    $s = $sizes[$i]
    $dataLen = [uint32]$pngStreams[$i].Length

    $w = if ($s -ge 256) { [byte]0 } else { [byte]$s }
    $h = if ($s -ge 256) { [byte]0 } else { [byte]$s }

    $bw.Write($w)
    $bw.Write($h)
    $bw.Write([byte]0)
    $bw.Write([byte]0)
    $bw.Write([uint16]1)
    $bw.Write([uint16]32)
    $bw.Write($dataLen)
    $bw.Write([uint32]$offset)

    $offset += $dataLen
}

for ($i = 0; $i -lt $sizes.Count; $i++) {
    $bytes = $pngStreams[$i].ToArray()
    $bw.Write($bytes)
    $pngStreams[$i].Dispose()
}

$bw.Close()
$fs.Close()

Write-Output "✅ 3D AI Icon converted to multi-size ICO ($icoPath)"

# Refresh Desktop Shortcuts
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

    Write-Output "✅ Desktop shortcut updated at $shortcutPath"
}
