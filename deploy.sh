#!/bin/bash
# 天气预报对比工具 - GitHub Pages 部署脚本

echo "🌤️  天气预报对比工具 - GitHub Pages 部署"
echo "========================================"

# 检查是否安装了gh CLI
if ! command -v gh &> /dev/null; then
    echo "⚠️  GitHub CLI 未安装"
    echo "📝 请手动执行以下步骤："
    echo ""
    echo "1. 在GitHub上创建仓库："
    echo "   访问: https://github.com/new"
    echo "   仓库名: weather-compare"
    echo "   选择: Public"
    echo "   不勾选: Add a README file"
    echo ""
    echo "2. 运行以下命令："
    echo "   git remote add origin https://github.com/你的用户名/weather-compare.git"
    echo "   git push -u origin main"
    echo ""
    echo "3. 启用GitHub Pages："
    echo "   - 进入仓库 Settings → Pages"
    echo "   - Source 选择 'Deploy from a branch'"
    echo "   - Branch 选择 'main' 和 '(root)'"
    echo "   - 点击 Save"
    echo ""
    echo "4. 访问您的网站："
    echo "   https://你的用户名.github.io/weather-compare/"
    exit 1
fi

# 如果gh CLI可用，自动创建仓库
echo "✅ 检测到GitHub CLI"

# 创建仓库（如果不存在）
echo "📦 创建GitHub仓库..."
gh repo create weather-compare --public --description "天气预报对比工具 - 对比安达市和甘南县未来5天天气情况" || true

# 添加远程仓库
echo "🔗 添加远程仓库..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/$(gh api user --jq '.login')/weather-compare.git

# 推送代码
echo "🚀 推送代码到GitHub..."
git branch -M main
git push -u origin main

# 启用GitHub Pages
echo "⚙️  配置GitHub Pages..."
gh api repos/{owner}/repo/pages -X PUT -f source.branch=main -f source.path="/" || true

echo ""
echo "✅ 部署完成！"
echo "🌐 访问: https://$(gh api user --jq '.login').github.io/weather-compare/"
