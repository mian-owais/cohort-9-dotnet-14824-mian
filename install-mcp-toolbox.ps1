# install-mcp-toolbox.ps1
# This script downloads Go and compiles the Google MCP Toolbox from source.

$ErrorActionPreference = "Stop"

Write-Host "Downloading Go 1.22.4..."
Invoke-WebRequest -Uri "https://go.dev/dl/go1.22.4.windows-amd64.zip" -OutFile "go_install_manual.zip"

Write-Host "Extracting Go (this may take a few minutes)..."
Expand-Archive -Path "go_install_manual.zip" -DestinationPath "go_extracted_manual" -Force

Write-Host "Adding Go to PATH..."
$goBinPath = "$(Get-Location)\go_extracted_manual\go\bin"
$env:Path += ";$goBinPath"

Write-Host "Compiling Google MCP Toolbox..."
git clone https://github.com/googleapis/mcp-toolbox.git
Set-Location mcp-toolbox
go build -o ../mcp-toolbox.exe .
Set-Location ..

Write-Host "Installation Complete!"
Write-Host "You can find the toolbox binary at: $(Get-Location)\mcp-toolbox.exe"
Write-Host "Run it using: .\mcp-toolbox.exe --config tools.yaml"
