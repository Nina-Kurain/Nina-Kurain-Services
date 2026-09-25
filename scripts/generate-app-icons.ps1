Add-Type -AssemblyName System.Drawing

$srcPath = Resolve-Path "public/icon-512x512.png"
$srcImage = [System.Drawing.Image]::FromFile($srcPath)

function Resize-Image($image, $width, $height, $outPath, $isRound = $false) {
    $dir = [System.IO.Path]::GetDirectoryName($outPath)
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }

    $bmp = New-Object System.Drawing.Bitmap $width, $height
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    if ($isRound) {
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $path.AddEllipse(0, 0, $width, $height)
        $g.SetClip($path)
    }

    $g.DrawImage($image, 0, 0, $width, $height)
    $g.Dispose()

    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Generated: $outPath ($width x $height)"
}

# --- 1. ANDROID MIPMAP ICONS ---
$androidDensities = @(
    @{ Name = "mipmap-mdpi"; Size = 48 },
    @{ Name = "mipmap-hdpi"; Size = 72 },
    @{ Name = "mipmap-xhdpi"; Size = 96 },
    @{ Name = "mipmap-xxhdpi"; Size = 144 },
    @{ Name = "mipmap-xxxhdpi"; Size = 192 }
)

$androidRes = "android/app/src/main/res"

foreach ($d in $androidDensities) {
    $folder = Join-Path $androidRes $d.Name
    # Square / standard icon
    $squarePath = Join-Path $folder "ic_launcher.png"
    Resize-Image -image $srcImage -width $d.Size -height $d.Size -outPath $squarePath -isRound $false

    # Round icon
    $roundPath = Join-Path $folder "ic_launcher_round.png"
    Resize-Image -image $srcImage -width $d.Size -height $d.Size -outPath $roundPath -isRound $true

    # Foreground for adaptive icon
    $fgPath = Join-Path $folder "ic_launcher_foreground.png"
    Resize-Image -image $srcImage -width $d.Size -height $d.Size -outPath $fgPath -isRound $false
}

# --- 2. iOS APP ICONSET ---
$iosIcons = @(
    @{ File = "AppIcon-20x20@2x.png"; Size = 40 },
    @{ File = "AppIcon-20x20@3x.png"; Size = 60 },
    @{ File = "AppIcon-29x29@2x.png"; Size = 58 },
    @{ File = "AppIcon-29x29@3x.png"; Size = 87 },
    @{ File = "AppIcon-40x40@2x.png"; Size = 80 },
    @{ File = "AppIcon-40x40@3x.png"; Size = 120 },
    @{ File = "AppIcon-60x60@2x.png"; Size = 120 },
    @{ File = "AppIcon-60x60@3x.png"; Size = 180 },
    @{ File = "AppIcon-1024x1024.png"; Size = 1024 }
)

$iosIconSet = "ios/NinaKurainApp/Assets.xcassets/AppIcon.appiconset"

foreach ($i in $iosIcons) {
    $out = Join-Path $iosIconSet $i.File
    Resize-Image -image $srcImage -width $i.Size -height $i.Size -outPath $out -isRound $false
}

$srcImage.Dispose()
Write-Host "All icons generated successfully!"
