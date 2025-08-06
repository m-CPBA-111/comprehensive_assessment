// 作物种植系统
export class CropSystem {
  constructor() {
    this.crops = this.initializeCrops()
    this.plantingSchedule = new Map() // 种植计划
    this.harvestData = [] // 收获数据
    this.currentSeason = 'spring' // 当前季节
  }

  init() {
    console.log('🌱 作物系统初始化...')
  }

  initializeCrops() {
    // 根据设计文档定义的作物类型
    return {
      // 粮食作物 - 适合每年种植一季
      'wheat': {
        name: '小麦',
        icon: '🌾',
        family: 'grains',
        season: ['spring', 'autumn'],
        growthPeriod: 120, // 天数
        basePrice: 2.5, // 元/公斤
        baseCost: 800, // 元/亩种植成本
        baseYield: 800, // 公斤/亩
        plotTypes: ['plain', 'field', 'hill'],
        marketDemand: 'stable'
      },
      'corn': {
        name: '玉米',
        icon: '🌽',
        family: 'grains',
        season: ['spring'],
        growthPeriod: 150,
        basePrice: 2.8,
        baseCost: 900,
        baseYield: 1000,
        plotTypes: ['plain', 'field'],
        marketDemand: 'growing'
      },
      'rice': {
        name: '水稻',
        icon: '🌾',
        family: 'grains',
        season: ['spring'],
        growthPeriod: 140,
        basePrice: 3.2,
        baseCost: 1200,
        baseYield: 900,
        plotTypes: ['wetland'],
        marketDemand: 'stable'
      },
      
      // 豆类作物 - 用于轮作
      'soybean': {
        name: '大豆',
        icon: '🫘',
        family: 'legumes',
        season: ['spring'],
        growthPeriod: 130,
        basePrice: 4.5,
        baseCost: 700,
        baseYield: 300,
        plotTypes: ['plain', 'field', 'hill'],
        marketDemand: 'volatile',
        rotationBenefit: true // 对土壤有益
      },
      
      // 蔬菜作物 - 适合大棚种植
      'cabbage': {
        name: '白菜',
        icon: '🥬',
        family: 'vegetables',
        season: ['spring', 'autumn'],
        growthPeriod: 80,
        basePrice: 1.2,
        baseCost: 1500,
        baseYield: 5000,
        plotTypes: ['plain', 'wetland'],
        greenhouseCompatible: true,
        marketDemand: 'seasonal'
      },
      'carrot': {
        name: '胡萝卜',
        icon: '🥕',
        family: 'vegetables',
        season: ['spring', 'autumn'],
        growthPeriod: 90,
        basePrice: 2.0,
        baseCost: 1800,
        baseYield: 4000,
        plotTypes: ['plain', 'field'],
        greenhouseCompatible: true,
        marketDemand: 'stable'
      },
      'tomato': {
        name: '番茄',
        icon: '🍅',
        family: 'vegetables',
        season: ['spring', 'summer'],
        growthPeriod: 120,
        basePrice: 3.5,
        baseCost: 2500,
        baseYield: 6000,
        plotTypes: ['plain'],
        greenhouseCompatible: true,
        marketDemand: 'growing'
      }
    }
  }

  // 获取可种植的作物列表
  getAvailableCrops(plotType, season = this.currentSeason, isGreenhouse = false) {
    const available = []
    
    for (const [key, crop] of Object.entries(this.crops)) {
      // 检查季节适合性
      if (!crop.season.includes(season)) continue
      
      // 检查地块类型适合性
      if (!isGreenhouse && !crop.plotTypes.includes(plotType)) continue
      
      // 检查大棚兼容性
      if (isGreenhouse && !crop.greenhouseCompatible) continue
      
      available.push({
        id: key,
        ...crop
      })
    }
    
    return available
  }

  // 计划种植作物
  planPlanting(plotId, cropType, plantingDate) {
    const crop = this.crops[cropType]
    if (!crop) return false
    
    const harvestDate = new Date(plantingDate)
    harvestDate.setDate(harvestDate.getDate() + crop.growthPeriod)
    
    this.plantingSchedule.set(plotId, {
      cropType,
      plantingDate,
      harvestDate,
      growthStage: 0, // 0-100%
      isReady: false
    })
    
    return true
  }

  // 更新作物生长
  updateCropGrowth(deltaTime) {
    const currentDate = new Date()
    
    for (const [plotId, planting] of this.plantingSchedule.entries()) {
      const daysPassed = Math.floor((currentDate - planting.plantingDate) / (1000 * 60 * 60 * 24))
      const crop = this.crops[planting.cropType]
      
      // 计算生长阶段
      planting.growthStage = Math.min(100, (daysPassed / crop.growthPeriod) * 100)
      
      // 检查是否可以收获
      if (currentDate >= planting.harvestDate && !planting.isReady) {
        planting.isReady = true
        console.log(`🌾 地块${plotId}的${crop.name}可以收获了！`)
      }
    }
  }

  // 收获作物
  harvestCrop(plotId, landSystem) {
    const planting = this.plantingSchedule.get(plotId)
    if (!planting || !planting.isReady) return null
    
    const crop = this.crops[planting.cropType]
    const plot = landSystem.plots[plotId]
    
    // 计算产量（考虑土壤质量、生长阶段等因素）
    const yieldMultiplier = (planting.growthStage / 100) * plot.soilQuality
    const totalYield = Math.floor(crop.baseYield * plot.size * yieldMultiplier)
    
    // 计算收益
    const revenue = totalYield * crop.basePrice
    const cost = crop.baseCost * plot.size
    const profit = revenue - cost
    
    // 记录收获数据
    const harvestRecord = {
      plotId,
      cropType: planting.cropType,
      cropName: crop.name,
      yield: totalYield,
      revenue,
      cost,
      profit,
      harvestDate: new Date(),
      plotSize: plot.size
    }
    
    this.harvestData.push(harvestRecord)
    
    // 清除种植计划
    this.plantingSchedule.delete(plotId)
    
    return harvestRecord
  }

  // 计算种植成本
  calculatePlantingCost(cropType, plotSize) {
    const crop = this.crops[cropType]
    if (!crop) return 0
    
    return crop.baseCost * plotSize
  }

  // 预测收益
  predictRevenue(cropType, plotSize, soilQuality = 1.0) {
    const crop = this.crops[cropType]
    if (!crop) return null
    
    const expectedYield = crop.baseYield * plotSize * soilQuality
    const expectedRevenue = expectedYield * crop.basePrice
    const cost = crop.baseCost * plotSize
    const expectedProfit = expectedRevenue - cost
    
    return {
      crop: crop.name,
      yield: expectedYield,
      revenue: expectedRevenue,
      cost,
      profit: expectedProfit,
      profitMargin: ((expectedProfit / expectedRevenue) * 100).toFixed(1)
    }
  }

  // 获取作物详细信息
  getCropDetails(cropType) {
    const crop = this.crops[cropType]
    if (!crop) return null
    
    return {
      ...crop,
      id: cropType
    }
  }

  // 获取当前种植状态
  getPlantingStatus(plotId) {
    const planting = this.plantingSchedule.get(plotId)
    if (!planting) return null
    
    const crop = this.crops[planting.cropType]
    const daysRemaining = Math.max(0, Math.ceil((planting.harvestDate - new Date()) / (1000 * 60 * 60 * 24)))
    
    return {
      cropName: crop.name,
      cropIcon: crop.icon,
      growthStage: planting.growthStage,
      daysRemaining,
      isReady: planting.isReady,
      plantingDate: planting.plantingDate,
      harvestDate: planting.harvestDate
    }
  }

  // 检查轮作需求
  checkRotationRequirements(plotId, landSystem, currentYear) {
    const plot = landSystem.plots[plotId]
    if (!plot) return { valid: false, reason: '无效地块' }
    
    // 检查豆类轮种要求
    if (landSystem.needsLegumeRotation(plotId, currentYear)) {
      const availableLegumes = this.getAvailableCrops(plot.type).filter(c => c.family === 'legumes')
      if (availableLegumes.length > 0) {
        return {
          valid: false,
          reason: '需要种植豆类作物进行轮作',
          recommendedCrops: availableLegumes
        }
      }
    }
    
    return { valid: true }
  }

  update(deltaTime) {
    this.updateCropGrowth(deltaTime)
  }

  getState() {
    return {
      crops: this.crops,
      plantingSchedule: Array.from(this.plantingSchedule.entries()),
      harvestData: this.harvestData,
      currentSeason: this.currentSeason
    }
  }

  getHarvestData() {
    return this.harvestData
  }

  resetForNewYear() {
    // 新年重置（保留历史数据）
    this.currentSeason = 'spring'
    // 可以在这里添加其他年度重置逻辑
  }

  // 获取年度总结数据
  getYearlySummary() {
    const currentYear = new Date().getFullYear()
    const yearlyHarvests = this.harvestData.filter(h => 
      h.harvestDate.getFullYear() === currentYear
    )
    
    const totalRevenue = yearlyHarvests.reduce((sum, h) => sum + h.revenue, 0)
    const totalCost = yearlyHarvests.reduce((sum, h) => sum + h.cost, 0)
    const totalProfit = totalRevenue - totalCost
    const totalYield = yearlyHarvests.reduce((sum, h) => sum + h.yield, 0)
    
    // 按作物分类统计
    const cropStats = {}
    yearlyHarvests.forEach(h => {
      if (!cropStats[h.cropType]) {
        cropStats[h.cropType] = {
          name: h.cropName,
          count: 0,
          yield: 0,
          revenue: 0,
          cost: 0,
          profit: 0
        }
      }
      
      const stats = cropStats[h.cropType]
      stats.count++
      stats.yield += h.yield
      stats.revenue += h.revenue
      stats.cost += h.cost
      stats.profit += h.profit
    })
    
    return {
      totalHarvests: yearlyHarvests.length,
      totalRevenue,
      totalCost,
      totalProfit,
      totalYield,
      profitMargin: totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0,
      cropStats
    }
  }
}
