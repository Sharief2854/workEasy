Add-Type -AssemblyName System.Drawing

$srcImage = "C:\Users\gotlu\.gemini\antigravity\brain\730f8f75-994b-4b26-8fb7-33f66c3a14fc\workeasy_app_icon_1788862728510.jpg"
$workEasyDir = "d:\sharief\workEasy"
$icoPath = "$workEasyDir\public\workeasy.ico"

$original = [System.Drawing.Image]::FromFile($srcImage)

# Sizes to generate
$sizes = @(48, 32, 16, 64, 128, 256)
$imagesData = @()

foreach ($size in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($original, 0, 0, $size, $size)
    $g.Dispose()

    # Create uncompressed 32-bit DIB
    $ms = New-Object System.IO.MemoryStream
    $bw = New-Object System.IO.BinaryWriter($ms)

    # BITMAPINFOHEADER (40 bytes)
    $bw.Write([uint32]40)              # biSize
    $bw.Write([int32]$size)            # biWidth
    $bw.Write([int32]($size * 2))      # biHeight (doubled for ICO mask)
    $bw.Write([uint16]1)               # biPlanes
    $bw.Write([uint16]32)              # biBitCount (32-bit BGRA)
    $bw.Write([uint32]0)               # biCompression (BI_RGB)
    
    # Calculate sizes
    $xorSize = $size * $size * 4
    $andRowBytes = [int]([Math]::Ceiling($size / 32.0) * 4)
    $andSize = $andRowBytes * $size
    $totalImgSize = 40 + $xorSize + $andSize
    
    $bw.Write([uint32]($xorSize + $andSize)) # biSizeImage
    $bw.Write([int32]0)                # biXPelsPerMeter
    $bw.Write([int32]0)                # biYPelsPerMeter
    $bw.Write([uint32]0)               # biClrUsed
    $bw.Write([uint32]0)               # biClrImportant

    # Write BGRA pixels (bottom row to top row)
    for ($y = $size - 1; $y -ge 0; $y--) {
        for ($x = 0; $x -lt $size; $x++) {
            $pixel = $bmp.GetPixel($x, $y)
            $bw.Write([byte]$pixel.B)
            $bw.Write([byte]$pixel.G)
            $bw.Write([byte]$pixel.R)
            $bw.Write([byte]$pixel.A)
        }
    }

    # Write AND mask (all 0 for 32-bit alpha icons)
    $andBytes = New-Object byte[] $andSize
    $bw.Write($andBytes)

    $imagesData += @{
        Size = $size
        Bytes = $ms.ToArray()
        TotalSize = $totalImgSize
    }

    $bw.Close()
    $ms.Close()
    $bmp.Dispose()
}

$original.Dispose()

# Write Full Windows ICO File
$fs = New-Object System.IO.FileStream($icoPath, [System.IO.FileMode]::Create)
$icoBw = New-Object System.IO.BinaryWriter($fs)

# ICONDIR Header (6 bytes)
$icoBw.Write([uint16]0)                # idReserved
$icoBw.Write([uint16]1)                # idType (1 = icon)
$icoBw.Write([uint16]$imagesData.Count)# idCount

# Calculate data offset: 6 + (Count * 16)
$dataOffset = 6 + ($imagesData.Count * 16)

# Write ICONDIRENTRY (16 bytes each)
foreach ($img in $imagesData) {
    $s = $img.Size
    $w = if ($s -ge 256) { [byte]0 } else { [byte]$s }
    $h = if ($s -ge 256) { [byte]0 } else { [byte]$s }

    $icoBw.Write($w)                    # bWidth
    $icoBw.Write($h)                    # bHeight
    $icoBw.Write([byte]0)               # bColorCount
    $icoBw.Write([byte]0)               # bReserved
    $icoBw.Write([uint16]1)             # wPlanes
    $icoBw.Write([uint16]32)            # wBitCount
    $icoBw.Write([uint32]$img.Bytes.Length) # dwBytesInRes
    $icoBw.Write([uint32]$dataOffset)   # dwImageOffset

    $dataOffset += $img.Bytes.Length
}

# Write Image Bitmaps
foreach ($img in $imagesData) {
    $icoBw.Write($img.Bytes)
}

$icoBw.Close()
$fs.Close()

Write-Output "✅ Standard Windows DIB ICO generated at $icoPath ($dataOffset bytes)"

# Re-link the Desktop shortcut to point explicitly to this new icon
$desktopPaths = @(
    [System.Environment]::GetFolderPath('Desktop'),
    "$env:USERPROFILE\Desktop",
    "$env:USERPROFILE\OneDrive\Desktop"
) | Select-Object -Unique | Where-Object { Test-Path $_ }

$wshShell = New-Object -ComObject WScript.Shell
$electronExe = "$workEasyDir\node_modules\electron\dist\electron.exe"

foreach ($destDir in $desktopPaths) {
    # 1. WorkEasy.lnk
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

    # 2. WorkEasy Pro.lnk (Fresh entry)
    $proShortcutPath = "$destDir\WorkEasy Pro.lnk"
    if (Test-Path $proShortcutPath) {
        Remove-Item $proShortcutPath -Force -ErrorAction SilentlyContinue
    }
    $proShortcut = $wshShell.CreateShortcut($proShortcutPath)
    $proShortcut.TargetPath = $electronExe
    $proShortcut.Arguments = "."
    $proShortcut.WorkingDirectory = $workEasyDir
    $proShortcut.IconLocation = "$icoPath,0"
    $proShortcut.Description = "WorkEasy Pro - Developed by Sharief"
    $proShortcut.Save()

    Write-Output "✅ Created Desktop shortcuts at $destDir"
}
