[CmdletBinding(SupportsShouldProcess = $true,ConfirmImpact = "High")]
param(
    [ValidateRange(1,100)]
    [int]$KeepLast = 5,

    [switch]$DeleteTags,

    [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Assert-CommandExists {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name
    )

    if (-not (Get-Command -Name $Name -ErrorAction SilentlyContinue)) {
        throw "Required command '$Name' is not available."
    }
}

Assert-CommandExists -Name "gh"
Assert-CommandExists -Name "git"

$insideGitRepository = git rev-parse --is-inside-work-tree 2>$null
if ($insideGitRepository -ne "true") {
    throw "Run this script from inside a git repository clone."
}

Write-Host "Fetching releases from GitHub..."
$releasesJson = gh release list --limit 1000 --json tagName,publishedAt,isDraft,isPrerelease
$releases = $releasesJson | ConvertFrom-Json

if (-not $releases -or $releases.Count -eq 0) {
    Write-Host "No releases found. Nothing to clean up."
    exit 0
}

$publishedReleases = @($releases | Where-Object {
        $_.publishedAt -and -not $_.isDraft
    } | Sort-Object { [datetime]$_.publishedAt })

if ($publishedReleases.Count -eq 0) {
    Write-Host "No published releases found. Nothing to clean up."
    exit 0
}

$firstMajorReleaseByMajor = @{}
foreach ($release in $publishedReleases) {
    if (($release.tagName -as [string]) -match "^v?(\d+)\.") {
        $major = $matches[1]
        if (-not $firstMajorReleaseByMajor.ContainsKey($major)) {
            $firstMajorReleaseByMajor[$major] = $release
        }
    }
}

$latestReleases = @($publishedReleases | Select-Object -Last $KeepLast)
$keptTags = @(
    $firstMajorReleaseByMajor.Values | ForEach-Object { $_.tagName }
    $latestReleases | ForEach-Object { $_.tagName }
) | Select-Object -Unique

$releasesToDelete = @($publishedReleases | Where-Object {
        $keptTags -notcontains $_.tagName
    })

if ($releasesToDelete.Count -eq 0) {
    Write-Host "No releases match deletion criteria."
    exit 0
}

Write-Host "Releases selected for deletion:"
$releasesToDelete | Select-Object tagName,publishedAt | Format-Table -AutoSize

if (-not $Force) {
    $confirmation = Read-Host "Delete $($releasesToDelete.Count) release(s)? Type 'yes' to continue"
    if ($confirmation -ne "yes") {
        Write-Host "Aborted. No releases were deleted."
        exit 0
    }
}

foreach ($release in $releasesToDelete) {
    $tagName = $release.tagName
    if (-not $PSCmdlet.ShouldProcess("release '$tagName'","Delete")) {
        continue
    }

    Write-Host "Deleting release $tagName..."
    gh release delete $tagName --yes

    if (-not $DeleteTags) {
        continue
    }

    if (-not $PSCmdlet.ShouldProcess("git tag '$tagName'","Delete local and remote tags")) {
        continue
    }

    if (git tag --list $tagName) {
        git tag --delete $tagName | Out-Null
    }

    git push origin --delete $tagName
}

Write-Host "Release cleanup complete."
