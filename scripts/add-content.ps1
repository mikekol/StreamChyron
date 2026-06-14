# Chyron API demo — add content to the ticker
# Usage: .\scripts\add-content.ps1 [-Server http://pi-ip:3000]

param(
    [string]$Server = "http://localhost:3000"
)

$ConfigUrl = "$Server/config.json"
$UpdateUrl = "$Server/config"

function Get-Config {
    Invoke-RestMethod -Uri $ConfigUrl -Method Get
}

function Set-Config($config) {
    Invoke-RestMethod -Uri $UpdateUrl -Method Put -ContentType "application/json" -Body ($config | ConvertTo-Json -Depth 10)
}

function Add-TextItem($laneId, $content) {
    $config = Get-Config
    $lane = $config.lanes | Where-Object { $_.id -eq $laneId }
    if (-not $lane) { Write-Error "Lane '$laneId' not found"; return }

    $lane.items += [pscustomobject]@{ type = "text"; content = $content }
    $result = Set-Config $config
    Write-Host "Added text item to lane '$laneId': $content" -ForegroundColor Green
    $result
}

function Add-BreakingItem($laneId, $label, $content) {
    $config = Get-Config
    $lane = $config.lanes | Where-Object { $_.id -eq $laneId }
    if (-not $lane) { Write-Error "Lane '$laneId' not found"; return }

    $lane.items += [pscustomobject]@{ type = "breaking"; label = $label; content = $content }
    $result = Set-Config $config
    Write-Host "Added breaking item to lane '$laneId': [$label] $content" -ForegroundColor Yellow
    $result
}

function Set-Theme($theme) {
    $config = Get-Config
    $config.theme = $theme
    $result = Set-Config $config
    Write-Host "Theme changed to '$theme'" -ForegroundColor Cyan
    $result
}

function Clear-Lane($laneId) {
    $config = Get-Config
    $lane = $config.lanes | Where-Object { $_.id -eq $laneId }
    if (-not $lane) { Write-Error "Lane '$laneId' not found"; return }

    $lane.items = @()
    $result = Set-Config $config
    Write-Host "Cleared all items from lane '$laneId'" -ForegroundColor Red
    $result
}

function Show-Config {
    $config = Get-Config
    Write-Host "`nCurrent config:" -ForegroundColor White
    Write-Host "  Theme : $($config.theme)"
    foreach ($lane in $config.lanes) {
        Write-Host "  Lane  : $($lane.id) ($($lane.position)) — $($lane.items.Count) item(s)"
        foreach ($item in $lane.items) {
            if ($item.type -eq "breaking") {
                Write-Host "    [$($item.label)] $($item.content)" -ForegroundColor Yellow
            } else {
                Write-Host "    $($item.content)" -ForegroundColor Gray
            }
        }
    }
    Write-Host ""
}

# --- Demo ---

Write-Host "Chyron API Demo — $Server`n" -ForegroundColor Magenta

Show-Config

Write-Host "Step 1: Add a text item" -ForegroundColor White
Add-TextItem -laneId "main" -content "PowerShell just updated this ticker live!" | Out-Null

Write-Host "`nStep 2: Add a breaking news item" -ForegroundColor White
Add-BreakingItem -laneId "main" -label "ALERT" -content "Demo script is running" | Out-Null

Write-Host "`nStep 3: Switch theme" -ForegroundColor White
Set-Theme -theme "broadcast" | Out-Null

Write-Host "`nStep 4: Show updated config" -ForegroundColor White
Show-Config

Write-Host "Done. The chyron will update within 2 seconds." -ForegroundColor Green
