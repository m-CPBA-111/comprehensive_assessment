// UI管理器 - 处理用户界面交互
export class UIManager {
  constructor(game) {
    this.game = game
    this.currentTab = 'planting'
    this.selectedPlot = null
    this.selectedCrop = null
    this.elements = {}
    
    this.initializeElements()
    this.setupEventListeners()
  }

  init() {
    console.log('🎮 UI管理器初始化...')
    this.updateDisplay()
  }

  initializeElements() {
    // 获取主要UI元素
    this.elements = {
      currentYear: document.getElementById('current-year'),
      currentMoney: document.getElementById('current-money'),
      gameSpeed: document.getElementById('game-speed'),
      pauseBtn: document.getElementById('pause-btn'),
      speed1x: document.getElementById('speed-1x'),
      speed2x: document.getElementById('speed-2x'),
      speed4x: document.getElementById('speed-4x'),
      farmCanvas: document.getElementById('farm-canvas'),
      cropSelection: document.getElementById('crop-selection'),
      plotInfo: document.getElementById('plot-info'),
      priceChart: document.getElementById('price-chart'),
      marketForecast: document.getElementById('market-forecast'),
      greenhouseStatus: document.getElementById('greenhouse-status'),
      facilityUpgrades: document.getElementById('facility-upgrades'),
      annualReport: document.getElementById('annual-report'),
      profitAnalysis: document.getElementById('profit-analysis')
    }
  }

  setupEventListeners() {
    // 游戏控制按钮
    this.elements.pauseBtn?.addEventListener('click', () => this.togglePause())
    this.elements.speed1x?.addEventListener('click', () => this.setGameSpeed(1))
    this.elements.speed2x?.addEventListener('click', () => this.setGameSpeed(2))
    this.elements.speed4x?.addEventListener('click', () => this.setGameSpeed(4))

    // 标签页切换
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab)
      })
    })

    // 农场画布点击事件
    this.elements.farmCanvas?.addEventListener('click', (e) => {
      this.handleCanvasClick(e)
    })

    // 作物选择事件
    document.addEventListener('click', (e) => {
      if (e.target.closest('.crop-card')) {
        this.selectCrop(e.target.closest('.crop-card').dataset.crop)
      }
    })
  }

  togglePause() {
    if (this.game.isPaused) {
      this.game.resumeGame()
      this.elements.pauseBtn.textContent = '暂停'
    } else {
      this.game.pauseGame()
      this.elements.pauseBtn.textContent = '继续'
    }
  }

  setGameSpeed(speed) {
    this.game.setGameSpeed(speed)
    
    // 更新按钮状态
    document.querySelectorAll('#speed-1x, #speed-2x, #speed-4x').forEach(btn => {
      btn.classList.remove('active')
    })
    
    const speedBtn = document.getElementById(`speed-${speed}x`)
    if (speedBtn) speedBtn.classList.add('active')
  }

  switchTab(tabName) {
    this.currentTab = tabName
    
    // 更新标签按钮状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active')
    })
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active')
    
    // 显示对应的标签页内容
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.remove('active')
    })
    document.getElementById(`${tabName}-tab`)?.classList.add('active')
    
    // 更新标签页内容
    this.updateTabContent(tabName)
  }

  handleCanvasClick(event) {
    const canvas = this.elements.farmCanvas
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    // 检查点击的是哪个地块
    const plotId = this.getPlotAtPosition(x, y)
    if (plotId !== null) {
      this.selectPlot(plotId)
    }
  }

  getPlotAtPosition(x, y) {
    const plots = this.game.landSystem.plots
    
    for (let i = 0; i < plots.length; i++) {
      const plot = plots[i]
      const pos = plot.position
      
      if (x >= pos.x && x <= pos.x + pos.width &&
          y >= pos.y && y <= pos.y + pos.height) {
        return i
      }
    }
    
    return null
  }

  selectPlot(plotId) {
    this.selectedPlot = plotId
    this.updatePlotInfo()
    
    // 如果选择了作物且地块可用，则种植
    if (this.selectedCrop && this.game.landSystem.canPlantCrop(plotId, this.selectedCrop)) {
      this.plantCropOnPlot(plotId, this.selectedCrop)
    }
  }

  selectCrop(cropType) {
    this.selectedCrop = cropType
    
    // 更新作物选择UI
    document.querySelectorAll('.crop-card').forEach(card => {
      card.classList.remove('selected')
    })
    document.querySelector(`[data-crop="${cropType}"]`)?.classList.add('selected')
    
    this.updateCropSelection()
  }

  plantCropOnPlot(plotId, cropType) {
    const cost = this.game.cropSystem.calculatePlantingCost(cropType, 
      this.game.landSystem.plots[plotId].size)
    
    if (this.game.spendMoney(cost)) {
      if (this.game.landSystem.plantCrop(plotId, cropType, this.game.currentYear)) {
        this.game.cropSystem.planPlanting(plotId, cropType, new Date())
        console.log(`🌱 在地块${plotId}种植了${cropType}`)
        this.updateDisplay()
      }
    } else {
      alert('资金不足，无法种植！')
    }
  }

  updateDisplay() {
    this.updateGameInfo()
    this.updateTabContent(this.currentTab)
  }

  updateGameInfo() {
    if (this.elements.currentYear) {
      this.elements.currentYear.textContent = `${this.game.currentYear}年`
    }
    
    if (this.elements.currentMoney) {
      this.elements.currentMoney.textContent = `💰 ¥${this.game.money.toLocaleString()}`
    }
    
    this.updateGameSpeed()
  }

  updateGameSpeed() {
    if (this.elements.gameSpeed) {
      if (this.game.isPaused) {
        this.elements.gameSpeed.textContent = '⏸️ 已暂停'
      } else {
        this.elements.gameSpeed.textContent = `⏱️ ${this.game.gameSpeed}x速度`
      }
    }
  }

  updateMoney() {
    this.updateGameInfo()
  }

  updateTabContent(tabName) {
    switch (tabName) {
      case 'planting':
        this.updatePlantingTab()
        break
      case 'market':
        this.updateMarketTab()
        break
      case 'facilities':
        this.updateFacilitiesTab()
        break
      case 'reports':
        this.updateReportsTab()
        break
    }
  }

  updatePlantingTab() {
    this.updateCropSelection()
    this.updatePlotInfo()
  }

  updateCropSelection() {
    if (!this.elements.cropSelection) return
    
    const plotType = this.selectedPlot !== null ? 
      this.game.landSystem.plots[this.selectedPlot].type : 'plain'
    
    const availableCrops = this.game.cropSystem.getAvailableCrops(plotType)
    
    this.elements.cropSelection.innerHTML = availableCrops.map(crop => `
      <div class="crop-card ${crop.id === this.selectedCrop ? 'selected' : ''}" 
           data-crop="${crop.id}">
        <div class="crop-icon">${crop.icon}</div>
        <div class="crop-name">${crop.name}</div>
        <div class="crop-price">¥${crop.basePrice}/kg</div>
        <div class="crop-cost">成本: ¥${crop.baseCost}/亩</div>
      </div>
    `).join('')
  }

  updatePlotInfo() {
    if (!this.elements.plotInfo) return
    
    if (this.selectedPlot === null) {
      this.elements.plotInfo.innerHTML = '<p>请点击地块查看详情</p>'
      return
    }
    
    const plotInfo = this.game.landSystem.getPlotInfo(this.selectedPlot)
    const plantingStatus = this.game.cropSystem.getPlantingStatus(this.selectedPlot)
    
    let html = `
      <h4>地块 #${plotInfo.id + 1}</h4>
      <p><strong>大小:</strong> ${plotInfo.size} 亩</p>
      <p><strong>类型:</strong> ${this.getPlotTypeName(plotInfo.type)}</p>
      <p><strong>土壤质量:</strong> ${plotInfo.soilQuality}%</p>
    `
    
    if (plantingStatus) {
      html += `
        <div class="current-crop">
          <h5>当前作物: ${plantingStatus.cropIcon} ${plantingStatus.cropName}</h5>
          <div class="growth-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${plantingStatus.growthStage}%"></div>
            </div>
            <span>${plantingStatus.growthStage.toFixed(1)}%</span>
          </div>
          <p>剩余天数: ${plantingStatus.daysRemaining}天</p>
          ${plantingStatus.isReady ? '<button class="harvest-btn">收获</button>' : ''}
        </div>
      `
    } else {
      html += '<p><strong>状态:</strong> 空闲</p>'
      
      if (plotInfo.needsLegume) {
        html += '<p class="warning">⚠️ 需要种植豆类作物进行轮作</p>'
      }
    }
    
    this.elements.plotInfo.innerHTML = html
  }

  updateMarketTab() {
    this.updatePriceChart()
    this.updateMarketForecast()
  }

  updatePriceChart() {
    if (!this.elements.priceChart) return
    
    const marketStatus = this.game.economicSystem.getMarketStatus()
    
    let html = '<h4>当前市场价格</h4><div class="price-list">'
    
    for (const [crop, status] of Object.entries(marketStatus)) {
      const trendIcon = status.trend === 'rising' ? '📈' : 
                       status.trend === 'falling' ? '📉' : '➖'
      
      html += `
        <div class="price-item">
          <span class="crop-name">${status.name}</span>
          <span class="price">¥${status.currentPrice.toFixed(2)}/kg</span>
          <span class="trend">${trendIcon}</span>
        </div>
      `
    }
    
    html += '</div>'
    this.elements.priceChart.innerHTML = html
  }

  updateMarketForecast() {
    if (!this.elements.marketForecast) return
    
    // 显示活跃的随机事件
    const activeEvents = this.game.randomEventSystem.getActiveEvents()
    
    let html = '<h4>市场动态</h4>'
    
    if (activeEvents.length > 0) {
      html += '<div class="active-events">'
      activeEvents.forEach(event => {
        html += `
          <div class="event-item">
            <span class="event-icon">${event.icon}</span>
            <div class="event-details">
              <strong>${event.name}</strong>
              <p>${event.description}</p>
              <small>剩余 ${event.remainingDuration} 个周期</small>
            </div>
          </div>
        `
      })
      html += '</div>'
    } else {
      html += '<p>当前没有特殊市场事件</p>'
    }
    
    this.elements.marketForecast.innerHTML = html
  }

  updateFacilitiesTab() {
    this.updateGreenhouseStatus()
  }

  updateGreenhouseStatus() {
    if (!this.elements.greenhouseStatus) return
    
    const greenhouses = this.game.landSystem.greenhouses
    
    let html = '<h4>大棚状态</h4><div class="greenhouse-list">'
    
    greenhouses.forEach(greenhouse => {
      html += `
        <div class="facility-item">
          <h5>大棚 #${greenhouse.id + 1} (${greenhouse.type === 'smart' ? '智慧' : '普通'})</h5>
          <p>大小: ${greenhouse.size} 亩</p>
          <p>效率: ${(greenhouse.efficiency * 100)}%</p>
          <p>年维护成本: ¥${greenhouse.maintenanceCost}</p>
          <p>状态: ${greenhouse.currentCrop ? '使用中' : '空闲'}</p>
        </div>
      `
    })
    
    html += '</div>'
    this.elements.greenhouseStatus.innerHTML = html
  }

  updateReportsTab() {
    this.updateAnnualReport()
  }

  updateAnnualReport() {
    if (!this.elements.annualReport) return
    
    const yearlySummary = this.game.cropSystem.getYearlySummary()
    
    let html = `
      <h4>${this.game.currentYear}年经营报告</h4>
      <div class="report-summary">
        <div class="metric">
          <label>总收获次数:</label>
          <value>${yearlySummary.totalHarvests}</value>
        </div>
        <div class="metric">
          <label>总产量:</label>
          <value>${yearlySummary.totalYield.toLocaleString()} kg</value>
        </div>
        <div class="metric">
          <label>总收入:</label>
          <value>¥${yearlySummary.totalRevenue.toLocaleString()}</value>
        </div>
        <div class="metric">
          <label>总成本:</label>
          <value>¥${yearlySummary.totalCost.toLocaleString()}</value>
        </div>
        <div class="metric">
          <label>净利润:</label>
          <value class="${yearlySummary.totalProfit >= 0 ? 'positive' : 'negative'}">
            ¥${yearlySummary.totalProfit.toLocaleString()}
          </value>
        </div>
        <div class="metric">
          <label>利润率:</label>
          <value>${yearlySummary.profitMargin}%</value>
        </div>
      </div>
    `
    
    if (Object.keys(yearlySummary.cropStats).length > 0) {
      html += '<h5>作物统计</h5><div class="crop-stats">'
      
      for (const [crop, stats] of Object.entries(yearlySummary.cropStats)) {
        html += `
          <div class="crop-stat-item">
            <strong>${stats.name}</strong>
            <p>种植次数: ${stats.count}</p>
            <p>产量: ${stats.yield.toLocaleString()} kg</p>
            <p>利润: ¥${stats.profit.toLocaleString()}</p>
          </div>
        `
      }
      
      html += '</div>'
    }
    
    this.elements.annualReport.innerHTML = html
  }

  getPlotTypeName(type) {
    const names = {
      'plain': '平原地',
      'field': '耕田',
      'hill': '山坡地',
      'wetland': '水洼地'
    }
    return names[type] || type
  }

  showYearlyReport(report) {
    // 可以实现一个模态对话框显示年度报告
    console.log('📊 年度报告:', report)
    alert(`${report.year}年度报告\n净利润: ¥${report.profit.net.toLocaleString()}\n利润率: ${report.profit.margin}%`)
  }

  showGameEndScreen(finalScore) {
    // 实现游戏结束画面
    console.log('🎉 游戏结束，最终得分:', finalScore)
    alert(`游戏结束！\n最终得分: ${finalScore.toLocaleString()}分\n感谢您的游玩！`)
  }

  update() {
    // 更新动态UI元素
    if (this.currentTab === 'planting') {
      this.updatePlotInfo()
    }
  }
}
