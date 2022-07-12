import {useRef, useState} from "react";
import {BlockState} from "@/pages/minesweeper/type";
import {randomInt} from "@/utils/random";

const directions = [
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
]

type GameStatus = 'ready' | 'play' | 'won' | 'lost'

interface GameState {
  board: BlockState[][]
  mineGenerated: boolean
  status: GameStatus
  startMS?: number
  endMS?: number
}

export class GamePlay {
  gameState = useRef<GameState>({} as GameState)

  // random: ReturnType<typeof createSeedrandom>

  constructor(
    public width: number,
    public height: number,
    public mines: number,
  ) {
    this.reset()
  }

  get board() {
    return this.gameState?.current.board
  }

  get blocks() {
    return this.gameState.current?.board.flat() as BlockState[]
  }

  reset(
    width = this.width,
    height = this.height,
    mines = this.mines,
  ) {
    this.width = width
    this.height = height
    this.mines = mines

    this.gameState.current = {
      mineGenerated: false,
      status: 'ready',
      board: Array.from({length: this.height}, (_, y) =>
        Array.from({length: this.width},
          (_, x): BlockState => ({
            x,
            y,
            mine: Math.random() < 0.2,
            revealed: false,
            adjacentMines: 0
          }),
        ),
      ),
    }
  }

  randomRange(min: number, max: number) {
    return Math.random() * (max - min) + min
  }

  randomInt(min: number, max: number) {
    return Math.round(this.randomRange(min, max))
  }

  generateMines(state: BlockState[][], initial: BlockState) {
    const placeRandom = () => {
      const x = this.randomInt(0, this.width - 1)
      const y = this.randomInt(0, this.height - 1)
      const block = state[y][x]
      if (Math.abs(initial.x - block.x) <= 1 && Math.abs(initial.y - block.y) <= 1)
        return false
      if (block.mine)
        return false
      block.mine = true
      return true
    }
    Array.from({length: this.mines}, () => null)
      .forEach(() => {
        let placed = false
        while (!placed)
          placed = placeRandom()
      })
    this.updateNumbers()
  }

  updateNumbers() {
    this.board.forEach((raw) => {
      raw.forEach((block) => {
        if (block.mine)
          return
        this.getSiblings(block)
          .forEach((b) => {
            if (b.mine)
              block.adjacentMines += 1
          })
      })
    })
  }

  expendZero(block: BlockState) {
    if (block.adjacentMines)
      return

    this.getSiblings(block)
      .forEach((s) => {
        if (!s.revealed) {
          if (!s.flagged)
            s.revealed = true
          this.expendZero(s)
        }
      })
  }

  onRightClick(block: BlockState) {
    if (this.gameState?.current.status !== 'play')
      return

    if (block.revealed)
      return
    block.flagged = !block.flagged
  }

  // onClick(block: BlockState) {
  //   if (this.gameState?.current.status === 'ready') {
  //     this.gameState?.current.status = 'play'
  //     this.gameState?.current.startMS = +new Date()
  //   }
  //   if (this.gameState?.current.status !== 'play' || block.flagged)
  //     return
  //
  //   if (!this.gameState?.current.mineGenerated) {
  //     this.generateMines(this.board, block)
  //     this.gameState?.current.mineGenerated = true
  //   }
  //
  //   block.revealed = true
  //   if (block.mine) {
  //     this.onGameOver('lost')
  //     return
  //   }
  //
  //   this.expendZero(block)
  // }

  getSiblings(block: BlockState) {
    return directions.map(([dx, dy]) => {
      const x2 = block.x + dx
      const y2 = block.y + dy
      if (x2 < 0 || x2 >= this.width || y2 < 0 || y2 >= this.height)
        return undefined
      return this.board[y2][x2]
    })
      .filter(Boolean) as BlockState[]
  }

  showAllMines() {
    this.board.flat().forEach((i) => {
      if (i.mine)
        i.revealed = true
    })
  }

  checkGameState() {
    if (!this.gameState?.current.mineGenerated || this.gameState?.current.status !== 'play')
      return
    const blocks = this.board.flat()

    if (!blocks.some(block => !block.mine && !block.revealed))
      this.onGameOver('won')
  }

  autoExpand(block: BlockState) {
    if (this.gameState?.current.status !== 'play' || block.flagged)
      return

    const siblings = this.getSiblings(block)
    const flags = siblings.reduce((a, b) => a + (b.flagged ? 1 : 0), 0)
    const notRevealed = siblings.reduce((a, b) => a + (!b.revealed && !b.flagged ? 1 : 0), 0)
    if (flags === block.adjacentMines) {
      siblings.forEach((i) => {
        if (i.revealed || i.flagged)
          return
        i.revealed = true
        this.expendZero(i)
        if (i.mine)
          this.onGameOver('lost')
      })
    }
    const missingFlags = block.adjacentMines - flags
    if (notRevealed === missingFlags) {
      siblings.forEach((i) => {
        if (!i.revealed && !i.flagged)
          i.flagged = true
      })
    }
  }

  onGameOver(status: GameStatus) {
    if (this.gameState) {
      this.gameState?.current.status = status
      this.gameState?.current.endMS = +Date.now()
      if (status === 'lost') {
        this.showAllMines()
        setTimeout(() => {
          alert('lost')
        }, 10)
      }
    }
  }
}
