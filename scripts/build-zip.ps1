# build-zip.ps1 — 使用 Halo 官方 theme-package CLI 打包主题
# 产出在 dist/ 目录

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

Write-Host "=== Building & packaging with official Halo theme-package CLI ===" -ForegroundColor Cyan
Push-Location $root

# npm run build = tsc && vite build && theme-package
npm run build

if ($LASTEXITCODE -ne 0) { Pop-Location; throw "Build failed!" }
Pop-Location

Write-Host ""
Write-Host "=== Output in dist/ ===" -ForegroundColor Green
Get-ChildItem (Join-Path $root "dist") | ForEach-Object {
  $size = [math]::Round($_.Length / 1KB, 1)
  Write-Host "  $($_.Name) ($size KB)" -ForegroundColor Green
}
