// 随机事件与风险系统
export class RandomEventSystem {
  constructor() {
    this.events = this.initializeEvents()
    this.activeEvents = []
    this.eventHistory = []
    this.weatherConditions = {
      current: 'normal',
      forecast: []
    }
  }

  init() {
    console.log('🎲 随机事件系统初始化...')
    this.generateWeatherForecast()
  }

  initializeEvents() {
    return {
      // 价格波动事件
      priceFluctuation: {
        name: '市场价格波动',
        description: '受市场供需影响，作物价格发生变化',
        probability: 0.3,
        effects: {
          priceMultiplier: { min: 0.8, max: 1.3 },
          duration: { min: 1, max: 3 } // 影响季度数
        },
        icon: '📈'
      },
      
      // 天气事件
      drought: {
        name: '干旱',
        description: '持续干旱影响作物产量，特别是水稻',
        probability: 0.15,
        effects: {
          yieldMultiplier: { min: 0.6, max: 0.8 },
          affectedCrops: ['rice', 'cabbage'],
          duration: { min: 1, max: 2 }
        },
        icon: '☀️'
      },
      
      flood: {
        name: '洪涝',
        description: '暴雨洪涝导致部分地块减产',
        probability: 0.12,
        effects: {
          yieldMultiplier: { min: 0.5, max: 0.7 },
          affectedCrops: ['wheat', 'corn', 'soybean'],
          duration: { min: 1, max: 1 }
        },
        icon: '🌊'
      },
      
      heatWave: {
        name: '高温热浪',
        description: '异常高温影响蔬菜作物生长',
        probability: 0.1,
        effects: {
          yieldMultiplier: { min: 0.7, max: 0.9 },
          affectedCrops: ['cabbage', 'carrot', 'tomato'],
          duration: { min: 1, max: 1 }
        },
        icon: '🔥'
      },
      
      // 市场事件
      demandSurge: {
        name: '需求激增',
        description: '某种作物需求突然增加，价格上涨',
        probability: 0.2,
        effects: {
          priceMultiplier: { min: 1.2, max: 1.8 },
          targetCrop: 'random',
          duration: { min: 2, max: 4 }
        },
        icon: '📊'
      },
      
      marketCrash: {
        name: '市场崩盘',
        description: '特定作物市场供过于求，价格暴跌',
        probability: 0.08,
        effects: {
          priceMultiplier: { min: 0.3, max: 0.6 },
          targetCrop: 'random',
          duration: { min: 1, max: 2 }
        },
        icon: '📉'
      },
      
      // 成本事件
      fuelPriceRise: {
        name: '燃料价格上涨',
        description: '油价上涨导致农机成本增加',
        probability: 0.25,
        effects: {
          costMultiplier: { min: 1.1, max: 1.3 },
          duration: { min: 2, max: 6 }
        },
        icon: '⛽'
      },
      
      fertilizerShortage: {
        name: '化肥短缺',
        description: '化肥供应不足，种植成本上升',
        probability: 0.15,
        effects: {
          costMultiplier: { min: 1.15, max: 1.4 },
          yieldMultiplier: { min: 0.9, max: 0.95 },
          duration: { min: 1, max: 3 }
        },
        icon: '🧪'
      },
      
      // 正面事件
      governmentSubsidy: {
        name: '政府补贴',
        description: '政府发放农业补贴，降低种植成本',
        probability: 0.12,
        effects: {
          costMultiplier: { min: 0.7, max: 0.9 },
          targetCrop: 'grains', // 主要补贴粮食作物
          duration: { min: 1, max: 2 }
        },
        icon: '🏛️'
      },
      
      newTechnology: {
        name: '新技术推广',
        description: '农业新技术提高作物产量',
        probability: 0.1,
        effects: {
          yieldMultiplier: { min: 1.1, max: 1.25 },
          costMultiplier: { min: 0.95, max: 1.0 },
          duration: { min: 3, max: 12 } // 技术影响持续时间长
        },
        icon: '🔬'
      },
      
      organicTrend: {
        name: '有机农产品热潮',
        description: '消费者偏好有机产品，价格上涨',
        probability: 0.08,
        effects: {
          priceMultiplier: { min: 1.3, max: 1.6 },
          affectedCrops: ['vegetables'],
          duration: { min: 4, max: 8 }
        },
        icon: '🌿'
      }
    }
  }

  // 触发年度随机事件
  triggerYearlyEvents() {
    const currentYear = new Date().getFullYear()
    console.log(`🎲 ${currentYear}年随机事件检查...`)
    
    // 清除过期事件
    this.cleanupExpiredEvents()
    
    // 检查每个事件是否触发
    for (const [eventId, event] of Object.entries(this.events)) {
      if (Math.random() < event.probability) {
        this.triggerEvent(eventId, event)
      }
    }
    
    // 生成新的天气预报
    this.generateWeatherForecast()
  }

  triggerEvent(eventId, eventData) {
    const activeEvent = {
      id: eventId,
      name: eventData.name,
      description: eventData.description,
      icon: eventData.icon,
      startYear: new Date().getFullYear(),
      effects: this.generateEventEffects(eventData.effects),
      remainingDuration: this.getRandomInRange(eventData.effects.duration)
    }
    
    this.activeEvents.push(activeEvent)
    this.eventHistory.push({
      ...activeEvent,
      triggeredAt: new Date()
    })
    
    console.log(`🎯 触发事件: ${activeEvent.name}`)
    return activeEvent
  }

  generateEventEffects(effectsTemplate) {
    const effects = {}
    
    for (const [key, value] of Object.entries(effectsTemplate)) {
      if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
        effects[key] = this.getRandomInRange(value)
      } else if (value === 'random') {
        // 随机选择作物
        const crops = ['wheat', 'corn', 'rice', 'soybean', 'cabbage', 'carrot', 'tomato']
        effects[key] = crops[Math.floor(Math.random() * crops.length)]
      } else if (value === 'grains') {
        effects[key] = ['wheat', 'corn', 'rice']
      } else if (value === 'vegetables') {
        effects[key] = ['cabbage', 'carrot', 'tomato']
      } else {
        effects[key] = value
      }
    }
    
    return effects
  }

  getRandomInRange(range) {
    if (typeof range === 'object' && range.min !== undefined && range.max !== undefined) {
      return range.min + Math.random() * (range.max - range.min)
    }
    return range
  }

  // 清理过期事件
  cleanupExpiredEvents() {
    this.activeEvents = this.activeEvents.filter(event => {
      event.remainingDuration--
      return event.remainingDuration > 0
    })
  }

  // 生成天气预报
  generateWeatherForecast() {
    const weatherTypes = ['sunny', 'cloudy', 'rainy', 'stormy']
    const weights = [0.4, 0.3, 0.2, 0.1]
    
    this.weatherConditions.forecast = []
    
    for (let i = 0; i < 7; i++) { // 7天预报
      let weather = 'sunny'
      const random = Math.random()
      let cumulative = 0
      
      for (let j = 0; j < weights.length; j++) {
        cumulative += weights[j]
        if (random < cumulative) {
          weather = weatherTypes[j]
          break
        }
      }
      
      this.weatherConditions.forecast.push({
        day: i + 1,
        weather,
        temperature: Math.floor(Math.random() * 15) + 15, // 15-30度
        humidity: Math.floor(Math.random() * 40) + 40 // 40-80%
      })
    }
  }

  // 获取当前活跃事件对作物的影响
  getEventEffectsForCrop(cropType) {
    let yieldMultiplier = 1.0
    let priceMultiplier = 1.0
    let costMultiplier = 1.0
    
    this.activeEvents.forEach(event => {
      const effects = event.effects
      
      // 产量影响
      if (effects.yieldMultiplier) {
        if (!effects.affectedCrops || effects.affectedCrops.includes(cropType)) {
          yieldMultiplier *= effects.yieldMultiplier
        }
      }
      
      // 价格影响
      if (effects.priceMultiplier) {
        if (!effects.targetCrop || 
            effects.targetCrop === cropType || 
            (Array.isArray(effects.targetCrop) && effects.targetCrop.includes(cropType))) {
          priceMultiplier *= effects.priceMultiplier
        }
      }
      
      // 成本影响
      if (effects.costMultiplier) {
        costMultiplier *= effects.costMultiplier
      }
    })
    
    return {
      yieldMultiplier: Math.round(yieldMultiplier * 100) / 100,
      priceMultiplier: Math.round(priceMultiplier * 100) / 100,
      costMultiplier: Math.round(costMultiplier * 100) / 100
    }
  }

  // 获取当前天气状况
  getCurrentWeather() {
    return this.weatherConditions.current
  }

  // 获取天气预报
  getWeatherForecast() {
    return this.weatherConditions.forecast
  }

  // 获取活跃事件列表
  getActiveEvents() {
    return this.activeEvents.map(event => ({
      name: event.name,
      description: event.description,
      icon: event.icon,
      remainingDuration: event.remainingDuration,
      startYear: event.startYear
    }))
  }

  // 获取事件历史
  getEventHistory(limit = 10) {
    return this.eventHistory
      .slice(-limit)
      .reverse()
      .map(event => ({
        name: event.name,
        description: event.description,
        icon: event.icon,
        triggeredAt: event.triggeredAt,
        startYear: event.startYear
      }))
  }

  // 模拟特定事件（用于测试）
  simulateEvent(eventId) {
    const event = this.events[eventId]
    if (event) {
      return this.triggerEvent(eventId, event)
    }
    return null
  }

  update(deltaTime) {
    // 可以在这里添加实时天气变化逻辑
  }

  getState() {
    return {
      activeEvents: this.activeEvents,
      eventHistory: this.eventHistory,
      weatherConditions: this.weatherConditions,
      availableEvents: Object.keys(this.events)
    }
  }
}
