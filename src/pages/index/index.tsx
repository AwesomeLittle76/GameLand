import React from 'react'
import {useNavigate} from "react-router-dom";


const Index = () => {
  const nav = useNavigate();

  return (<div className='p-4'>

    <h1>My Game Land</h1>

    <div className='mt-4'>
      <ul>
        <li>
          <button className='underline text-blue-400' type='button' onClick={() => nav('/minesweeper')}>
            - MineSweeper
          </button>
        </li>
      </ul>
    </div>

  </div>)
}

export default Index
