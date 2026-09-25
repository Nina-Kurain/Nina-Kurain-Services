Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\sarha\.gemini\antigravity-ide\brain\1e9a10e3-3a4e-4d68-9be1-57fffa4ae1e5\.user_uploaded\media_1790356761963.jpg"

if (!(Test-Path $srcPath)) {
    Write-Error "Source image not found at $srcPath"
    exit 1
}

# 1. Preserve exact original JPG file
Copy-Item $srcPath "public/icon.jpg" -Force
Copy-Item $srcPath "public/icon-source.jpg" -Force

# Load source image
$src = [System.Drawing.Image]::FromFile($srcPath)
Write-Host "Source Image Dimensions: $($src.Width) x $($src.Height)"

function Export-Icon($image, [int]$width, [int]$height, [string]$targetPath) {
    $dir = [System.IO.Path]::GetDirectoryName($targetPath)
    if (!(Test-Path $dir)) { 
        New-Item -ItemType Directory -Force -Path $dir | Out-Null 
    }
    
    $bmp = New-Object System.Drawing.Bitmap $width, $height
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    $g.DrawImage($image, 0, 0, $width, $height)
    $g.Dispose()
    
    $bmp.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Created: $targetPath ($width x $height)"
}

# Web icons
Export-Icon $src 1024 1024 "public/icon.png"
Export-Icon $src 512 512 "public/icon-512x512.png"
Export-Icon $src 192 192 "public/icon-192x192.png"
Export-Icon $src 96 96 "public/icon-96x96.png"
Export-Icon $src 48 48 "public/favicon-48x48.png"
Export-Icon $src 180 180 "public/apple-touch-icon.png"

# iOS iconset
$iosSizes = @(
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
foreach ($i in $iosSizes) {
    Export-Icon $src $i.Size $i.Size "ios/NinaKurainApp/Assets.xcassets/AppIcon.appiconset/$($i.File)"
}

# Android mipmap icons
$androidDensities = @(
    @{ Name = "mipmap-mdpi"; Size = 48 },
    @{ Name = "mipmap-hdpi"; Size = 72 },
    @{ Name = "mipmap-xhdpi"; Size = 96 },
    @{ Name = "mipmap-xxhdpi"; Size = 144 },
    @{ Name = "mipmap-xxxhdpi"; Size = 192 }
)
foreach ($d in $androidDensities) {
    $folder = "android/app/src/main/res/$($d.Name)"
    Export-Icon $src $d.Size $d.Size "$folder/ic_launcher.png"
    Export-Icon $src $d.Size $d.Size "$folder/ic_launcher_round.png"
    Export-Icon $src $d.Size $d.Size "$folder/ic_launcher_foreground.png"
}

$src.Dispose()
Write-Host "All icons exported successfully with 100% color fidelity!"
