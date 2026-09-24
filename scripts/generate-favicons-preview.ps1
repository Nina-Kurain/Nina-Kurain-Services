Add-Type -AssemblyName System.Drawing

$src = [System.Drawing.Bitmap]::new('public/logo.png')

# Monogram source crop:
# bounds: X: 348..1202 (W=854), Y: 82..730 (H=648)
$monoW = 854
$monoH = 648
$cropX = 348
$cropY = 82

# Target canvas: 512x512
function CreateIcon([string]$outPath, [bool]$hasBackground) {
    $size = 512
    $bmp = New-Object System.Drawing.Bitmap $size, $size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    if ($hasBackground) {
        # Luxury dark obsidian background with subtle gradient
        $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 15, 6, 12))
        $g.FillEllipse($brush, 8, 8, ($size - 16), ($size - 16))
        $brush.Dispose()

        # Elegant gold border
        $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 212, 175, 110)), 10
        $g.DrawEllipse($pen, 8, 8, ($size - 16), ($size - 16))
        $pen.Dispose()
    } else {
        $g.Clear([System.Drawing.Color]::Transparent)
    }

    # Draw the monogram centered
    # In the circle/canvas, let's give it padding
    $pad = if ($hasBackground) { 90 } else { 40 }
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
    Write-Host "Created $outPath"
}

CreateIcon 'scratch/icon-circle.png' $true
CreateIcon 'scratch/icon-transparent.png' $false

$src.Dispose()
