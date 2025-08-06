// 渲染器 - 负责游戏画面渲染
export class Renderer {
  constructor() {
    this.canvas = null
    this.ctx = null
    this.initialized = false
  }

  init() {
    this.canvas = document.getElementById('farm-canvas')
    if (!this.canvas) {
      console.error('找不到游戏画布!')
      return false
    }
    
    this.ctx = this.canvas.getContext('2d')
    this.initialized = true
    
    console.log('🎨 渲染器初始化完成')
    return true
  }

  render(landSystem, cropSystem) {
    if (!this.initialized || !this.ctx) return
    
    // 清空画布
    this.clearCanvas()
    
    // 绘制背景
    this.drawBackground()
    
    // 绘制地块
    this.drawPlots(landSystem, cropSystem)
    
    // 绘制大棚
    this.drawGreenhouses(landSystem)
    
    // 绘制UI覆盖层
    this.drawOverlay()
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  drawBackground() {
    // 绘制天空渐变背景
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height)
    gradient.addColorStop(0, '#87CEEB') // 天空蓝
    gradient.addColorStop(0.7, '#98FB98') // 浅绿色
    gradient.addColorStop(1, '#90EE90') // 淡绿色
    
    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    
    // 绘制一些装饰性的云朵
    this.drawClouds()
  }

  drawClouds() {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    
    // 绘制几朵简单的云
    const clouds = [
      { x: 100, y: 50, size: 30 },
      { x: 300, y: 80, size: 25 },
      { x: 600, y: 60, size: 35 }
    ]
    
    clouds.forEach(cloud => {
      this.drawCloud(cloud.x, cloud.y, cloud.size)
    })
  }

  drawCloud(x, y, size) {
    this.ctx.beginPath()
    this.ctx.arc(x, y, size, 0, Math.PI * 2)
    this.ctx.arc(x + size * 0.8, y, size * 0.8, 0, Math.PI * 2)
    this.ctx.arc(x + size * 1.6, y, size, 0, Math.PI * 2)
    this.ctx.arc(x + size * 0.8, y - size * 0.5, size * 0.6, 0, Math.PI * 2)
    this.ctx.fill()
  }

  drawPlots(landSystem, cropSystem) {
    landSystem.plots.forEach((plot, index) => {
      this.drawPlot(plot, index, cropSystem)
    })
  }

  drawPlot(plot, index, cropSystem) {
    const pos = plot.position
    
    // 选择地块颜色
    let fillColor = this.getPlotColor(plot.type)
    let strokeColor = '#654321' // 棕色边框
    
    // 如果有作物，调整颜色
    if (plot.currentCrop) {
      fillColor = this.getCropColor(plot.currentCrop)
    }
    
    // 绘制地块
    this.ctx.fillStyle = fillColor
    this.ctx.strokeStyle = strokeColor
    this.ctx.lineWidth = 2
    
    this.ctx.fillRect(pos.x, pos.y, pos.width, pos.height)
    this.ctx.strokeRect(pos.x, pos.y, pos.width, pos.height)
    
    // 绘制地块编号
    this.ctx.fillStyle = '#000'
    this.ctx.font = '12px Arial'
    this.ctx.textAlign = 'center'
    this.ctx.fillText(
      (index + 1).toString(),
      pos.x + pos.width / 2,
      pos.y + pos.height / 2
    )
    
    // 如果有作物，绘制作物图标
    if (plot.currentCrop) {
      this.drawCropIcon(plot, cropSystem)
    }
    
    // 绘制地块信息
    this.drawPlotInfo(plot, index)
  }

  getPlotColor(type) {
    const colors = {
      'plain': '#90EE90',    // 浅绿色 - 平原
      'field': '#DEB887',    // 浅黄色 - 耕田
      'hill': '#F4A460',     // 沙褐色 - 山坡
      'wetland': '#87CEEB'   // 天空蓝 - 水洼地
    }
    return colors[type] || '#90EE90'
  }

  getCropColor(cropType) {
    const colors = {
      'wheat': '#DAA520',    // 金黄色
      'corn': '#FFD700',     // 金色
      'rice': '#32CD32',     // 酸橙绿
      'soybean': '#228B22',  // 森林绿
      'cabbage': '#98FB98',  // 浅绿色
      'carrot': '#FF8C00',   // 深橙色
      'tomato': '#FF6347'    // 番茄色
    }
    return colors[cropType] || '#90EE90'
  }

  drawCropIcon(plot, cropSystem) {
    const pos = plot.position
    const plantingStatus = cropSystem.getPlantingStatus(plot.id)
    
    if (plantingStatus) {
      // 绘制作物图标
      this.ctx.font = '24px Arial'
      this.ctx.textAlign = 'center'
      this.ctx.fillText(
        plantingStatus.cropIcon,
        pos.x + pos.width / 2,
        pos.y + pos.height / 2 + 20
      )
      
      // 绘制生长进度条
      if (plantingStatus.growthStage < 100) {
        this.drawProgressBar(
          pos.x + 5,
          pos.y + pos.height - 15,
          pos.width - 10,
          8,
          plantingStatus.growthStage / 100
        )
      }
      
      // 如果可以收获，绘制提示
      if (plantingStatus.isReady) {
        this.ctx.fillStyle = '#FFD700'
        this.ctx.font = '16px Arial'
        this.ctx.fillText('✨', pos.x + pos.width - 15, pos.y + 15)
      }
    }
  }

  drawProgressBar(x, y, width, height, progress) {
    // 背景
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    this.ctx.fillRect(x, y, width, height)
    
    // 进度
    this.ctx.fillStyle = '#4CAF50'
    this.ctx.fillRect(x, y, width * progress, height)
    
    // 边框
    this.ctx.strokeStyle = '#333'
    this.ctx.lineWidth = 1
    this.ctx.strokeRect(x, y, width, height)
  }

  drawPlotInfo(plot, index) {
    const pos = plot.position
    
    // 绘制土壤质量指示器
    const qualityColor = this.getQualityColor(plot.soilQuality)
    this.ctx.fillStyle = qualityColor
    this.ctx.fillRect(pos.x + 2, pos.y + 2, 8, 8)
    
    // 绘制地块大小
    this.ctx.fillStyle = '#333'
    this.ctx.font = '10px Arial'
    this.ctx.textAlign = 'left'
    this.ctx.fillText(
      `${plot.size}亩`,
      pos.x + 2,
      pos.y + pos.height - 2
    )
  }

  getQualityColor(quality) {
    if (quality >= 0.9) return '#4CAF50' // 绿色 - 优秀
    if (quality >= 0.8) return '#8BC34A' // 浅绿 - 良好
    if (quality >= 0.7) return '#FFEB3B' // 黄色 - 一般
    return '#FF9800' // 橙色 - 较差
  }

  drawGreenhouses(landSystem) {
    landSystem.greenhouses.forEach((greenhouse, index) => {
      this.drawGreenhouse(greenhouse, index)
    })
  }

  drawGreenhouse(greenhouse, index) {
    const pos = greenhouse.position
    
    // 绘制大棚结构
    const isSmartGreenhouse = greenhouse.type === 'smart'
    this.ctx.fillStyle = isSmartGreenhouse ? '#E8F5E8' : '#F0F0F0'
    this.ctx.strokeStyle = isSmartGreenhouse ? '#4CAF50' : '#757575'
    this.ctx.lineWidth = 2
    
    // 绘制大棚主体
    this.ctx.fillRect(pos.x, pos.y, pos.width, pos.height)
    this.ctx.strokeRect(pos.x, pos.y, pos.width, pos.height)
    
    // 绘制大棚顶部弧形
    this.ctx.beginPath()
    this.ctx.arc(
      pos.x + pos.width / 2,
      pos.y,
      pos.width / 2,
      0,
      Math.PI,
      true
    )
    this.ctx.stroke()
    
    // 绘制大棚编号和类型
    this.ctx.fillStyle = '#000'
    this.ctx.font = '8px Arial'
    this.ctx.textAlign = 'center'
    this.ctx.fillText(
      `${index + 1}`,
      pos.x + pos.width / 2,
      pos.y + pos.height / 2
    )
    
    // 智慧大棚图标
    if (isSmartGreenhouse) {
      this.ctx.fillText('🤖', pos.x + pos.width / 2, pos.y + pos.height / 2 + 10)
    }
    
    // 如果有作物，显示作物
    if (greenhouse.currentCrop) {
      this.ctx.font = '12px Arial'
      const cropIcon = this.getCropIcon(greenhouse.currentCrop)
      this.ctx.fillText(cropIcon, pos.x + pos.width / 2, pos.y + pos.height - 5)
    }
  }

  getCropIcon(cropType) {
    const icons = {
      'wheat': '🌾',
      'corn': '🌽',
      'rice': '🌾',
      'soybean': '🫘',
      'cabbage': '🥬',
      'carrot': '🥕',
      'tomato': '🍅'
    }
    return icons[cropType] || '🌱'
  }

  drawOverlay() {
    // 绘制游戏信息覆盖层（如果需要）
    this.drawLegend()
  }

  drawLegend() {
    // 绘制图例
    const legendX = 10
    const legendY = this.canvas.height - 120
    
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    this.ctx.fillRect(legendX, legendY, 150, 110)
    this.ctx.strokeStyle = '#333'
    this.ctx.lineWidth = 1
    this.ctx.strokeRect(legendX, legendY, 150, 110)
    
    this.ctx.fillStyle = '#333'
    this.ctx.font = '12px Arial'
    this.ctx.textAlign = 'left'
    
    const legends = [
      { color: '#4CAF50', text: '优质土壤' },
      { color: '#8BC34A', text: '良好土壤' },
      { color: '#FFEB3B', text: '一般土壤' },
      { color: '#FF9800', text: '较差土壤' },
      { text: '✨ 可收获', offset: 0 }
    ]
    
    legends.forEach((legend, index) => {
      const y = legendY + 15 + index * 18
      
      if (legend.color) {
        this.ctx.fillStyle = legend.color
        this.ctx.fillRect(legendX + 5, y - 8, 12, 12)
      }
      
      this.ctx.fillStyle = '#333'
      this.ctx.fillText(legend.text, legendX + 22, y + 3)
    })
  }

  // 辅助方法：设置画布尺寸
  setCanvasSize(width, height) {
    if (this.canvas) {
      this.canvas.width = width
      this.canvas.height = height
    }
  }

  // 获取画布尺寸
  getCanvasSize() {
    return {
      width: this.canvas?.width || 0,
      height: this.canvas?.height || 0
    }
  }
}
