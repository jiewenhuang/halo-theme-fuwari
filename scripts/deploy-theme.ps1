# deploy-theme.ps1 — 使用 docker cp 部署主题到本地 Docker Halo
# docker cp 能正确保留目录结构，不受 Windows bind-mount bug 影响
param(
  [Parameter(Mandatory = $true)]
  [string]$Source,

  [Parameter(Mandatory = $false)]
  [string]$Container = "halo",

  [Parameter(Mandatory = $false)]
  [string]$RemotePath = "/root/.halo2/themes/theme-fuwari"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Source = (Resolve-Path -LiteralPath $Source).Path
$tempDir = Join-Path $env:TEMP "theme-deploy-$(Get-Random)"

Write-Host "=== 1/3  Preparing files... ===" -ForegroundColor Cyan

# 创建临时目录，用 robocopy 复制保持结构
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

# 复制 templates/ 和 i18n/
robocopy (Join-Path $Source "templates") (Join-Path $tempDir "templates") /E /NFL /NDL /NJH /NJS /NC /NS /NP
robocopy (Join-Path $Source "i18n") (Join-Path $tempDir "i18n") /E /NFL /NDL /NJH /NJS /NC /NS /NP

# 复制根文件
@("LICENSE", "README.md", "settings.yaml", "theme.yaml") | ForEach-Object {
  $srcFile = Join-Path $Source $_
  if (Test-Path -LiteralPath $srcFile) {
    Copy-Item -LiteralPath $srcFile -Destination (Join-Path $tempDir $_) -Force
  }
}

Write-Host "=== 2/3  Deploying via docker cp... ===" -ForegroundColor Cyan

# 先删除容器内旧目录
docker exec $Container rm -rf $RemotePath
if ($LASTEXITCODE -ne 0) { throw "Failed to remove old theme in container" }

# 在容器内创建父目录
docker exec $Container mkdir -p $RemotePath
if ($LASTEXITCODE -ne 0) { throw "Failed to create theme dir in container" }

# 用 docker cp 复制整个临时目录的内容到容器
# docker cp src/. container:dst/ 会复制 src 目录的内容到 dst
docker cp "${tempDir}/." "${Container}:${RemotePath}/"
if ($LASTEXITCODE -ne 0) { throw "docker cp failed!" }

Write-Host "=== 3/3  Cleanup... ===" -ForegroundColor Cyan
Remove-Item $tempDir -Recurse -Force

# 验证容器内文件结构
Write-Host ""
Write-Host "=== Verifying container files: ===" -ForegroundColor Yellow
docker exec $Container find $RemotePath -type f | Select-Object -First 20
Write-Host ""
Write-Host "Theme deployed to container: $RemotePath" -ForegroundColor Green
Write-Host "NOTE: Using docker cp (no hot-reload). For dev, use 'pnpm dev' with Vite." -ForegroundColor DarkYellow
