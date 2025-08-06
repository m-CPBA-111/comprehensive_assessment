// 经济系统 - 处理市场价格、销售模式、收益计算
export class EconomicSystem {
  constructor() {
    this.marketPrices = this.initializeMarketPrices()
    this.priceHistory = new Map() // 价格历史记录
    this.salesModes = {
      direct: { name: '直销模式', multiplier: 1.0, description: '按预期销售量的部分进行销售' },
      discount: { name: '降价出售', multiplier: 0.5, description: '超出预期销售量的部分按2023年销售价格的50%降价出售' }
    }
    this.annualReports = []
  }

  init() {
    console.log('💰 经济系统初始化...')
    this.initializePriceHistory()
  }

  initializeMarketPrices() {
    // 基于设计文档的价格设置
    return {
      'wheat': {
        basePrice: 2.5,
        currentPrice: 2.5,
        priceGrowth: 0.075, // 年增长5-10%，取中间值7.5%
        volatility: 0.05, // 波动性较小
        demand: 'stable'
      },
      'corn': {
        basePrice: 2.8,
        currentPrice: 2.8,
        priceGrowth: 0.05, // 其他农作物±5%变化
        volatility: 0.1,
        demand: 'growing'
      },
      'rice': {
        basePrice: 3.2,
        currentPrice: 3.2,
        priceGrowth: 0.05,
        volatility: 0.08,
        demand: 'stable'
      },
      'soybean': {
        basePrice: 4.5,
        currentPrice: 4.5,
        priceGrowth: 0.05,
        volatility: 0.15, // 豆类价格波动较大
        demand: 'volatile'
      },
      'cabbage': {
        basePrice: 1.2,
        currentPrice: 1.2,
        priceGrowth: 0.05,
        volatility: 0.2, // 蔬菜价格波动大
        demand: 'seasonal'
      },
      'carrot': {
        basePrice: 2.0,
        currentPrice: 2.0,
        priceGrowth: 0.05,
        volatility: 0.18,
        demand: 'stable'
      },
      'tomato': {
        basePrice: 3.5,
        currentPrice: 3.5,
        priceGrowth: 0.05,
        volatility: 0.25,
        demand: 'seasonal'
      }
    }
  }

  initializePriceHistory() {
    // 初始化2023年价格历史作为基准
    const baseYear = 2023
    for (const [crop, priceData] of Object.entries(this.marketPrices)) {
      if (!this.priceHistory.has(crop)) {
        this.priceHistory.set(crop, new Map())
      }
      this.priceHistory.get(crop).set(baseYear, priceData.basePrice)
    }
  }

  // 更新年度价格
  updateYearlyPrices(year) {
    for (const [crop, priceData] of Object.entries(this.marketPrices)) {
      let newPrice = priceData.currentPrice
      
      if (crop === 'wheat') {
        // 小麦价格按5-10%增长
        const growthRate = 0.05 + Math.random() * 0.05 // 5-10%
        newPrice *= (1 + growthRate)
      } else {
        // 其他作物±5%变化
        const changeRate = (Math.random() - 0.5) * 0.1 // -5% to +5%
        newPrice *= (1 + changeRate)
      }
      
      // 应用随机波动
      const volatilityFactor = (Math.random() - 0.5) * priceData.volatility
      newPrice *= (1 + volatilityFactor)
      
      // 确保价格不会过低
      newPrice = Math.max(newPrice, priceData.basePrice * 0.3)
      
      priceData.currentPrice = Math.round(newPrice * 100) / 100
      
      // 记录价格历史
      this.priceHistory.get(crop).set(year, priceData.currentPrice)
    }
  }

  // 计算销售收益
  calculateSalesRevenue(harvestData, expectedSales = {}) {
    let totalRevenue = 0
    const salesBreakdown = {}
    
    harvestData.forEach(harvest => {
      const crop = harvest.cropType
      const yield = harvest.yield
      const currentPrice = this.marketPrices[crop].currentPrice
      
      // 获取预期销售量（如果没有设置，假设70%直销，30%降价）
      const expectedDirect = expectedSales[crop]?.direct || yield * 0.7
      const directSales = Math.min(yield, expectedDirect)
      const discountSales = Math.max(0, yield - directSales)
      
      // 计算收益
      const directRevenue = directSales * currentPrice * this.salesModes.direct.multiplier
      const discountRevenue = discountSales * currentPrice * this.salesModes.discount.multiplier
      const totalCropRevenue = directRevenue + discountRevenue
      
      totalRevenue += totalCropRevenue
      
      salesBreakdown[crop] = {
        yield,
        directSales,
        discountSales,
        directRevenue,
        discountRevenue,
        totalRevenue: totalCropRevenue,
        averagePrice: totalCropRevenue / yield
      }
    })
    
    return {
      totalRevenue,
      salesBreakdown
    }
  }

  // 计算年度财务报告
  calculateYearlyReport(harvestData, facilityData) {
    const year = new Date().getFullYear()
    const salesResult = this.calculateSalesRevenue(harvestData)
    
    // 计算总成本
    const productionCosts = harvestData.reduce((sum, h) => sum + h.cost, 0)
    const facilityCosts = this.calculateFacilityCosts(facilityData)
    const totalCosts = productionCosts + facilityCosts
    
    // 计算利润
    const grossProfit = salesResult.totalRevenue - productionCosts
    const netProfit = salesResult.totalRevenue - totalCosts
    
    // 计算各种指标
    const profitMargin = salesResult.totalRevenue > 0 ? 
      ((netProfit / salesResult.totalRevenue) * 100).toFixed(1) : 0
    
    const report = {
      year,
      revenue: salesResult.totalRevenue,
      costs: {
        production: productionCosts,
        facilities: facilityCosts,
        total: totalCosts
      },
      profit: {
        gross: grossProfit,
        net: netProfit,
        margin: profitMargin
      },
      salesBreakdown: salesResult.salesBreakdown,
      metrics: {
        totalYield: harvestData.reduce((sum, h) => sum + h.yield, 0),
        averageYieldPerPlot: harvestData.length > 0 ? 
          harvestData.reduce((sum, h) => sum + h.yield, 0) / harvestData.length : 0,
        activePlots: harvestData.length,
        revenuePerPlot: harvestData.length > 0 ? 
          salesResult.totalRevenue / harvestData.length : 0
      }
    }
    
    this.annualReports.push(report)
    return report
  }

  // 计算设施维护成本
  calculateFacilityCosts(facilityData) {
    // 大棚维护成本：普通大棚1000元/年，智慧大棚2000元/年
    const greenhouseCosts = facilityData.greenhouses || 0
    return greenhouseCosts * 1500 // 平均维护成本
  }

  // 获取市场预测
  getMarketForecast(crop, yearsAhead = 3) {
    const currentPrice = this.marketPrices[crop].currentPrice
    const priceData = this.marketPrices[crop]
    const forecast = []
    
    let price = currentPrice
    for (let i = 1; i <= yearsAhead; i++) {
      if (crop === 'wheat') {
        price *= (1 + 0.075) // 小麦7.5%年增长
      } else {
        price *= (1 + (Math.random() - 0.5) * 0.1) // ±5%变化
      }
      
      forecast.push({
        year: new Date().getFullYear() + i,
        predictedPrice: Math.round(price * 100) / 100,
        confidence: Math.max(0.3, 1 - (i * 0.2)) // 预测置信度递减
      })
    }
    
    return forecast
  }

  // 获取价格历史数据
  getPriceHistory(crop, years = 5) {
    const cropHistory = this.priceHistory.get(crop)
    if (!cropHistory) return []
    
    const currentYear = new Date().getFullYear()
    const history = []
    
    for (let i = years - 1; i >= 0; i--) {
      const year = currentYear - i
      const price = cropHistory.get(year)
      if (price !== undefined) {
        history.push({ year, price })
      }
    }
    
    return history
  }

  // 获取当前市场状况
  getMarketStatus() {
    const status = {}
    
    for (const [crop, priceData] of Object.entries(this.marketPrices)) {
      const priceChange = this.calculatePriceChange(crop)
      
      status[crop] = {
        name: this.getCropName(crop),
        currentPrice: priceData.currentPrice,
        priceChange,
        trend: priceChange > 0.05 ? 'rising' : priceChange < -0.05 ? 'falling' : 'stable',
        demand: priceData.demand,
        volatility: priceData.volatility
      }
    }
    
    return status
  }

  calculatePriceChange(crop) {
    const history = this.priceHistory.get(crop)
    if (!history || history.size < 2) return 0
    
    const years = Array.from(history.keys()).sort()
    const lastYear = years[years.length - 1]
    const prevYear = years[years.length - 2]
    
    const currentPrice = history.get(lastYear)
    const previousPrice = history.get(prevYear)
    
    return ((currentPrice - previousPrice) / previousPrice)
  }

  getCropName(crop) {
    const names = {
      'wheat': '小麦',
      'corn': '玉米',
      'rice': '水稻',
      'soybean': '大豆',
      'cabbage': '白菜',
      'carrot': '胡萝卜',
      'tomato': '番茄'
    }
    return names[crop] || crop
  }

  // 计算最终得分（游戏结束时）
  calculateFinalScore() {
    if (this.annualReports.length === 0) return 0
    
    const totalProfit = this.annualReports.reduce((sum, report) => sum + report.profit.net, 0)
    const averageMargin = this.annualReports.reduce((sum, report) => 
      sum + parseFloat(report.profit.margin), 0) / this.annualReports.length
    
    // 综合得分：总利润 + 平均利润率加成
    const baseScore = Math.max(0, totalProfit)
    const marginBonus = averageMargin > 20 ? baseScore * 0.2 : 0
    
    return Math.round(baseScore + marginBonus)
  }

  update(deltaTime) {
    // 可以在这里添加实时价格波动逻辑
  }

  getState() {
    return {
      marketPrices: this.marketPrices,
      salesModes: this.salesModes,
      annualReports: this.annualReports,
      priceHistory: Object.fromEntries(
        Array.from(this.priceHistory.entries()).map(([crop, history]) => [
          crop,
          Object.fromEntries(history.entries())
        ])
      )
    }
  }
}
