Add-Type -AssemblyName System.Drawing

$src = [System.Drawing.Bitmap]::new('public/logo.png')

# Monogram crop bounds
$monoW = 854
$monoH = 648
$cropX = 348
$cropY = 82

function GenerateSquareIcon([int]$size, [string]$outPath) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    # Let the monogram take up ~92% of the canvas for maximum visibility at small sizes
    $pad = [int]($size * 0.04)
    $targetW = $size - ($pad * 2)
    $scale = $targetW / $monoW
    $targetH = [int]($monoH * $scale)
    $destX = [int](($size - $targetW) / 2)
    $destY = [int](($size - $targetH) / 2)

    $srcRect = New-Object System.Drawing.Rectangle $cropX, $cropY, $monoW, $monoH
    $destRect = New-Object System.Drawing.Rectangle $destX, $destY, $targetW, $targetH
    $g.DrawImage($src, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()

    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Generated $outPath ($size x $size)"
}

# 1. Generate PNG icons
GenerateSquareIcon 48  'public/favicon-48x48.png'
GenerateSquareIcon 96  'public/icon-96x96.png'
GenerateSquareIcon 192 'public/icon-192x192.png'
GenerateSquareIcon 512 'public/icon-512x512.png'
GenerateSquareIcon 180 'public/apple-touch-icon.png'
GenerateSquareIcon 512 'public/icon.png'

# Also generate 16x16 and 32x32 for the ICO file
GenerateSquareIcon 16 'scratch/icon-16.png'
GenerateSquareIcon 32 'scratch/icon-32.png'

# Also copy to root directory
Copy-Item 'public/favicon-48x48.png' 'favicon-48x48.png'
Copy-Item 'public/apple-touch-icon.png' 'apple-touch-icon.png'

# 2. Build multi-resolution favicon.ico containing 16x16, 32x32, and 48x48 PNG frames
$icoSizes = @(16, 32, 48)
$pngBuffers = @()
foreach ($sz in $icoSizes) {
    $pngFile = if ($sz -eq 48) { 'public/favicon-48x48.png' } else { "scratch/icon-$sz.png" }
    $pngBuffers += ,[System.IO.File]::ReadAllBytes($pngFile)
}

$ms = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter $ms

# Header: reserved(0), type(1), count
$bw.Write([uint16]0)
$bw.Write([uint16]1)
$bw.Write([uint16]$icoSizes.Count)

$offset = 6 + (16 * $icoSizes.Count)
for ($i = 0; $i -lt $icoSizes.Count; $i++) {
    $sz = $icoSizes[$i]
    $buf = $pngBuffers[$i]
    $bw.Write([byte]$sz) # width
    $bw.Write([byte]$sz) # height
    $bw.Write([byte]0)   # color palette
    $bw.Write([byte]0)   # reserved
    $bw.Write([uint16]1) # color planes
    $bw.Write([uint16]32)# bit count
    $bw.Write([uint32]$buf.Length) # data length
    $bw.Write([uint32]$offset)     # data offset
    $offset += $buf.Length
}

foreach ($buf in $pngBuffers) {
    $bw.Write($buf)
}

$bw.Flush()
[System.IO.File]::WriteAllBytes('public/favicon.ico', $ms.ToArray())
[System.IO.File]::WriteAllBytes('favicon.ico', $ms.ToArray())
$bw.Dispose()
$ms.Dispose()

Write-Host "Generated public/favicon.ico and root favicon.ico with 16, 32, 48px frames!"
$src.Dispose()
