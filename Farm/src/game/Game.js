// 游戏主类 - 统筹所有游戏系统
import { LandSystem } from './systems/LandSystem.js'
import { CropSystem } from './systems/CropSystem.js'
import { EconomicSystem } from './systems/EconomicSystem.js'
import { RandomEventSystem } from './systems/RandomEventSystem.js'
import { UIManager } from './ui/UIManager.js'
import { Renderer } from './rendering/Renderer.js'

export class Game {
  constructor() {
    // 游戏状态
    this.currentYear = 2024
    this.gameSpeed = 1 // 1x, 2x, 4x
    this.isPaused = false
    this.money = 100000 // 初始资金 10万元
    
    // 游戏系统
    this.landSystem = new LandSystem()
    this.cropSystem = new CropSystem()
    this.economicSystem = new EconomicSystem()
    this.randomEventSystem = new RandomEventSystem()
    
    // UI和渲染
    this.uiManager = new UIManager(this)
    this.renderer = new Renderer()
    
    // 游戏循环
    this.lastTime = 0
    this.gameLoop = this.gameLoop.bind(this)
    
    console.log('🌾 乡村农场大亨游戏初始化完成')
  }

  init() {
    console.log('🚀 启动游戏...')
    
    // 初始化各个系统
    this.landSystem.init()
    this.cropSystem.init()
    this.economicSystem.init()
    this.randomEventSystem.init()
    
    // 初始化UI和渲染器
    this.uiManager.init()
    this.renderer.init()
    
    // 开始游戏循环
    this.startGameLoop()
    
    console.log('✅ 游戏启动成功!')
  }

  startGameLoop() {
    this.lastTime = performance.now()
    requestAnimationFrame(this.gameLoop)
  }

  gameLoop(currentTime) {
    const deltaTime = currentTime - this.lastTime
    this.lastTime = currentTime

    if (!this.isPaused) {
      // 更新游戏逻辑 (考虑游戏速度)
      const adjustedDelta = deltaTime * this.gameSpeed
      this.update(adjustedDelta)
    }

    // 渲染游戏画面
    this.render()

    // 继续循环
    requestAnimationFrame(this.gameLoop)
  }

  update(deltaTime) {
    // 更新各个系统
    this.landSystem.update(deltaTime)
    this.cropSystem.update(deltaTime)
    this.economicSystem.update(deltaTime)
    this.randomEventSystem.update(deltaTime)
    
    // 检查年份推进
    this.checkYearProgression()
    
    // 更新UI
    this.uiManager.update()
  }

  render() {
    // 渲染农场场景
    this.renderer.render(this.landSystem, this.cropSystem)
  }

  checkYearProgression() {
    // 这里可以实现年份推进逻辑
    // 目前简化处理，实际游戏中可能基于月份或季节
  }

  // 游戏控制方法
  pauseGame() {
    this.isPaused = true
    this.uiManager.updateGameSpeed()
  }

  resumeGame() {
    this.isPaused = false
    this.uiManager.updateGameSpeed()
  }

  setGameSpeed(speed) {
    this.gameSpeed = speed
    this.uiManager.updateGameSpeed()
  }

  // 经济相关方法
  addMoney(amount) {
    this.money += amount
    this.uiManager.updateMoney()
  }

  spendMoney(amount) {
    if (this.money >= amount) {
      this.money -= amount
      this.uiManager.updateMoney()
      return true
    }
    return false
  }

  // 获取游戏状态
  getGameState() {
    return {
      year: this.currentYear,
      money: this.money,
      isPaused: this.isPaused,
      gameSpeed: this.gameSpeed,
      landSystem: this.landSystem.getState(),
      cropSystem: this.cropSystem.getState(),
      economicSystem: this.economicSystem.getState()
    }
  }

  // 年度结算
  endOfYear() {
    this.currentYear++
    
    // 执行年度结算
    const yearlyReport = this.economicSystem.calculateYearlyReport(
      this.cropSystem.getHarvestData(),
      this.landSystem.getFacilityData()
    )
    
    // 更新资金
    this.addMoney(yearlyReport.profit)
    
    // 触发随机事件
    this.randomEventSystem.triggerYearlyEvents()
    
    // 重置作物系统
    this.cropSystem.resetForNewYear()
    
    // 更新UI显示年度报告
    this.uiManager.showYearlyReport(yearlyReport)
    
    // 检查游戏结束条件 (2030年)
    if (this.currentYear > 2030) {
      this.endGame()
    }
  }

  endGame() {
    console.log('🎉 游戏结束!')
    const finalScore = this.economicSystem.calculateFinalScore()
    this.uiManager.showGameEndScreen(finalScore)
  }
}
