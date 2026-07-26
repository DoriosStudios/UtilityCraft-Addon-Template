param(
  [Parameter(Mandatory = $true)]
  [string]$ResourceId,

  [Parameter(Mandatory = $true)]
  [ValidateSet("fluid", "gas")]
  [string]$Kind,

  [Parameter(Mandatory = $true)]
  [ValidatePattern('^[0-9A-Fa-f]{6}$')]
  [string]$Tint
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)

if ($Kind -eq "fluid") {
  $baseResource = "example_coolant"
  $entityPrefix = "fluid_tank"
  $entityFolder = "fluids"
  $textureSuffix = "fluid"
} else {
  $baseResource = "example_hydrogen"
  $entityPrefix = "gas_tank"
  $entityFolder = "gases"
  $textureSuffix = "gas"
}

if ($ResourceId -eq $baseResource) {
  throw "$ResourceId is the template source entity; choose a new resource ID."
}

$sourceBp = Join-Path $projectRoot "BP/entities/$entityFolder/${entityPrefix}_${baseResource}.json"
$sourceRp = Join-Path $projectRoot "RP/entity/$entityFolder/${entityPrefix}_${baseResource}.json"
$sourceTexture = Join-Path $projectRoot "RP/textures/entity/${baseResource}_${textureSuffix}.png"
$targetBp = Join-Path $projectRoot "BP/entities/$entityFolder/${entityPrefix}_${ResourceId}.json"
$targetRp = Join-Path $projectRoot "RP/entity/$entityFolder/${entityPrefix}_${ResourceId}.json"
$targetTexture = Join-Path $projectRoot "RP/textures/entity/${ResourceId}_${textureSuffix}.png"

$bp = (Get-Content -Raw -LiteralPath $sourceBp).Replace($baseResource, $ResourceId)
$rp = (Get-Content -Raw -LiteralPath $sourceRp).Replace($baseResource, $ResourceId)
[IO.File]::WriteAllText($targetBp, $bp, $utf8WithoutBom)
[IO.File]::WriteAllText($targetRp, $rp, $utf8WithoutBom)

Add-Type -AssemblyName System.Drawing
$source = [System.Drawing.Bitmap]::FromFile($sourceTexture)
try {
  $lumas = New-Object System.Collections.Generic.List[double]
  for ($y = 0; $y -lt $source.Height; $y++) {
    for ($x = 0; $x -lt $source.Width; $x++) {
      $pixel = $source.GetPixel($x, $y)
      if ($pixel.A -gt 0) {
        $lumas.Add(0.2126 * $pixel.R + 0.7152 * $pixel.G + 0.0722 * $pixel.B)
      }
    }
  }

  $minimum = ($lumas | Measure-Object -Minimum).Minimum
  $maximum = ($lumas | Measure-Object -Maximum).Maximum
  $range = [Math]::Max(1, $maximum - $minimum)
  $targetR = [Convert]::ToInt32($Tint.Substring(0, 2), 16)
  $targetG = [Convert]::ToInt32($Tint.Substring(2, 2), 16)
  $targetB = [Convert]::ToInt32($Tint.Substring(4, 2), 16)
  $target = New-Object System.Drawing.Bitmap($source.Width, $source.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  try {
    for ($y = 0; $y -lt $source.Height; $y++) {
      for ($x = 0; $x -lt $source.Width; $x++) {
        $pixel = $source.GetPixel($x, $y)
        if ($pixel.A -eq 0) {
          $target.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
          continue
        }
        $luma = 0.2126 * $pixel.R + 0.7152 * $pixel.G + 0.0722 * $pixel.B
        $brightness = 0.75 + 0.5 * (($luma - $minimum) / $range)
        $red = [Math]::Min(255, [Math]::Round($targetR * $brightness))
        $green = [Math]::Min(255, [Math]::Round($targetG * $brightness))
        $blue = [Math]::Min(255, [Math]::Round($targetB * $brightness))
        $target.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($pixel.A, $red, $green, $blue))
      }
    }
    $target.Save($targetTexture, [System.Drawing.Imaging.ImageFormat]::Png)
  }
  finally {
    $target.Dispose()
  }
}
finally {
  $source.Dispose()
}

Write-Output "Generated ${Kind} tank entity for utilitycraft:${ResourceId}."
