Add-Type -AssemblyName System.Drawing

$workEasyDir = "d:\sharief\workEasy"
$icoPath = "$workEasyDir\public\workeasy.ico"
$pngPath = "$workEasyDir\public\workeasy.png"

# Helper to draw the orange icon at any exact pixel size
function Draw-IconCanvas([int]$size) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    $scale = $size / 256.0

    # 1. Fill Rounded Squircle with Vibrant Pure Orange (#ea580c / RGB 234, 88, 12)
    $rectX = [float](10 * $scale)
    $rectY = [float](10 * $scale)
    $rectW = [float](236 * $scale)
    $rectH = [float](236 * $scale)
    $radius = [float](54 * $scale)

    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $diameter = $radius * 2
    $path.AddArc($rectX, $rectY, $diameter, $diameter, 180, 90)
    $path.AddArc($rectX + $rectW - $diameter, $rectY, $diameter, $diameter, 270, 90)
    $path.AddArc($rectX + $rectW - $diameter, $rectY + $rectH - $diameter, $diameter, $diameter, 0, 90)
    $path.AddArc($rectX, $rectY + $rectH - $diameter, $diameter, $diameter, 90, 90)
    $path.CloseFigure()

    $orangeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 234, 88, 12))
    $g.FillPath($orangeBrush, $path)

    # 2. Golden Highlight Border (#fdba74)
    $highlightPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(200, 253, 186, 116), [Math]::Max(1.0, 4.0 * $scale))
    $g.DrawPath($highlightPen, $path)

    # 3. Center Graphic (Layered Workspace in Pure White)
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
    $whitePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 255, 255, 255), [Math]::Max(1.5, 14.0 * $scale))
    $whitePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $whitePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $whitePen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

    # Top Diamond
    $topPts = @(
        (New-Object System.Drawing.PointF((128 * $scale), (52 * $scale))),
        (New-Object System.Drawing.PointF((196 * $scale), (92 * $scale))),
        (New-Object System.Drawing.PointF((128 * $scale), (132 * $scale))),
        (New-Object System.Drawing.PointF((60 * $scale), (92 * $scale)))
    )
    $g.FillPolygon($whiteBrush, $topPts)

    # Middle Layer Line
    $g.DrawLines($whitePen, @(
        (New-Object System.Drawing.PointF((60 * $scale), (142 * $scale))),
        (New-Object System.Drawing.PointF((128 * $scale), (182 * $scale))),
        (New-Object System.Drawing.PointF((196 * $scale), (142 * $scale)))
    ))

    # Bottom Layer Line
    $g.DrawLines($whitePen, @(
        (New-Object System.Drawing.PointF((60 * $scale), (188 * $scale))),
        (New-Object System.Drawing.PointF((128 * $scale), (228 * $scale))),
        (New-Object System.Drawing.PointF((196 * $scale), (188 * $scale)))
    ))

    $path.Dispose()
    $orangeBrush.Dispose()
    $highlightPen.Dispose()
    $whiteBrush.Dispose()
    $whitePen.Dispose()
    $g.Dispose()

    return $bmp
}

# Generate 256 master PNG
$bmp256 = Draw-IconCanvas 256
$bmp256.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)

# Generate multi-size PNG buffers for standard Windows ICO
$sizes = @(256, 128, 64, 48, 32, 16)
$pngStreams = @()

foreach ($s in $sizes) {
    $bmp = Draw-IconCanvas $s
    $ms = New-Object System.IO.MemoryStream
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $pngStreams += $ms
    $bmp.Dispose()
}
$bmp256.Dispose()

# Build valid multi-image ICO binary
$fs = New-Object System.IO.FileStream($icoPath, [System.IO.FileMode]::Create)
$bw = New-Object System.IO.BinaryWriter($fs)

# Header: reserved(0), type(1), count(6)
$bw.Write([uint16]0)
$bw.Write([uint16]1)
$bw.Write([uint16]$sizes.Count)

$offset = 6 + ($sizes.Count * 16)

# Write Directory Entries
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

# Write PNG byte payloads
for ($i = 0; $i -lt $sizes.Count; $i++) {
    $bytes = $pngStreams[$i].ToArray()
    $bw.Write($bytes)
    $pngStreams[$i].Dispose()
}

$bw.Close()
$fs.Close()

Write-Output "✅ Multi-resolution Orange ICO created: $icoPath"

# Locate Desktop paths
$desktopPaths = @(
    [System.Environment]::GetFolderPath('Desktop'),
    "$env:USERPROFILE\Desktop",
    "$env:USERPROFILE\OneDrive\Desktop"
) | Select-Object -Unique | Where-Object { Test-Path $_ }

$wshShell = New-Object -ComObject WScript.Shell
$electronExe = "$workEasyDir\node_modules\electron\dist\electron.exe"

foreach ($destDir in $desktopPaths) {
    # Remove old cached shortcuts
    Remove-Item "$destDir\WorkEasy.lnk" -Force -ErrorAction SilentlyContinue
    
    # Create fresh WorkEasy shortcut
    $shortcut = $wshShell.CreateShortcut("$destDir\WorkEasy.lnk")
    $shortcut.TargetPath = $electronExe
    $shortcut.Arguments = "."
    $shortcut.WorkingDirectory = $workEasyDir
    $shortcut.IconLocation = "$icoPath,0"
    $shortcut.Description = "WorkEasy Pro - Developed by Sharief"
    $shortcut.Save()

    Write-Output "✅ Created Desktop shortcut at $destDir\WorkEasy.lnk"
}
