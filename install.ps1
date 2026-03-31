$repo = "Quicksi-CLI/quicksiCLI"
$url = "https://github.com/$repo/releases/latest/download/quicksi-win.exe"

$installDir = "$env:LOCALAPPDATA\Quicksi"
$output = "$installDir\quicksi.exe"

Write-Host "Installing Quicksi..."

New-Item -ItemType Directory -Force -Path $installDir | Out-Null

Invoke-RestMethod -Uri $url -OutFile $output

Write-Host "Installed to $output"

# Add to PATH if needed
$path = [Environment]::GetEnvironmentVariable("Path", "User")

if ($path -notlike "*$installDir*") {
    Write-Host "Adding Quicksi to PATH..."

    [Environment]::SetEnvironmentVariable(
        "Path",
        "$path;$installDir",
        "User"
    )

    Write-Host "PATH updated."
} else {
    Write-Host "Already in PATH."
}

Write-Host ""
Write-Host "⚠️ Restart your terminal to use 'quicksi'"
Write-Host "Or run this command now:"
Write-Host "  `$env:Path += ';$installDir'"
