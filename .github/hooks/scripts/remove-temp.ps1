#Requires -Version 5.1
<#
.SYNOPSIS
    Removes all contents of the temp directory.
.DESCRIPTION
    Deletes all files and subdirectories within the ./temp folder forcefully.
.EXAMPLE
    .\remove-temp.ps1
#>

[CmdletBinding(SupportsShouldProcess)]
param ()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Continue'

$tempPath = [System.IO.Path]::GetFullPath((Join-Path -Path $PSScriptRoot -ChildPath '..\..\..\temp'))

$keepFiles = @('.gitkeep', '.nojekyll', '.gitignore', '.keep', '.htaccess')

if (Test-Path -LiteralPath $tempPath) {
    Write-Verbose "Removing contents of: $tempPath"
    Get-ChildItem -LiteralPath $tempPath -Force |
        Where-Object { $_.Name -notin $keepFiles } |
        Remove-Item -Recurse -Force -WhatIf:$WhatIfPreference
    Write-Verbose 'Temp directory cleaned successfully.'
    Write-Host "Success: Temp directory cleaned."
} else {
    Write-Verbose "Temp directory not found, nothing to clean: $tempPath"
    Write-Host "Fail: Temp directory not found, nothing to clean."
}
