import React, {useEffect, useState} from 'react'
import {Icon} from '@iconify/react';
import {BlockState} from "@/pages/minesweeper/type";
import {loadConfigFromFile} from "vite";
import Popover from "@/components/popover";


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

let boardState: boolean[][] = []

const MineSweeper = () => {

  const [level, setLevel] = useState<number>(1)
  const [board, setBoard] = useState<BlockState[][]>([])
  const [visible, setVisible] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>()

  useEffect(() => {
    const originalBoard = Array.from({length: level + 1}, (_, y) =>
      Array.from({length: level + 1},
        (_, x): BlockState => ({
          x,
          y,
          mine: Math.random() < 0.2,
          revealed: false,
          adjacentMines: 0
        })
      ))

    originalBoard.forEach((row, x) => {
      row.forEach((block, y) => {
        if (block.mine)
          return
        directions.forEach(([dx, dy]) => {
          const x2 = x + dx
          const y2 = y + dy
          if (x2 < 0 || x2 >= level + 1 || y2 < 0 || y2 >= level + 1)
            return
          if (originalBoard[x2][y2].mine)
            block.adjacentMines += 1
        })
      })
    })

    setBoard(originalBoard)

    const tempState: boolean[][] = new Array(level + 1).fill(0).map(() => new Array(level + 1).fill(false))
    boardState = [...tempState]
  }, [level])


  useEffect(() => {
    if (success !== undefined) return
    const originalBoard = Array.from({length: level + 1}, (_, y) =>
      Array.from({length: level + 1},
        (_, x): BlockState => ({
          x,
          y,
          mine: Math.random() < 0.2,
          revealed: false,
          adjacentMines: 0
        })
      ))

    originalBoard.forEach((row, x) => {
      row.forEach((block, y) => {
        if (block.mine)
          return
        directions.forEach(([dx, dy]) => {
          const x2 = x + dx
          const y2 = y + dy
          if (x2 < 0 || x2 >= level + 1 || y2 < 0 || y2 >= level + 1)
            return
          if (originalBoard[x2][y2].mine)
            block.adjacentMines += 1
        })
      })
    })

    setBoard(originalBoard)

    const tempState: boolean[][] = new Array(level + 1).fill(0).map(() => new Array(level + 1).fill(false))
    boardState = [...tempState]
  }, [success])

  const getSiblings = (i: number, j: number) => {
    return directions.map(([dx, dy]) => {
      const x2 = i + dx
      const y2 = j + dy
      if (x2 < 0 || x2 >= level + 1 || y2 < 0 || y2 >= level + 1)
        return undefined
      return board[y2][x2]
    })
      .filter(Boolean) as BlockState[]
  }

  const exploreZero = (i: number, j: number) => {
    if (board[i][j].adjacentMines)
      return

    const res = getSiblings(i, j)

    res.forEach((s) => {
      if (boardState[s.x][s.y])
        return
      boardState[s.x][s.y] = true
      exploreZero(s.x, s.y)
    })
  }

  const checkResult = () => {
    for (const row of board) {
      for (const item of row) {
        // 数字
        if (!item.mine && !item.revealed) return false
        // 地雷
        if (item.mine && !item.flagged) return false
        if (!item.mine && item.flagged) return false
      }
    }
    return true
  }


  const getClassByBlock = (block: BlockState) => {
    if (block.mine)
      return 'text-amber-800 border-amber-800'
  }

  const onClickBlock = (i: number, j: number) => {
    boardState[i][j] = true
    const block = board[i][j]
    block.revealed = true
    if (block.adjacentMines === 0) {
      exploreZero(i, j)
    }
    if (block.mine){
      setSuccess(false)
      setVisible(true)
    }

    const temp = [...board]
    temp.forEach((row, x) => {
      row.forEach((s, y) => {
        // 状态上被标记，但没有插旗
        if (boardState[x][y] && !temp[x][y].flagged)
          s.revealed = boardState[x][y]
      })
    })
    setBoard([...temp])
    if (checkResult()) {
      setSuccess(true)
      setVisible(true)
    }

    // if (block.mine) block.revealed = true
    // else {
    //   if (block.adjacentMines === 0)
    //     exploreZero(i, j)
    //   else
    //     block.revealed = true
    // }
    // setBoard([...board])
  }

  const onContextMenuBlock = (i: number, j: number) => {
    boardState[i][j] = !boardState[i][j]

    const temp = [...board]
    const block = temp[i][j]
    block.flagged = boardState[i][j]
    setBoard([...temp])

    if (checkResult()) {
      setSuccess(true)
      setVisible(true)
    }
  }


  return (
    <div className='px-4 py-6 flex flex-col items-center'>
      <Popover visible={visible}>
        <p>{success ? 'You win' : 'You loose'}</p>
        <div className="flex justify-end items-center mt-16">
          <button type="button"
                  onClick={() => {
                    setVisible(false)
                    setLevel(success ? level + 1 : level)
                    setSuccess(undefined)
                  }}
                  className="bg-sky-300 text-white px-8 py-1 rounded mr-4"
          >
            {success ? 'Next Level' : 'Restart'}
          </button>

        </div>

      </Popover>
      <h1 className='font-semibold mb-2'>猫砂Keeper</h1>
      <div className='flex mb-4'>
        <p>Level：{level}</p>
        {/*<button type='button' onClick={() => {*/}
        {/*  setLevel(level + 1)*/}
        {/*}}>*/}
        {/*  next*/}
        {/*</button>*/}
      </div>
      <div className='mt-4'>
        {
          board.map((row, i) =>
            <div className='flex' key={`${i * i}`}>
              {
                row.map((block, j) =>
                  (
                    block.revealed ?
                      <div
                        key={`${i * 10 + j}`}
                        className={`${getClassByBlock(block)} border h-8 w-8 flex justify-center items-center ml-1 mb-1 pointer-events-none`}>
                        {block.mine
                          ? <Icon icon="mdi:emoticon-poop" />
                          : block.adjacentMines
                        }
                      </div> :
                      block.flagged ?
                        <div
                          key={`${i * 10 + j}`}
                          className='h-8 w-8 bg-black bg-opacity-10 ml-1 mb-1 flex justify-center items-center cursor-pointer'
                          onContextMenu={() => {
                            onContextMenuBlock(i, j)
                          }}
                        >
                          <Icon icon="icon-park-outline:shovel-one" />
                        </div>
                        :
                        <div
                          key={`${i * 10 + j}`}
                          className='h-8 w-8 bg-black bg-opacity-10 ml-1 mb-1 cursor-pointer'
                          onClick={() => onClickBlock(i, j)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            onContextMenuBlock(i, j)
                          }}
                        >
                          {/*{block.mine*/}
                          {/*  ? <Icon icon="mdi:emoticon-poop" />*/}
                          {/*  : block.adjacentMines*/}
                          {/*}*/}
                        </div>
                  )
                )
              }
            </div>
          )
        }
      </div>
    </div>
  )
}

export default MineSweeper
