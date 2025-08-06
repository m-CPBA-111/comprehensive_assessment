// 乡村农场大亨 - 主程序入口
import './style.css'
import { Game } from './game/Game.js'

// 初始化游戏
const game = new Game()

// 页面加载完成后启动游戏
document.addEventListener('DOMContentLoaded', () => {
  game.init()
})
