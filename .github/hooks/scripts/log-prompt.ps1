Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Resolve-TimestampMs {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $false)]
    [AllowNull()]
    [AllowEmptyString()]
    [object]$Value
  )

  if ($null -eq $Value) {
    return [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
  }

  if (
    $Value -is [byte] -or
    $Value -is [sbyte] -or
    $Value -is [int16] -or
    $Value -is [uint16] -or
    $Value -is [int32] -or
    $Value -is [uint32] -or
    $Value -is [int64] -or
    $Value -is [uint64] -or
    $Value -is [single] -or
    $Value -is [double] -or
    $Value -is [decimal]
  ) {
    return [long]$Value
  }

  $stringValue = [string]$Value

  if ([string]::IsNullOrWhiteSpace($stringValue)) {
    return [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
  }

  $numericTimestamp = 0L
  if ([long]::TryParse($stringValue, [ref]$numericTimestamp)) {
    return $numericTimestamp
  }

  $parsedTimestamp = [DateTimeOffset]::MinValue
  if (
    [DateTimeOffset]::TryParse(
      $stringValue,
      [System.Globalization.CultureInfo]::InvariantCulture,
      [System.Globalization.DateTimeStyles]::AssumeUniversal,
      [ref]$parsedTimestamp
    )
  ) {
    return $parsedTimestamp.ToUnixTimeMilliseconds()
  }

  throw "Unsupported timestamp format in hook payload: '$stringValue'"
}

try {
  $rawInput = [Console]::In.ReadToEnd()
  if ([string]::IsNullOrWhiteSpace($rawInput)) {
    throw 'No input provided via stdin.'
  }

  $inputObj = $rawInput | ConvertFrom-Json

  $payloadTimestamp = $inputObj.timestamp
  $payloadCwd = $inputObj.cwd
  $rawPrompt = $inputObj.prompt

  if ([string]::IsNullOrWhiteSpace($rawPrompt)) {
    throw 'Expected the hook payload to include a non-empty prompt.'
  }

  # Optional example redaction. Adjust to match your organization’s needs.
  $redactedPrompt = $rawPrompt -replace 'ghp_[A-Za-z0-9]{20,}', '[REDACTED_TOKEN]'

  $logDir = '.github/hooks/logs'
  if (-not (Test-Path -LiteralPath $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
  }

  $logEntry = [ordered]@{
    sessionid = [string]$inputObj.session_id
    timestamp = (Get-Date -Format 'o')
    timestampms = Resolve-TimestampMs -Value $payloadTimestamp
    username = [string]$env:USERNAME
    hostname = [string]$env:COMPUTERNAME
    shellversion = [string]$PSVersionTable.PSVersion
    event = 'userPromptSubmitted'
    hookeventname = [string]$inputObj.hook_event_name
    transcript = [string]$inputObj.transcript_path
    prompt = $redactedPrompt
  } | ConvertTo-Json -Compress

  Add-Content -Path (Join-Path -Path $logDir -ChildPath 'audit.jsonl') -Value $logEntry -Encoding utf8
  Write-Host 'Success: Prompt logged.'
  exit 0
} catch {
  Write-Error $_
  Write-Host "Failure: $($_.Exception.Message)"
  exit 1
}
