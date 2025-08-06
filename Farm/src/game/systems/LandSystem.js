// 土地与设施系统
export class LandSystem {
  constructor() {
    // 根据设计文档：1201亩土地，34个地块，16个大棚
    this.totalLand = 1201 // 总亩数
    this.plots = [] // 34个地块
    this.greenhouses = [] // 16个大棚
    
    this.initializePlots()
    this.initializeGreenhouses()
  }

  init() {
    console.log('🏞️ 土地系统初始化...')
    this.generatePlotLayout()
  }

  initializePlots() {
    // 创建34个不同大小的地块
    for (let i = 0; i < 34; i++) {
      const plotSize = Math.floor(Math.random() * 50) + 20 // 20-70亩随机大小
      this.plots.push({
        id: i,
        size: plotSize,
        type: this.getRandomPlotType(),
        currentCrop: null,
        lastCrop: null,
        soilQuality: Math.random() * 0.3 + 0.7, // 0.7-1.0土壤质量
        position: { x: 0, y: 0 }, // 将在generatePlotLayout中设置
        isOccupied: false,
        lastLegumeYear: null // 记录上次种植豆类的年份
      })
    }
  }

  initializeGreenhouses() {
    // 创建16个大棚：10个普通大棚，6个智慧大棚
    for (let i = 0; i < 16; i++) {
      const isSmartGreenhouse = i >= 10 // 后6个是智慧大棚
      this.greenhouses.push({
        id: i,
        type: isSmartGreenhouse ? 'smart' : 'regular',
        size: 0.6, // 每个大棚0.6亩
        currentCrop: null,
        efficiency: isSmartGreenhouse ? 1.5 : 1.2, // 智慧大棚效率更高
        allowedCrops: isSmartGreenhouse ? ['vegetables'] : ['vegetables', 'grains'],
        position: { x: 0, y: 0 },
        maintenanceCost: isSmartGreenhouse ? 2000 : 1000 // 年维护成本
      })
    }
  }

  getRandomPlotType() {
    const types = ['plain', 'field', 'hill', 'wetland']
    const weights = [0.4, 0.3, 0.2, 0.1] // 平原地最多
    
    const random = Math.random()
    let cumulative = 0
    
    for (let i = 0; i < types.length; i++) {
      cumulative += weights[i]
      if (random < cumulative) {
        return types[i]
      }
    }
    return 'plain'
  }

  generatePlotLayout() {
    // 在800x600画布上生成地块布局
    const canvasWidth = 800
    const canvasHeight = 600
    const margin = 50
    
    // 使用网格布局
    const cols = 6
    const rows = 6
    const cellWidth = (canvasWidth - margin * 2) / cols
    const cellHeight = (canvasHeight - margin * 2) / rows
    
    // 布置34个地块
    for (let i = 0; i < this.plots.length; i++) {
      const col = i % cols
      const row = Math.floor(i / cols)
      
      this.plots[i].position = {
        x: margin + col * cellWidth + Math.random() * 20 - 10, // 添加一些随机偏移
        y: margin + row * cellHeight + Math.random() * 20 - 10,
        width: cellWidth * 0.8,
        height: cellHeight * 0.8
      }
    }
    
    // 布置16个大棚在右侧
    for (let i = 0; i < this.greenhouses.length; i++) {
      const col = i % 2
      const row = Math.floor(i / 2)
      
      this.greenhouses[i].position = {
        x: canvasWidth - 150 + col * 60,
        y: 50 + row * 35,
        width: 50,
        height: 30
      }
    }
  }

  // 检查地块是否可以种植指定作物
  canPlantCrop(plotId, cropType) {
    const plot = this.plots[plotId]
    if (!plot || plot.isOccupied) return false
    
    // 检查轮作限制：同一地块不能连续种植相同作物族
    if (plot.lastCrop && this.getCropFamily(plot.lastCrop) === this.getCropFamily(cropType)) {
      return false
    }
    
    // 检查地块类型适合性
    return this.isPlotSuitableForCrop(plot.type, cropType)
  }

  // 检查豆类轮种要求
  needsLegumeRotation(plotId, currentYear) {
    const plot = this.plots[plotId]
    if (!plot.lastLegumeYear) return true // 从未种过豆类
    
    return (currentYear - plot.lastLegumeYear) >= 3 // 3年内必须种一次豆类
  }

  getCropFamily(cropType) {
    const families = {
      'wheat': 'grains',
      'corn': 'grains', 
      'rice': 'grains',
      'soybean': 'legumes',
      'cabbage': 'vegetables',
      'carrot': 'vegetables',
      'tomato': 'vegetables'
    }
    return families[cropType] || 'other'
  }

  isPlotSuitableForCrop(plotType, cropType) {
    const suitability = {
      'plain': ['wheat', 'corn', 'soybean', 'cabbage'],
      'field': ['wheat', 'corn', 'soybean'],
      'hill': ['wheat', 'soybean'],
      'wetland': ['rice', 'cabbage']
    }
    return suitability[plotType]?.includes(cropType) || false
  }

  // 种植作物到指定地块
  plantCrop(plotId, cropType, currentYear) {
    if (!this.canPlantCrop(plotId, cropType)) return false
    
    const plot = this.plots[plotId]
    plot.currentCrop = cropType
    plot.isOccupied = true
    
    // 如果是豆类，更新豆类种植年份
    if (this.getCropFamily(cropType) === 'legumes') {
      plot.lastLegumeYear = currentYear
    }
    
    return true
  }

  // 收获作物
  harvestCrop(plotId) {
    const plot = this.plots[plotId]
    if (!plot.currentCrop) return null
    
    const harvestedCrop = plot.currentCrop
    const yield = this.calculateYield(plot)
    
    // 更新地块状态
    plot.lastCrop = plot.currentCrop
    plot.currentCrop = null
    plot.isOccupied = false
    
    return {
      crop: harvestedCrop,
      yield: yield,
      plotSize: plot.size
    }
  }

  calculateYield(plot) {
    // 基础产量乘以土壤质量和地块大小
    const baseCropYields = {
      'wheat': 800,   // 公斤/亩
      'corn': 1000,
      'rice': 900,
      'soybean': 300,
      'cabbage': 5000,
      'carrot': 4000,
      'tomato': 6000
    }
    
    const baseYield = baseCropYields[plot.currentCrop] || 500
    return Math.floor(baseYield * plot.soilQuality * plot.size)
  }

  update(deltaTime) {
    // 更新土地状态，处理作物生长等
  }

  getState() {
    return {
      totalLand: this.totalLand,
      plots: this.plots,
      greenhouses: this.greenhouses,
      availablePlots: this.plots.filter(p => !p.isOccupied).length
    }
  }

  getFacilityData() {
    return {
      plots: this.plots.length,
      greenhouses: this.greenhouses.length,
      occupiedPlots: this.plots.filter(p => p.isOccupied).length
    }
  }

  // 获取地块信息用于UI显示
  getPlotInfo(plotId) {
    const plot = this.plots[plotId]
    if (!plot) return null
    
    return {
      id: plot.id,
      size: plot.size,
      type: plot.type,
      currentCrop: plot.currentCrop,
      lastCrop: plot.lastCrop,
      soilQuality: Math.round(plot.soilQuality * 100),
      isOccupied: plot.isOccupied,
      needsLegume: this.needsLegumeRotation(plotId, new Date().getFullYear())
    }
  }
}
