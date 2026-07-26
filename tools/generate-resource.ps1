param(
  [Parameter(Mandatory = $true)]
  [string]$ResourceId,

  [Parameter(Mandatory = $true)]
  [ValidateSet("fluid", "gas")]
  [string]$Kind,

  [Parameter(Mandatory = $true)]
  [string]$SourceTextureDirectory,

  [Parameter(Mandatory = $true)]
  [string]$SourcePrefix,

  [Parameter(Mandatory = $true)]
  [ValidatePattern('^[0-9A-Fa-f]{6}$')]
  [string]$Tint
)

$ErrorActionPreference = "Stop"

& "$PSScriptRoot/generate-resource-display.ps1" `
  -ResourceId $ResourceId `
  -SourceTextureDirectory $SourceTextureDirectory `
  -SourcePrefix $SourcePrefix `
  -Tint $Tint

& "$PSScriptRoot/generate-resource-entity.ps1" `
  -ResourceId $ResourceId `
  -Kind $Kind `
  -Tint $Tint

& "$PSScriptRoot/generate-creative-tank.ps1" `
  -ResourceId $ResourceId `
  -Kind $Kind
